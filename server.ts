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
        id: `fb-1-${Date.now()}`,
        question: `ما هو الشيء الذي كلما أخذت منه كَبُر وما هو متعلق بـ (${topic || "الألغاز العامة"})؟`,
        options: ["الحفرة", "العمر", "المعلومة", "البحر"],
        correctAnswer: 0,
        hint: "شيء تجويفي ينقص بالزيادة ويحبس الهواء.",
        explanation: "الحفرة هي الشيء الوحيد الذي كلما أخذت منه أتربة اتسع حجمها وكبرت!",
        category: topic || "ألغاز وذكاء",
      },
      {
        id: `fb-2-${Date.now()}`,
        question: `في أي القارات تقع أغلب الاكتشافات التاريخية والعجائب المتعلقة بـ (${topic || "الثقافة العامة"})؟`,
        options: ["آسيا وإفريقيا", "أوروبا فقط", "أمريكا الشمالية", "أوقيانوسيا"],
        correctAnswer: 0,
        hint: "تضم مهد الحضارات القديمة كالحضارة الفرعونية والبابلية والإسلامية.",
        explanation: "تعتبر قارة آسيا وإفريقيا مهد أغلب الحضارات القديمة كالمصرية والبابليّة والعربية.",
        category: topic || "تاريخ وثقافة",
      },
      {
        id: `fb-3-${Date.now()}`,
        question: `ما هو العنصر الأكثر وفرة في الكون والذي يشكل أساس طاقة النجوم؟`,
        options: ["الهيدروجين", "الأكسجين", "النيتروجين", "الحديد"],
        correctAnswer: 0,
        hint: "هو أخف عنصر في الجدول الدوري وله الذرة الأبسط.",
        explanation: "الهيدروجين يشكل نحو 75% من المادة العادية في الكون وهو وقود الاندماج النووي للشمس.",
        category: topic || "علوم وتكنولوجيا",
      },
      {
        id: `fb-4-${Date.now()}`,
        question: `ما هو الكوكب الذي يطلق عليه اسم الكوكب الأحمر؟`,
        options: ["المريخ", "الزهرة", "المشتري", "زحل"],
        correctAnswer: 0,
        hint: "يليه المشتري ولونه احمر بسبب أكسيد الحديد.",
        explanation: "المريخ يمتلك لونا أحمراً مميزاً بسبب انتشار أكسيد الحديد (الصدأ) على سطحه.",
        category: topic || "علوم وتنافس",
      },
      {
        id: `fb-5-${Date.now()}`,
        question: `شيء يشيخ وينقص عندما يتكلم ويسير بلا أقدام؟`,
        options: ["القلم", "الساعة", "الشمعة", "الظل"],
        correctAnswer: 0,
        hint: "نستخدمه للكتابة والتعبير عما بالداخل.",
        explanation: "القلم يخط الكلمات وينقص حبره وشكله كلما كتب وسطر الحروف!",
        category: topic || "ألغاز ذكية",
      },
      {
        id: `fb-6-${Date.now()}`,
        question: `ما هي أصغر دولة في العالم من حيث المساحة والسكان؟`,
        options: ["الفاتيكان", "موناكو", "سان مارينو", "المالديف"],
        correctAnswer: 0,
        hint: "تقع داخل مدينة روما الإيطالية.",
        explanation: "الفاتيكان هي أصغر دولة في العالم بمساحة لا تتجاوز 0.49 كيلومتر مربع.",
        category: topic || "جغرافيا عامة",
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
      const promptTopic = topic || category || "ثقافة عامة وألغاز ذكاء";

      const ai = getGeminiAI();

      if (!ai) {
        // Fallback gracefully without API key
        console.log("GEMINI_API_KEY not configured. Using high-quality offline quiz generator.");
        const fallbackQuestions = getFallbackQuizQuestions(promptTopic, count);
        return res.json({ success: true, questions: fallbackQuestions, fallback: true });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `أنت خبير في إنشاء المسابقات التعليمية وألعاب الألغاز والذكاء باللغة العربية.
قم بإنشاء مجموعة من ${count} أسئلة اختيار من متعدد باللغة العربية الفصحى الواضحة والممتعة حول الموضوع: "${promptTopic}" بمستوى صعوبة: "${difficulty}".

لكل سؤال:
- نص السؤال (question): واضح ومشوق.
- 4 خيارات إجابة (options): متميزة ومنطقية.
- الموئشر الصحيح (correctAnswer): الرقم 0 أو 1 أو 2 أو 3.
- تلميح ذكي (hint): ملخص يساعد دون كشف الإجابة مباشرة.
- شرح وتوضيح مفصل (explanation): معلومة إضافية قيمة وممتعة بعد الإجابة.
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
