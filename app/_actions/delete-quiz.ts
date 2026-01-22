'use server'

import { revalidatePath } from "next/cache";

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