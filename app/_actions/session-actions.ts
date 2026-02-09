'use server'

import { revalidatePath } from "next/cache";

// Busca inicial (Server Side)
export async function getSession(sessionId: string, quizId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/quiz/${quizId}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
}

export async function getPlayers(sessionId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/players`, { cache: 'no-store' });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        return [];
    }
}

export async function kickPlayer(sessionId: string, playerId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/players/${playerId}/kick`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error();
        revalidatePath(`/play`); 
        return { success: true };
    } catch (error) {
        return { error: "Erro ao expulsar jogador." };
    }
}

export async function cancelSession(sessionId: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error();
        return { success: true };
    } catch (error) {
        return { error: "Erro ao cancelar sessão." };
    }
}

export async function startQuiz(sessionId: string) {
    // Implemente a chamada para iniciar o status da sessão no backend, se houver endpoint
    // Caso contrário, apenas retorne sucesso para que o socket emita o evento
    return { success: true };
}