import { notFound } from "next/navigation";
import { QuizForm } from "../../_components/quiz-form";
import { getQuiz } from "@/app/_actions/quiz-queries";

interface PageProps {
    params: { id: string }
}

export default async function EditQuizPage({ params }: PageProps) {
    const { id } = await params;
    const quiz = await getQuiz(id);

    if (!quiz) {
        notFound();
    }

    return (
        <QuizForm mode="edit" initialData={quiz} />
    )
}