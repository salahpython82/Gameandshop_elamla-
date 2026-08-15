import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "5mb" }));

  // Helper for Fallback Questions if GEMINI_API_KEY is missing or fails
  const getFallbackQuizQuestions = (topic: string, count: number = 5) => {
    const fallbackPool = [
      {
        id: `fb-coin-1-${Date.now()}`,
        question: `من هو الملك النوميدي الذي سَكّ عملة برونزية شهيرة تحمل صورته مع الحصان الأمازيغي في عاصمة سيرتا؟`,
        options: ["الملك ماسينيسا", "الملك يوغرطة", "الملك يوبا الثاني", "الملك سيفاكس"],
        correctAnswer: 0,
        hint: "مؤسس مملكة نوميديا الموحدة وصاحب عاصمة قسنطينة.",
        explanation: "الملك ماسينيسا (238-148 ق.م) سك مسكوكات نوميدية برونزية وفضية شهيرة متداولة عبر شمال إفريقيا.",
        category: topic || "algerian_coins",
      },
      {
        id: `fb-coin-2-${Date.now()}`,
        question: `ما هي العملة الوطنية الرسمية للجمهورية الجزائرية التي تأسست سنة 1964؟`,
        options: ["الدينار الجزائري (DZD)", "الدرهم المغاربي", "الفرنك الجزائري", "الريال النوميدي"],
        correctAnswer: 0,
        hint: "رمزها DZD وأنشئت بموجب قانون البنك المركزي الجزائري.",
        explanation: "الدينار الجزائري هو العملة السيادية الوطنية الصادرة رسمياً منذ 10 أفريل 1964.",
        category: topic || "modern_algerian_dinar",
      },
      {
        id: `fb-coin-3-${Date.now()}`,
        question: `ما هو اسم العملة التاريخية التي سكها الأمير عبد القادر في عاصمته تاقدمت؟`,
        options: ["المحمدية", "القادرية", "السلطانية", "الهاشمية"],
        correctAnswer: 0,
        hint: "سُكت من الفضة والنحاس ونقش عليها اسم النبي محمد ﷺ.",
        explanation: "المحمدية هي عملة الدولة الجزائرية الحديثة التي سكها الأمير عبد القادر لتأكيد الاستقلال المالي والسيادي.",
        category: topic || "ottoman_algiers",
      },
      {
        id: `fb-coin-4-${Date.now()}`,
        question: `من هو الخليفة الأموي الذي قام بأول تعريب شامل للمسكوكات الإسلامية وسك الدينار الذهبي عام 77 هـ؟`,
        options: ["عبد الملك بن مروان", "معاوية بن أبي سفيان", "عمر بن عبد العزيز", "هارون الرشيد"],
        correctAnswer: 0,
        hint: "استبدل الصور الساسانية والبيزنطية بنصوص القرآن الكريم والخط الكوفي.",
        explanation: "سك الخليفة عبد الملك بن مروان أول دينار إسلامي عربي خالص عام 77 هـ بنقاء ذهبي فائق.",
        category: topic || "islamic_coins",
      },
      {
        id: `fb-coin-5-${Date.now()}`,
        question: `ما هو 'الدينار المرابطي' (المارابوتين) الذي حظي بثقة تجار البحر الأبيض المتوسط في العصور الوسطى؟`,
        options: ["دينار ذهبي عالي النقاوة سكه المرابطون", "عملة برونزية بيزنطية", "درهم رديء", "سند بحري"],
        correctAnswer: 0,
        hint: "سُك في تلمسان وسجلماسة والأندلس واعتبر العملة العالمية الأولى في عصره.",
        explanation: "الدينار المرابطي الذهبي كان العملة الذهبية الأكثر موثوقية في حوض المتوسط وأوروبا لعقود طويلة.",
        category: topic || "andalus_maghreb_roman",
      },
      {
        id: `fb-coin-6-${Date.now()}`,
        question: `ما هو الحيوان المنقوش على القطعة المعدنية الجزائرية الشهيرة من فئة 5 دنانير؟`,
        options: ["الفيل الإفريقي الأثري", "الأسد الأمازيغي", "الغزال الصحراوي", "الحصان العربي"],
        correctAnswer: 0,
        hint: "رمز تاريخي استُخدم في جيوش شمال إفريقيا والحروب البونية.",
        explanation: "تحمل قطعة 5 دنانير جزائرية نقش الفيل الإفريقي الأثري تخليداً لتاريخ المنطقة القديم.",
        category: topic || "modern_algerian_dinar",
      },
    ];

    // Return requested count
    return fallbackPool.slice(0, count);
  };

  // Shared Gemini instance getter
  const getGeminiAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // AI Endpoint: Generate Custom Quiz Questions in Arabic
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { topic, category, difficulty = "متوسط", count = 5 } = req.body;
      const promptTopic = topic || category || "النقود والمسكوكات القديمة والعملات الجزائرية عبر التاريخ";

      const ai = getGeminiAI();

      if (!ai) {
        // Fallback gracefully without API key
        console.log("GEMINI_API_KEY not configured. Using high-quality offline quiz generator.");
        const fallbackQuestions = getFallbackQuizQuestions(promptTopic, count);
        return res.json({ success: true, questions: fallbackQuestions, fallback: true });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `أنت خبير ومؤرخ متخصص في علم النميات (Numismatics) وتاريخ القطع النقدية والمسكوكات القديمة بمختلف حقبها، وخصوصاً القطع النقدية الجزائرية عبر التاريخ (نوميديا وسيرتا، الرستميين، الحماديين، الزيانيين بتلمسان، بايلك الجزائر وسلطاني الذهب والبودجو، سكة الأمير عبد القادر المحمدية، والدينار الجزائري الحديث).
قم بإنشاء مجموعة من ${count} أسئلة اختيار من متعدد باللغة العربية الفصحى الدقيقة والممتعة حول الموضوع: "${promptTopic}" بمستوى صعوبة: "${difficulty}".

لكل سؤال:
- نص السؤال (question): دقيق ومشوق حول العملات والمسكوكات وتاريخ السك والشخصيات والرموز.
- 4 خيارات إجابة (options): متميزة ومنطقية.
- المؤشر الصحيح (correctAnswer): الرقم 0 أو 1 أو 2 أو 3.
- تلميح ذكي (hint): ملخص يساعد دون كشف الإجابة مباشرة.
- شرح وتوضيح مفصل (explanation): معلومة تاريخية نمياتية قيّمة وممتعة بعد الإجابة.
- الفئة (category): اسم الفئة باللغة العربية.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswer: { type: Type.INTEGER },
                    hint: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: [
                    "question",
                    "options",
                    "correctAnswer",
                    "hint",
                    "explanation",
                    "category",
                  ],
                },
              },
            },
            required: ["questions"],
          },
        },
      });

      const jsonText = response.text || "{}";
      const data = JSON.parse(jsonText);
      const questionsWithIds = (data.questions || []).map(
        (q: any, idx: number) => ({
          ...q,
          id: q.id || `ai-generated-${Date.now()}-${idx}`,
        })
      );

      res.json({ success: true, questions: questionsWithIds });
    } catch (err: any) {
      console.error("Error generating AI quiz, falling back:", err);
      const fallbackQuestions = getFallbackQuizQuestions(req.body.topic || "عام", req.body.count || 5);
      res.json({ success: true, questions: fallbackQuestions, fallback: true });
    }
  });

  // AI Endpoint: Generate Smart Hint & Detailed Explanation
  app.post("/api/ai/get-hint", async (req, res) => {
    try {
      const { question, options } = req.body;
      const ai = getGeminiAI();

      if (!ai) {
        return res.json({
          success: true,
          hint: "تلميح ذكي: ركّز على استبعاد الخيارين الأكثر استبعاداً، وفكّر في منطق السؤال بعناية!",
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `السؤال: "${question}"
 الخيارات المتاحة: ${options?.join(" | ") || ""}

قدم تلميحاً ذكياً ومشوقاً باللغة العربية لمساعدة اللاعب على استبعاد الإجابات الخاطئة دون إعطائه الإجابة مباشرة، مع تقديم معلومة مشوقة.`,
      });

      res.json({ success: true, hint: response.text });
    } catch (err: any) {
      console.error("Error generating hint, using fallback:", err);
      res.json({
        success: true,
        hint: "تلميح ذكي: ابحث عن الإجابة الأكثر اتساقاً منطقياً مع صيغة السؤال!",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
