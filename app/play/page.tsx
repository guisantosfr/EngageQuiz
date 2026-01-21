'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Home, Play, Users } from "lucide-react"
import { toast } from "sonner";

interface Session {
    id: string;
    code: string;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
    players: [];
    quiz: Quiz;
    quizId: string;
    status: string;
    updatedAt: string;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    numberOfQuestions: number;
}

export default function PlayQuiz() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const quizId = searchParams.get("quizId");
    const sessionId = searchParams.get("sessionId");

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            if(!quizId || !sessionId) return;

            try{
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/quiz/${quizId}`);
                
                if(response.ok){
                    const data = await response.json();
                    setSession(data);
                } else{
                    toast.error('Dados inválidos')
                    router.replace('/')
                }
            }catch(error){
                console.error(error);
            }
        }

        fetchSessionData()
    }, [])

    return (
        <>
        <header className="border-b bg-card">
          <div className="container flex h-14 items-center p-8">
            <h1 className="text-xl font-bold">EngageQuiz</h1>
          </div>
        </header>

        <div className="flex min-h-screen flex-col items-center justify-start mt-5 text-white p-4">
            <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-sm border-none text-white">
                <CardContent className="p-8 flex flex-col items-center">
                    <h1 className="text-3xl font-bold mb-2">{session?.quiz?.title}</h1>
                    <p className="text-white/80 mb-6">{session?.quiz?.description}</p>

                    <div className="text-center mb-8">
                        <p className="text-xl mb-2">Código de Acesso:</p>
                        <p className="text-5xl font-bold tracking-wider bg-white/20 px-8 py-4 rounded-lg">
                            {session?.code}
                        </p>
                        <p className="mt-4 text-white/80">Conecte-se pelo seu aplicativo.</p>
                    </div>

                    <div className="w-full mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <span>Jogadores conectados</span>
                            </div>
                            <span className="font-bold">{session?.players?.length}</span>
                        </div>
                        {/* <div className="bg-white/20 rounded-lg p-4 max-h-40 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {players.map((p) => (
                                    <span key={p.id} className="bg-white/30 px-3 py-1 rounded-full text-sm">
                                        {p.name}
                                    </span>
                                ))}
                            </div>
                        </div> */}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
                        <Clock className="h-4 w-4" />
                        <span>{session?.quiz?.numberOfQuestions} questões</span>
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
                            <Play size={16} />
                            Iniciar Quiz
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
        </>
    )
}