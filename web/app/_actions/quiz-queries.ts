import { Quiz } from "@/types/Quiz";
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

export async function getQuizzes(): Promise<Quiz[]> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;
        if (!token) {
            return [];
        }

        const headers = await getAuthHeaders();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quizzes`,
            {
                method: 'GET',
                headers,
                cache: 'no-store',
            }
        );

        if (!res.ok) {
            if (res.status !== 401) {
                console.error('Failed to fetch quizzes:', res.status, res.statusText);
            }
            return [];
        }

        const data = await res.json();

        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        return [];
    }
}

export async function getQuiz(id: string): Promise<Quiz | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;
        if (!token) {
            return null;
        }

        const headers = await getAuthHeaders();
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`,
            {
                method: 'GET',
                headers,
                cache: 'no-store',
            }
        );

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}