'use server'

import { revalidatePath } from "next/cache";

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