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