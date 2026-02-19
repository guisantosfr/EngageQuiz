'use client';

import { useEffect, useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from 'socket.io-client';
import { LobbyClient } from "./lobby-client";
import { QuestionDisplay } from "./question-display";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Player from "@/types/Player";
import { cancelSession, finishQuiz, getPlayers } from "../_actions/session-actions";
import { toast } from "sonner";
import FinalResults from "./final-results";

export interface QuestionData {
    index: number;
    id: string;
    text: string;
    type: string;
    timeLimit: number;
    options?: { id: string; text: string }[];
}

interface PlayContentProps {
    initialSession: any;
    initialPlayers: Player[];
    sessionId: string;
    quizId: string;
}

export function PlayContent({ initialSession, initialPlayers, sessionId, quizId }: PlayContentProps) {
    const router = useRouter();
    const [websocket, setWebsocket] = useState<Socket | null>(null);
    const [sessionStatus, setSessionStatus] = useState<string>(initialSession.status);
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [isLeaving, startLeavingTransition] = useTransition();
    const [ranking, setRanking] = useState<any[]>([]);

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
    const [totalQuestions, setTotalQuestions] = useState<number>(initialSession.quiz?.numberOfQuestions ?? 0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);
    const [endReason, setEndReason] = useState<'timeout' | 'all_answered' | null>(null);
    const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState<boolean>(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Função auxiliar para atualizar jogadores
    const refreshPlayers = useCallback(async () => {
        const updatedPlayers = await getPlayers(sessionId);
        setPlayers(updatedPlayers);
    }, [sessionId]);

    const clearCountdown = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startCountdown = useCallback((seconds: number) => {
        clearCountdown();
        setTimeLeft(seconds);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearCountdown();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearCountdown]);

    const showQuestion = useCallback((question: QuestionData) => {
        setCurrentQuestion(question);
        setTotalAnswers(0);
        setEndReason(null);
        setCorrectOptionId(null);
    }, []);

    // Socket centralizado — criado uma única vez no mount
    useEffect(() => {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
            transports: ["websocket"],
            autoConnect: true,
        });

        setWebsocket(socket);

        const handlePlayerUpdate = (payload: any) => {
            if (!payload?.sessionId || payload.sessionId === sessionId) {
                refreshPlayers();
            }
        };

        socket.on("connect", () => {
            console.log("[PlayContent] Connected to socket");
            socket.emit("join_host", { sessionId });
        });

        socket.on("player_joined", handlePlayerUpdate);
        socket.on("player_left", handlePlayerUpdate);
        socket.on("player_kicked", handlePlayerUpdate);

        socket.on("quiz_started", (data) => {
            console.log("[quiz_started]", data);
            setSessionStatus('IN_PROGRESS');
            setTotalQuestions(data.totalQuestions);
            showQuestion(data.firstQuestion);
            startCountdown(data.firstQuestion.timeLimit);
            setTotalPlayers(data.totalPlayers);
            setShowAnswer(false);
        });

        socket.on("player_answered", (data) => {
            console.log("[player_answered]", data);
            setTotalAnswers(data.totalAnswers);
            setTotalPlayers(data.totalPlayers);
        });

        socket.on("question_closed", (data) => {
            console.log("[question_closed]", data);
            clearCountdown();
            setEndReason(data.reason);
            setCorrectOptionId(data.correctOptionId ?? null);
        });

        socket.on("next_question", (data) => {
            console.log("[next_question]", data);
            showQuestion(data.question);
            startCountdown(data.question.timeLimit);
            setShowAnswer(false);
        });

        return () => {
            clearCountdown();
            socket.disconnect();
        };
    }, [sessionId, showQuestion, startCountdown, clearCountdown, refreshPlayers]);

    // Intercepta o botão voltar do navegador
    useEffect(() => {
        history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            history.pushState(null, '', window.location.href);
            setShowLeaveDialog(true);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleConfirmLeave = () => {
        startLeavingTransition(async () => {
            const result = await cancelSession(sessionId);

            if (result.success) {
                websocket?.emit('session_ended', { sessionId });
                toast.info('Sessão Cancelada');
                router.replace('/');
            } else {
                toast.error(result.error);
            }
        });
    };

    const handleFinishQuiz = async () => {
        const result = await finishQuiz(sessionId);
        if (result.error) {
            toast.error(result.error);
            return;
        }
        setRanking(result.data.ranking ?? []);
        setSessionStatus('FINISHED');
    };

    const renderContent = () => {
        switch (sessionStatus) {
            case 'CREATED':
                return (
                    <LobbyClient
                        initialSession={initialSession}
                        players={players}
                        sessionId={sessionId}
                        quizId={quizId}
                        socket={websocket}
                        onStart={() => setSessionStatus("IN_PROGRESS")}
                        onCancelSession={handleConfirmLeave}
                    />
                );
            case 'IN_PROGRESS':
                return (
                    <QuestionDisplay
                        sessionId={sessionId}
                        quizId={quizId}
                        quizTitle={initialSession.quiz?.title ?? ""}
                        currentQuestion={currentQuestion}
                        totalQuestions={totalQuestions}
                        timeLeft={timeLeft}
                        totalAnswers={totalAnswers}
                        totalPlayers={totalPlayers}
                        endReason={endReason}
                        correctOptionId={correctOptionId}
                        showAnswer={showAnswer}
                        onRevealAnswer={() => setShowAnswer(true)}
                        onCancelSession={handleConfirmLeave}
                        onFinishQuiz={handleFinishQuiz}
                    />
                );
            case 'FINISHED':
                return (
                    <FinalResults ranking={ranking} />
                );
            default:
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <p className="text-muted-foreground">Sessão encerrada.</p>
                    </div>
                );
        }
    };

    return (
        <>
            {renderContent()}

            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sair da sessão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            A sessão será cancelada e todos os jogadores serão desconectados. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLeaving}>Continuar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmLeave}
                            disabled={isLeaving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isLeaving ? "Cancelando..." : "Sair e cancelar sessão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
