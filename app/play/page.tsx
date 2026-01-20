'use client';

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Home, Users } from "lucide-react"

export default function PlayQuiz() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const quiz = {
        title: "Quiz Teste",
        description: "Questionário teste"
    }

    const session = {
        joinCode: "123456"
    }

    const players = [
        { id: "1", name: "Maria Silva", score: 0 },
        { id: "2", name: "João Santos", score: 0 },
        { id: "3", name: "Ana Oliveira", score: 0 },
        { id: "4", name: "Pedro Costa", score: 0 },
        { id: "5", name: "Lucas Ferreira", score: 0 },
        { id: "6", name: "Maria Silva", score: 0 },
        { id: "7", name: "João Santos", score: 0 },
        { id: "8", name: "Ana Oliveira", score: 0 },
        { id: "9", name: "Pedro Costa", score: 0 },
        { id: "10", name: "Lucas Ferreira", score: 0 },
    ]

    const quizId = searchParams.get("quizId");
    const sessionId = searchParams.get("sessionId");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-white p-4">
            <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-sm border-none text-white">
                <CardContent className="p-8 flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                    <p className="text-white/80 mb-6">{quiz.description}</p>

                    <div className="text-center mb-8">
                        <p className="text-xl mb-2">Código de Acesso:</p>
                        <p className="text-5xl font-bold tracking-wider bg-white/20 px-8 py-4 rounded-lg">
                            {session.joinCode}
                        </p>
                        <p className="mt-4 text-white/80">Conecte-se pelo seu aplicativo.</p>
                    </div>

                    <div className="w-full mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>Jogadores conectados</span>
                            </div>
                            <span className="font-bold">{players.length}</span>
                        </div>
                        <div className="bg-white/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {players.map((p) => (
                                    <span key={p.id} className="bg-white/30 px-3 py-1 rounded-full text-sm">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
                        <Clock className="h-4 w-4" />
                        <span>10 questões</span>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="bg-white/20 hover:bg-white/30 border-white text-white"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                        <Button onClick={() => { }} className="bg-green-500 hover:bg-green-600 text-white px-8">
                            Iniciar Quiz
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}