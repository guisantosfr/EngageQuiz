'use client';

import { useEffect, useState, useCallback, useTransition, MutableRefObject } from "react";
import { useRouter } from "next/navigation";
import { Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CircleX, Clock, Loader2, Play, User, Users, X } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cancelSession, getPlayers, kickPlayer, startQuiz } from "@/app/_actions/session-actions";
import Player from "@/types/Player";
import PlayerCard from "./player-card";

const AVATAR_COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "bg-violet-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
];

interface LobbyClientProps {
    initialSession: any;
    players: Player[];
    sessionId: string;
    quizId: string;
    socket: Socket | null;
    onStart?: () => void;
    onCancelSession?: () => void;
}

export function LobbyClient({ initialSession, players, sessionId, quizId, socket, onStart, onCancelSession }: LobbyClientProps) {
    const router = useRouter();
    const [playersList, setPlayersList] = useState<Player[]>(players);
    const [playerToKick, setPlayerToKick] = useState<Player | null>(null);
    const [cancelSessionOpen, setCancelSessionOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Sincroniza o state local quando a prop players muda (via socket em PlayContent)
    useEffect(() => {
        setPlayersList(players);
    }, [players]);

    const getRandomColor = (playerId: string) => {
        return AVATAR_COLORS[playerId.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length]
    }

    const handleKickPlayer = () => {
        if (!playerToKick) return;

        startTransition(async () => {
            const result = await kickPlayer(sessionId, playerToKick.id);
            if (result.success) {
                setPlayersList(prev => prev.filter(p => p.id !== playerToKick.id));
                toast.success(`${playerToKick.nickname} removido.`);
                setPlayerToKick(null);
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleStartQuiz = () => {
        startTransition(async () => {
            const result = await startQuiz(sessionId);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            onStart?.();
        });
    };

    return (
        <>
            <header className="border-b bg-card">
                <div className="container flex h-14 items-center px-4 md:px-8">
                    <h1 className="text-xl font-bold">EngageQuiz</h1>
                </div>
            </header>

            <div className="flex min-h-screen flex-col items-center justify-start mt-4 p-3">
                <Card className="w-full max-w-4xl bg-white/10 backdrop-blur-sm border-none shadow-xl">
                    <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{initialSession.quiz?.title}</h1>
                        <p className="text-muted-foreground mb-6 w-3/4">{initialSession.quiz?.description}</p>

                        <div className="mb-8 w-full max-w-md bg-secondary/50 p-6 rounded-2xl border border-border/50">
                            <p className="text-lg mb-2 font-medium">Código de Acesso</p>
                            <p className="text-5xl md:text-6xl font-black tracking-widest text-primary">
                                {initialSession.code}
                            </p>
                            <p className="mt-4 text-sm text-muted-foreground">Acesse pelo app para entrar</p>
                        </div>

                        <div className="w-full mb-8">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                    <span>Jogadores ({playersList.length})</span>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card/50 p-4 min-h-30 max-h-75 overflow-y-auto">
                                {playersList.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20" />
                                        <p>Aguardando jogadores...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {playersList.map((p, i) => (
                                            <PlayerCard
                                                key={p.id}
                                                player={p}
                                                colorClass={getRandomColor(p.id)}
                                                onKick={setPlayerToKick}
                                                disabled={isPending}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 bg-secondary/30 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>
                                {initialSession.quiz?.numberOfQuestions ?? 0} {initialSession.quiz?.numberOfQuestions === 1 ? "questão" : "questões"}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button
                                onClick={() => setCancelSessionOpen(true)}
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={isPending}
                            >
                                <CircleX className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleStartQuiz}
                                className="w-full sm:w-auto min-w-50"
                                size="lg"
                                disabled={playersList.length === 0 || isPending}
                            >
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Iniciar Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={!!playerToKick} onOpenChange={(o) => !o && setPlayerToKick(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Expulsar {playerToKick?.nickname}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O jogador será removido da sala imediatamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleKickPlayer} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending ? "Expulsando..." : "Expulsar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={cancelSessionOpen} onOpenChange={setCancelSessionOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Sessão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Todos os jogadores serão desconectados. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={onCancelSession} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending ? "Cancelando..." : "Encerrar Sessão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}