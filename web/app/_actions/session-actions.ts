'use server'

import { revalidatePath } from "next/cache";

export async function createSession(quizId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ quizId })
        });

        if (!response.ok) {
            return { error: "Falha ao criar sessão." };
        }

        const data = await response.json();
        return { success: true, sessionId: data.id, quizId: data.quizId };

    } catch (error) {
        console.error("Erro na server action:", error);
        return { error: "Erro de conexão ao criar sessão." };
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    });
    if (!response.ok) {
        return { error: "Falha ao iniciar quiz." };
    }
    const data = await response.json();
    return { success: true, session: data };
}

export async function nextQuestion(sessionId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/next-question`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            return { error: "Falha ao avançar para a próxima questão." };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Erro na server action:", error);
        return { error: "Erro de conexão ao avançar questão." };
    }
}

export async function finishQuiz(sessionId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/finish`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            return { error: "Falha ao finalizar quiz." };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Erro na server action:", error);
        return { error: "Erro de conexão ao finalizar quiz." };
    }
}