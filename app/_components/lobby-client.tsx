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

const AVATAR_COLORS = [
    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500",
    "bg-violet-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
];

interface LobbyClientProps {
    initialSession: any;
    initialPlayers: Player[];
    sessionId: string;
    quizId: string;
    socketRef: MutableRefObject<Socket | null>;
    onStart?: () => void;
}

export function LobbyClient({ initialSession, initialPlayers, sessionId, quizId, socketRef, onStart }: LobbyClientProps) {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [playerToKick, setPlayerToKick] = useState<Player | null>(null);
    const [cancelSessionOpen, setCancelSessionOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Função auxiliar para atualizar jogadores
    const refreshPlayers = useCallback(async () => {
        const updatedPlayers = await getPlayers(sessionId);
        setPlayers(updatedPlayers);
    }, [sessionId]);

    // Registra listeners de lobby no socket compartilhado
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handlePlayerUpdate = (payload: any) => {
            if (!payload?.sessionId || payload.sessionId === sessionId) {
                refreshPlayers();
            }
        };

        socket.on("player_joined", handlePlayerUpdate);
        socket.on("player_left", handlePlayerUpdate);
        socket.on("player_kicked", handlePlayerUpdate);

        return () => {
            socket.off("player_joined", handlePlayerUpdate);
            socket.off("player_left", handlePlayerUpdate);
            socket.off("player_kicked", handlePlayerUpdate);
        };
    }, [sessionId, refreshPlayers, socketRef]);

    const handleKickPlayer = () => {
        if (!playerToKick) return;

        startTransition(async () => {
            const result = await kickPlayer(sessionId, playerToKick.id);
            if (result.success) {
                setPlayers(prev => prev.filter(p => p.id !== playerToKick.id));
                toast.success(`${playerToKick.nickname} removido.`);
                setPlayerToKick(null);

                socketRef.current?.emit('kick_player', { sessionId, playerId: playerToKick.id });
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleCancelSession = () => {
        startTransition(async () => {
            const result = await cancelSession(sessionId);
            if (result.success) {
                socketRef.current?.emit('session_ended', { sessionId });
                toast.info('Sessão Cancelada');
                router.replace('/');
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

            <div className="flex min-h-screen flex-col items-center justify-start mt-5 p-4">
                <Card className="w-full max-w-3xl bg-white/10 backdrop-blur-sm border-none shadow-xl">
                    <CardContent className="p-6 md:p-8 flex flex-col items-center text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">{initialSession.quiz?.title}</h1>
                        <p className="text-muted-foreground mb-6">{initialSession.quiz?.description}</p>

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
                                    <span>Jogadores ({players.length})</span>
                                </div>
                            </div>

                            <div className="rounded-xl border bg-card/50 p-4 min-h-30 max-h-75 overflow-y-auto">
                                {players.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2 opacity-20" />
                                        <p>Aguardando jogadores...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        {players.map((p, i) => (
                                            <div
                                                key={p.id}
                                                className="group relative flex items-center gap-2 bg-background border rounded-full pl-2 pr-4 py-1.5 shadow-sm animate-in zoom-in duration-300"
                                            >
                                                <div className={`${AVATAR_COLORS[i % AVATAR_COLORS.length]} h-7 w-7 rounded-full flex items-center justify-center shrink-0`}>
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                                <span className="font-medium text-sm max-w-25 truncate" title={p.nickname}>
                                                    {p.nickname}
                                                </span>
                                                <button
                                                    onClick={() => setPlayerToKick(p)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110"
                                                    title="Expulsar"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 bg-secondary/30 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4" />
                            <span>{initialSession.quiz?.numberOfQuestions ?? 0} questões</span>
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
                                disabled={players.length === 0 || isPending}
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
                        <AlertDialogAction onClick={handleCancelSession} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isPending ? "Cancelando..." : "Encerrar Sessão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}