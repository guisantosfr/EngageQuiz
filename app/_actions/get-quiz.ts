'use server'

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