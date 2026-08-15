import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const FALLBACK_QUESTIONS_POOL: Question[] = [
  {
    id: "fb-1",
    question: "من هو الملك النوميدي الذي سَكّ عملة برونزية شهيرة تحمل صورته مع الحصان الأمازيغي الحر؟",
    options: ["الملك ماسينيسا", "الملك يوغرطة", "الملك يوبا الثاني", "الملك سيفاكس"],
    correctAnswer: 0,
    hint: "مؤسس مملكة نوميديا الموحدة وصاحب عاصمة سيرتا (قسنطينة).",
    explanation: "الملك ماسينيسا (238-148 ق.م) سك مسكوكات نوميدية برونزية وفضية شهيرة متداولة عبر شمال إفريقيا.",
    categoryId: "algerian_coins",
  },
  {
    id: "fb-2",
    question: "ما هي العملة الوطنية الرسمية للجمهورية الجزائرية التي تأسست سنة 1964؟",
    options: ["الدينار الجزائري (DZD)", "الدرهم المغاربي", "الفرنك الجزائري", "الريال النوميدي"],
    correctAnswer: 0,
    hint: "رمزها DZD وأنشئت بموجب قانون البنك المركزي الجزائري.",
    explanation: "الدينار الجزائري هو العملة السيادية الوطنية الصادرة منذ 10 أفريل 1964.",
    categoryId: "modern_algerian_dinar",
  },
  {
    id: "fb-3",
    question: "ما هو اسم العملة التاريخية التي سكها الأمير عبد القادر في عاصمته تاقدمت؟",
    options: ["المحمدية", "القادرية", "السلطانية", "الهاشمية"],
    correctAnswer: 0,
    hint: "سُكت من الفضة والنحاس ونقش عليها اسم النبي محمد ﷺ.",
    explanation: "المحمدية هي عملة الدولة الجزائرية الحديثة التي سكها الأمير عبد القادر لتأكيد الاستقلال المالي والسيادي.",
    categoryId: "ottoman_algiers",
  },
  {
    id: "fb-4",
    question: "من هو الخليفة الأموي الذي قام بأول تعريب شامل للمسكوكات الإسلامية وسك الدينار الذهبي عام 77 هـ؟",
    options: ["عبد الملك بن مروان", "معاوية بن أبي سفيان", "عمر بن عبد العزيز", "هارون الرشيد"],
    correctAnswer: 0,
    hint: "استبدل الصور الساسانية والبيزنطية بنصوص القرآن الكريم والخط الكوفي.",
    explanation: "سك الخليفة عبد الملك بن مروان أول دينار إسلامي عربي خالص عام 77 هـ بنقاء ذهبي فائق.",
    categoryId: "islamic_coins",
  },
  {
    id: "fb-5",
    question: "ما هو 'الدينار المرابطي' (المارابوتين) الذي حظي بثقة تجار البحر الأبيض المتوسط في العصور الوسطى؟",
    options: ["دينار ذهبي عالي النقاوة سكه المرابطون", "عملة برونزية بيزنطية", "درهم رديء", "سند بحري"],
    correctAnswer: 0,
    hint: "سُك في تلمسان وسجلماسة والأندلس واعتبر العملة العالمية الأولى في عصره.",
    explanation: "الدينار المرابطي الذهبي كان العملة الذهبية الأكثر موثوقية في حوض المتوسط وأوروبا لعقود طويلة.",
    categoryId: "andalus_maghreb_roman",
  },
];

export async function generateQuizQuestions(topic: string, count: number = 5): Promise<Question[]> {
  try {
    const res = await fetch("/api/ai/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (e) {
    console.warn("API route unavailable, generating via fallback/client logic:", e);
  }

  return FALLBACK_QUESTIONS_POOL.slice(0, count).map((q, idx) => ({
    ...q,
    id: `ai-gen-${Date.now()}-${idx}`,
    categoryId: topic || q.categoryId,
  }));
}

export async function generateAiHint(question: string, options: string[]): Promise<string> {
  try {
    const res = await fetch("/api/ai/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, options }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.hint) return data.hint;
    }
  } catch (e) {
    console.warn("API hint route unavailable:", e);
  }

  return "تلميح ذكي: ابحث عن الخيار الأكثر اتساقاً مع المنطق وسياق السؤال العلمي والتاريخي!";
}
