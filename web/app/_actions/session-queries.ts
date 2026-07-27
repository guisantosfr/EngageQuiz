import { cookies } from "next/headers";

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

export async function getSession(sessionId: string, quizId: string) {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/quiz/${quizId}`, {
            headers,
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
        const headers = await getAuthHeaders();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/players`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        return [];
    }
}