'use client'

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Quiz } from "@/types/Quiz";
import { Loader2, Pencil, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSession } from "../_actions/create-session";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleStartQuiz = () => {
        // Opção simples nativa. Para algo mais elaborado, use um AlertDialog do shadcn
        const confirmed = window.confirm("Deseja iniciar uma nova sessão deste questionário?");
        
        if (!confirmed) return;

        startTransition(async () => {
            const result = await createSession(quiz.id);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.success) {
                toast.success("Sessão criada com sucesso!");
                router.push(`/play?sessionId=${result.sessionId}&quizId=${result.quizId}`);
            }
        });
    }

    return (
        <Card key={quiz.id}>
            <CardHeader className="pb-2">
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                    {quiz.questions} {quiz.questions === 1 ? 'questão' : 'questões'}
                </CardDescription>
            </CardHeader>

            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </Button>

                <Button 
                    size="sm" 
                    className="w-1/3" 
                    onClick={handleStartQuiz} 
                    disabled={isPending}
                >
                    {isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Play className="mr-2 h-4 w-4" />
                    )}
                    {isPending ? "Iniciando..." : "Iniciar"}
                </Button>
            </CardFooter>
        </Card>
    )
}