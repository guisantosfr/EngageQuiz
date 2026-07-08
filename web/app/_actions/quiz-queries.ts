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
            console.error('Failed to fetch quizzes:', res);
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
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quizzes`,
            {
                method: 'GET',
                // Remove o cache: 'no-store' e usa revalidate
                next: { revalidate: 60 } // Atualiza o cache a cada 60 segundos
            }
        );

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}