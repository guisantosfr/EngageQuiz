'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, CheckCircle2, ChevronRight, Eye, Home, Timer, Users, X } from "lucide-react";
import { QuestionData } from "./play-content";
import { nextQuestion } from "../_actions/session-actions";

const OPTION_SYMBOLS = ["\u25B2", "\u25CF", "\u25A0", "\u25C6"]

function getOptionColor(index: number) {
    const colors = [
        "bg-red-600 hover:bg-red-700",
        "bg-blue-600 hover:bg-blue-700",
        "bg-yellow-600 hover:bg-yellow-700",
        "bg-emerald-600 hover:bg-emerald-700",
    ]
    return colors[index % colors.length]
}

interface QuestionDisplayProps {
    sessionId: string;
    quizId: string;
    quizTitle: string;
    currentQuestion: QuestionData | null;
    totalQuestions: number;
    timeLeft: number;
    totalAnswers: number;
    totalPlayers: number;
    endReason: 'timeout' | 'all_answered' | null;
    correctOptionId: string | null;
    showAnswer: boolean;
    onRevealAnswer: () => void;
    onCancelSession: () => void;
}

export function QuestionDisplay({
    sessionId,
    quizId,
    quizTitle,
    currentQuestion,
    totalQuestions,
    timeLeft,
    totalAnswers,
    totalPlayers,
    endReason,
    correctOptionId,
    showAnswer,
    onRevealAnswer,
    onCancelSession
}: QuestionDisplayProps) {

    const [cancelSessionOpen, setCancelSessionOpen] = useState(false);

    if (!currentQuestion) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Aguardando início da questão...</p>
                </div>
            </div>
        );
    }

    const questionIndex = currentQuestion.index;
    const optionCount = currentQuestion.options?.length || 0;
    const gridClass =
        optionCount <= 2
            ? "grid grid-cols-2 gap-4"
            : optionCount === 3
                ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 gap-4";

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelSessionOpen(true)}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Sair
                    </Button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold">{quizTitle}</h2>
                        <p className="text-muted-foreground">
                            Questão {questionIndex + 1} de {totalQuestions}
                        </p>
                    </div>

                    <div className={`text-center ${endReason ? "invisible" : ""}`}>
                        <div className={`text-3xl font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : ""}`}>
                            {timeLeft}
                        </div>
                        <div className="text-xs text-muted-foreground">segundos</div>
                    </div>
                </div>

                {!endReason && (
                    <Progress value={(timeLeft / currentQuestion.timeLimit) * 100} className="h-2 mb-6" />
                )}
                {endReason && <div className="h-2 mb-6" />}

                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm bg-muted px-3 py-1 rounded-full">
                                {currentQuestion.type === "TRUE_FALSE" ? "Verdadeiro ou Falso" : "Múltipla Escolha"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                <Users className="inline h-4 w-4 mr-1" />
                                <span>
                                    {totalAnswers} de {totalPlayers}{" "}
                                    {totalAnswers === 1 ? "respondeu" : "responderam"}
                                </span>
                            </span>
                        </div>

                        {endReason && (
                            <div
                                className={`flex items-center justify-center gap-2 rounded-lg p-3 mb-4 text-sm font-medium w-1/2 mx-auto ${endReason === "timeout"
                                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                    : "bg-green-500/15 text-green-400 border border-green-500/30"
                                    }`}
                            >
                                {endReason === "timeout" ? (
                                    <>
                                        <Timer className="h-4 w-4" />
                                        Tempo esgotado!
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Todos os jogadores responderam!
                                    </>
                                )}
                            </div>
                        )}

                        <h3 className="text-2xl font-bold mb-6 text-center">{currentQuestion.text}</h3>

                        {currentQuestion.type === "TRUE_FALSE" ? (
                            <div className="grid grid-cols-2 gap-4">
                                {(() => {
                                    const options = currentQuestion.options ?? [];
                                    const trueOption = options.find(o => o.text?.toLowerCase() === "verdadeiro" || o.text?.toLowerCase() === "true");
                                    const falseOption = options.find(o => o.text?.toLowerCase() === "falso" || o.text?.toLowerCase() === "false");

                                    const trueIsCorrect = !!trueOption && trueOption.id === correctOptionId;
                                    const falseIsCorrect = !!falseOption && falseOption.id === correctOptionId;

                                    const base = "p-6 rounded-lg text-center font-bold text-xl cursor-default transition-all text-white";

                                    const trueClass = showAnswer
                                        ? trueIsCorrect
                                            ? "bg-green-600 ring-4 ring-green-400"
                                            : "bg-muted text-muted-foreground"
                                        : "bg-green-600 hover:scale-105";

                                    const falseClass = showAnswer
                                        ? falseIsCorrect
                                            ? "bg-green-600 ring-4 ring-green-400"
                                            : "bg-muted text-muted-foreground"
                                        : "bg-red-600 hover:scale-105";

                                    return (
                                        <>
                                            <div className={`${base} ${trueClass}`}>
                                                <Check className="h-8 w-8 mx-auto mb-2" />
                                                Verdadeiro
                                                {showAnswer && trueIsCorrect && <Check className="inline ml-2 h-5 w-5" />}
                                            </div>

                                            <div className={`${base} ${falseClass}`}>
                                                <X className="h-8 w-8 mx-auto mb-2" />
                                                Falso
                                                {showAnswer && falseIsCorrect && <Check className="inline ml-2 h-5 w-5" />}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : (
                            <div className={gridClass}>
                                {currentQuestion.options?.map((option, index) => {
                                    const isCorrect = option.id === correctOptionId;
                                    const optionClass = showAnswer
                                        ? isCorrect
                                            ? "bg-green-600 ring-4 ring-green-400"
                                            : "bg-muted text-muted-foreground"
                                        : `${getOptionColor(index)} hover:scale-105`;

                                    return (
                                        <div
                                            key={option.id}
                                            className={`p-4 rounded-lg text-center font-bold text-lg cursor-default transition-all text-white flex flex-col items-center gap-2 ${optionClass}`}
                                        >
                                            <span className="text-2xl leading-none" aria-hidden="true">
                                                {OPTION_SYMBOLS[index]}
                                            </span>
                                            <span>
                                                {option.text}
                                                {showAnswer && isCorrect && <Check className="inline ml-2 h-5 w-5" />}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    {endReason && !showAnswer && (
                        <>
                            <Button variant="outline" className="gap-2 bg-transparent" onClick={onRevealAnswer}>
                                <Eye className="h-4 w-4" />
                                Revelar Resposta
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => nextQuestion(sessionId)}>
                                {questionIndex === totalQuestions - 1 ? "Ver Resultados" : "Próxima Questão"}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {showAnswer && (
                        <Button onClick={() => nextQuestion(sessionId)} className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8">
                            {questionIndex === totalQuestions - 1 ? "Ver Resultados" : "Próxima Questão"}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog open={cancelSessionOpen} onOpenChange={setCancelSessionOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar Sessão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Todos os jogadores serão desconectados. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={onCancelSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Encerrar Sessão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
