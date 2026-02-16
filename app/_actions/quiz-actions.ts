'use server'

import { revalidatePath } from "next/cache";
import { Question } from "@/types/Question";
import { Quiz } from "@/types/Quiz";

export async function getQuizzes(): Promise<Quiz[]> {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quizzes`,
            {
                method: 'GET',
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            console.error('Failed to fetch quizzes:', res.status);
            return [];
        }

        const data = await res.json();

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        return [];
    }
}

export async function getQuiz(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export async function saveQuiz(data: any, mode: 'create' | 'edit', id?: string) {
    const url = mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/quizzes`
        : `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`;

    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            return { error: "Erro ao salvar questionário." };
        }

        const quiz = await response.json()

        revalidatePath('/'); // Atualiza a lista na home
        return {
            success: true,
            quizId: quiz.id
        };
    } catch (error) {
        return { error: "Erro de conexão." };
    }
}

export async function deleteQuiz(id: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) return { error: "Falha ao excluir." };

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: "Erro ao tentar excluir." };
    }
}


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