'use server'

import { Question } from "@/types/Question";

export async function generateAIQuiz(payload: any) {
    try {
        // Timeout maior para IA (60s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { error: "Falha na geração do questionário. Tente novamente." };
        }

        const data = await response.json();

        const processedQuestions = data.questions.map((question: Question) => ({
            id: question.id || `AI_${Date.now()}_${Math.random()}`, // Garante ID
            text: question.text,
            type: question.type,
            timeLimit: question.timeLimit || 30,
            options: question.options,
            correctAnswer: question.correctAnswer
        }));

        return { 
            success: true, 
            data: {
                title: data.title,
                description: data.description,
                questions: processedQuestions
            }
        };

    } catch (error) {
        console.error("AI Generation Error:", error);
        return { error: "Erro de conexão ou tempo limite excedido." };
    }
}