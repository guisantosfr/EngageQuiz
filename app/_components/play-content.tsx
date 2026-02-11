'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from 'socket.io-client';
import { LobbyClient } from "./lobby-client";
import { QuestionDisplay } from "./question-display";
import Player from "@/types/Player";

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
    const [sessionStatus, setSessionStatus] = useState<string>(initialSession.status);

    // Question state
    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
    const [totalQuestions, setTotalQuestions] = useState<number>(initialSession.quiz?.numberOfQuestions ?? 0);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [totalAnswers, setTotalAnswers] = useState<number>(0);
    const [totalPlayers, setTotalPlayers] = useState<number>(0);
    const [endReason, setEndReason] = useState<'timeout' | 'all_answered' | null>(null);
    const [correctOptionId, setCorrectOptionId] = useState<string | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<Socket | null>(null);

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

    useEffect(() => {
        if (sessionStatus !== 'IN_PROGRESS') return;

        socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
            transports: ["websocket"],
            autoConnect: true,
        });

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("[QuestionDisplay] Connected to socket");
            socket.emit("join_host", { sessionId });
        });

        socket.on("quiz_started", (data) => {
            console.log("[quiz_started]", data);
            setTotalQuestions(data.totalQuestions);
            showQuestion(data.firstQuestion);
            startCountdown(data.firstQuestion.timeLimit);
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
        });

        return () => {
            clearCountdown();
            socket.disconnect();
        };
    }, [sessionStatus, sessionId, showQuestion, startCountdown, clearCountdown]);

    const handleStart = () => {
        setSessionStatus('IN_PROGRESS');
    };

    switch (sessionStatus) {
        case 'CREATED':
            return (
                <LobbyClient
                    initialSession={initialSession}
                    initialPlayers={initialPlayers}
                    sessionId={sessionId}
                    quizId={quizId}
                    onStart={handleStart}
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
                />
            );
        default:
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-muted-foreground">Sessão encerrada.</p>
                </div>
            );
    }
}
