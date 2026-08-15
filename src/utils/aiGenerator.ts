import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

export const FALLBACK_QUESTIONS_POOL: Question[] = [
  {
    id: "fb-1",
    question: "ما هو الشيء الذي كلما أخذت منه كَبُر ووسع حجمه؟",
    options: ["الحفرة", "العمر", "البحر", "الجبل"],
    correctAnswer: 0,
    hint: "شيء تجويفي ينقص سطحه بالزيادة ويحبس الهواء.",
    explanation: "الحفرة هي الشيء الوحيد الذي كلما أخذت منه أتربة اتسع حجمها وكبرت!",
    categoryId: "ألغاز ذكاء",
  },
  {
    id: "fb-2",
    question: "في أي القارات تقع أغلب الاكتشافات التاريخية والآثار القديمة بمصر وبابل؟",
    options: ["إفريقيا وآسيا", "أوروبا فقط", "أمريكا الشمالية", "أوقيانوسيا"],
    correctAnswer: 0,
    hint: "تضم مهد الحضارات القديمة كالحضارة الفرعونية والبابليّة.",
    explanation: "تعتبر قارة آسيا وإفريقيا مهد أغلب الحضارات القديمة كالمصرية والبابليّة والعربية.",
    categoryId: "تاريخ وثقافة",
  },
  {
    id: "fb-3",
    question: "ما هو العنصر الأكثر وفرة في الكون والذي يشكل الوقود الأساسي للنجوم؟",
    options: ["الهيدروجين", "الأكسجين", "النيتروجين", "الحديد"],
    correctAnswer: 0,
    hint: "هو أخف عنصر في الجدول الدوري وله الذرة الأبسط.",
    explanation: "الهيدروجين يشكل نحو 75% من المادة العادية في الكون وهو وقود الاندماج النووي للشمس.",
    categoryId: "علوم وتكنولوجيا",
  },
  {
    id: "fb-4",
    question: "ما هو الكوكب الذي يطلق عليه اسم الكوكب الأحمر؟",
    options: ["المريخ", "الزهرة", "المشتري", "زحل"],
    correctAnswer: 0,
    hint: "يليه المشتري ولونه أحمر بسبب انتشار أكسيد الحديد.",
    explanation: "المريخ يمتلك لونا أحمراً مميزاً بسبب انتشار أكسيد الحديد (الصدأ) على سطحه.",
    categoryId: "علوم وفضاء",
  },
  {
    id: "fb-5",
    question: "ما هي أصغر دولة في العالم من حيث المساحة والسكان؟",
    options: ["الفاتيكان", "موناكو", "سان مارينو", "المالديف"],
    correctAnswer: 0,
    hint: "تقع داخل مدينة روما الإيطالية.",
    explanation: "الفاتيكان هي أصغر دولة في العالم بمساحة لا تتجاوز 0.49 كيلومتر مربع.",
    categoryId: "جغرافيا عامة",
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
