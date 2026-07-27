'use server'

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Question } from "@/types/Question";

async function getAuthHeaders() {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

export async function saveQuiz(data: any, mode: 'create' | 'edit', id?: string) {
    const url = mode === 'create'
        ? `${process.env.NEXT_PUBLIC_API_URL}/quizzes`
        : `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`;

    const method = mode === 'create' ? 'POST' : 'PUT';

    try {
        const headers = await getAuthHeaders();
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(data)
        });

        if (response.status === 401) {
            return { error: "Sessão expirada. Faça login novamente.", unauthorized: true };
        }

        if (!response.ok) {
            return { error: "Erro ao salvar questionário." };
        }

        const quiz = await response.json();

        revalidatePath('/quizzes');
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
        const headers = await getAuthHeaders();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (response.status === 401) {
            return { error: "Sessão expirada. Faça login novamente.", unauthorized: true };
        }

        if (!response.ok) return { error: "Falha ao excluir." };

        revalidatePath('/quizzes');
        return { success: true };
    } catch (error) {
        return { error: "Erro ao tentar excluir." };
    }
}

export async function generateAIQuiz(payload: any) {
    try {
        const headers = await getAuthHeaders();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/ai/generate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
            return { error: "Sessão expirada. Faça login novamente.", unauthorized: true };
        }

        if (!response.ok) {
            return { error: "Falha na geração do questionário. Tente novamente." };
        }

        const data = await response.json();

        const processedQuestions = data.questions.map((question: Question) => ({
            id: question.id || `AI_${Date.now()}_${Math.random()}`,
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