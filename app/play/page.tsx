'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation"
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Home, Play, User, Users, X } from "lucide-react"
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import Player from "@/types/Player";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

function PlayQuizContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const quizId = searchParams.get("quizId");
    const sessionId = searchParams.get("sessionId");

    const [session, setSession] = useState<Session | null>(null);
    const [players, setPlayers] = useState<Player[]>([])
    const [playerToKick, setPlayerToKick] = useState<Player | null>(null)

    const socketRef = useRef<Socket | null>(null);

    const fetchSessionData = useCallback(async () => {
        if (!quizId || !sessionId) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/quiz/${quizId}`
            );

            if (!response.ok) {
                toast.error("Dados inválidos");
                router.replace("/");
                return;
            }

            const data = await response.json();
            setSession(data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar sessão");
        }
    }, [quizId, sessionId, router]);

    const fetchPlayers = useCallback(async () => {
        if (!sessionId) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/players`
            );

            if (response.ok) {
                const data = await response.json();
                setPlayers(data);

                // const players = [{ id: '1', nickname: 'Gui' }]
                // setPlayers(players)
            }
        } catch (error) {
            console.error(error);
        }
    }, [sessionId]);

    const handleKickPlayer = async (player: Player) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/players/${player.id}/kick`,
                {
                    method: 'DELETE'
                }
            );

            if (response.ok) {
                setPlayers(players.filter((p) => p.id !== player.id))

            }
        } catch (error) {
            toast.error('Erro ao expulsar jogador')
            console.error(error);
        }
    }

    useEffect(() => {
        if (!quizId || !sessionId) return;
        fetchSessionData();
        fetchPlayers();
    }, [quizId, sessionId, fetchSessionData, fetchPlayers]);

    useEffect(() => {
        if (!sessionId) return;

        socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
            transports: ["websocket"],
            autoConnect: true,
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            socket.emit("join_host", { sessionId });
        });

        const shouldHandle = (payload: any) => {
            console.log('payload', payload);
            // se backend mandar sessionId, filtramos; se não mandar, atualizamos mesmo
            return !payload?.sessionId || payload.sessionId === sessionId;
        };

        const refreshPlayers = async (payload: any) => {
            if (!shouldHandle(payload)) return;
            await fetchPlayers();
        };

        socket.on("player_joined", refreshPlayers);
        socket.on("player_left", refreshPlayers);
        socket.on("player_disconnected", refreshPlayers);

        socket.on("connect_error", (err) => {
            console.error("Socket connect_error:", err?.message || err);
        });

        return () => {
            socket.off("player_joined", refreshPlayers);
            socket.off("player_left", refreshPlayers);
            socket.off("player_disconnected", refreshPlayers);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [sessionId, fetchPlayers]);

    if (!quizId || !sessionId) {
        return null; // ou um fallback UI
    }

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
                                <span className="font-bold">{players.length}</span>
                            </div>

                            <div className="rounded-lg p-4 max-h-40 overflow-y-auto">
                                <div className="flex flex-wrap gap-2">
                                    {players.map((p, i) => {
                                        const colors = [
                                            "bg-blue-500",
                                            "bg-emerald-500",
                                            "bg-amber-500",
                                            "bg-rose-500",
                                            "bg-violet-500",
                                            "bg-cyan-500",
                                            "bg-orange-500",
                                            "bg-pink-500",
                                        ]
                                        const color = colors[i % colors.length]
                                        return (
                                            <div
                                                key={p.id}
                                                className="relative flex items-center gap-3 border rounded-xl px-4 py-3 pr-8 text-base"
                                            >
                                                <div className={`${color} h-8 w-8 rounded-full flex items-center justify-center shrink-0`}>
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="font-medium">{p.nickname}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setPlayerToKick(p)}
                                                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-destructive text-white cursor-pointer"
                                                >
                                                    <X className="h-6 w-6" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        <AlertDialog open={!!playerToKick} onOpenChange={(open) => !open && setPlayerToKick(null)}>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Expulsar jogador?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tem certeza que deseja expulsar <span className="font-semibold">{playerToKick?.nickname}</span> da
                                        sessão? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => playerToKick && handleKickPlayer(playerToKick)}
                                        className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Confirmar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="flex items-center gap-2 text-sm text-white/70 mb-6">
                            <Clock className="h-4 w-4" />
                            <span>{session?.quiz?.numberOfQuestions ?? 0} questões</span>
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
                            <Button
                                onClick={() => {
                                    // TODO: emitir evento quiz_started e navegar
                                    // socketRef.current?.emit('quiz_started', { sessionId })
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white px-8"
                            >    <Play size={16} />
                                Iniciar Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default function PlayQuiz() {
    return (
        <ErrorBoundary variant="page" title="Erro na sessão do quiz">
            <PlayQuizContent />
        </ErrorBoundary>
    )
}