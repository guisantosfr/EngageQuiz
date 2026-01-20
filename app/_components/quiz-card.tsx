'use client'

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Quiz } from "@/types/Quiz";
import { Pencil, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
    const router = useRouter();

    const startQuiz = () => {
        Swal.fire({
            title: "Iniciar questionário?",
            text: "Uma nova sessão será criada",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Iniciar Questionário",
            cancelButtonText: "Cancelar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            theme: 'auto',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await createSession();
            }
        })
    }

    const createSession = async () => {
        Swal.fire({
            title: "Aguarde",
            text: "Criando nova sessão ...",
            showConfirmButton: false,
            allowOutsideClick: false,
            theme: 'auto',
            didOpen: () => {
                Swal.showLoading()
            }
        })

        const body = {
            quizId: quiz.id
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                const data = await response.json()

                Swal.close();

                console.log(data);

                const { id, quizId } = data;

                toast.success("Sessão criada com sucesso");

                router.push(`/play?sessionId=${id}&quizId=${quizId}`)
            } else {
                Swal.fire({
                    title: "Erro ao iniciar questionário!",
                    icon: 'error',
                    theme: 'auto'
                })
            }
        } catch (error) {
            console.error(error);

            Swal.fire({
                title: "Erro ao iniciar questionário!",
                icon: 'error',
                theme: 'auto'
            })
        }
    }

    return (
        <Card key={quiz.id}>
            <CardHeader className="pb-2">
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                    {quiz.questions?.length} {quiz.questions?.length === 1 ? 'questão' : 'questões'}
                </CardDescription>
            </CardHeader>

            <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </Link>
                </Button>

                <Button size="sm" onClick={startQuiz}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                </Button>
            </CardFooter>
        </Card>
    )
}