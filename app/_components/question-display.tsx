'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, CheckCircle2, ChevronRight, Eye, Home, Timer, Users, X } from "lucide-react";
import { useState } from "react";

const OPTION_SYMBOLS = ["\u25B2", "\u25CF", "\u25A0", "\u25C6"]

const quiz = {
    id: "1",
    title: "Fundamentos de Matemática",
    description: "Teste seus conhecimentos básicos de matemática",
    questions: [
        {
            text: "Quanto é 7 × 8?",
            type: "MULTIPLE_CHOICE",
            timeLimit: 30,
            options: [
                { text: "54", isCorrect: false },
                { text: "56", isCorrect: true },
                { text: "64", isCorrect: false },
                { text: "72", isCorrect: false },
            ],
        },
        {
            text: "A raiz quadrada de 144 é 12",
            type: "TRUE_FALSE",
            timeLimit: 15,
            correctAnswer: true,
        }
    ],
};

const currentQuestionIndex = 0;

const currentQuestion = quiz.questions[currentQuestionIndex]

const players = [
    { id: "1", name: "Maria Silva", score: 0 },
    { id: "2", name: "João Santos", score: 0 },
    { id: "3", name: "Ana Oliveira", score: 0 },
    { id: "4", name: "Pedro Costa", score: 0 },
    { id: "5", name: "Lucas Ferreira", score: 0 },
];

interface QuestionDisplayProps {
    sessionId: string;
    quizId: string;
}

const timeLeft = 30;

const optionCount = currentQuestion.options?.length || 0
const gridClass =
    optionCount <= 2
        ? "grid grid-cols-2 gap-4"
        : optionCount === 3
            ? "grid grid-cols-1 sm:grid-cols-3 gap-4"
            : "grid grid-cols-1 md:grid-cols-2 gap-4"

function getOptionColor(index: number) {
    const colors = [
        "bg-red-600 hover:bg-red-700",
        "bg-blue-600 hover:bg-blue-700",
        "bg-yellow-600 hover:bg-yellow-700",
        "bg-emerald-600 hover:bg-emerald-700",
    ]
    return colors[index % colors.length]
}

const answeredCount = 5;

const endReason = 'all';

const answersRevealed = false;

export function QuestionDisplay({ sessionId, quizId }: QuestionDisplayProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                    //onClick={() => router.replace("/")}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Sair
                    </Button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold">{quiz.title}</h2>
                        <p className="text-muted-foreground">
                            Questão {currentQuestionIndex + 1} de {quiz.questions.length}
                        </p>
                    </div>

                    <div className="text-center">
                        <div className={`text-3xl font-bold ${timeLeft <= 5 ? "text-red-500 animate-pulse" : ""}`}>
                            {timeLeft}
                        </div>
                        <div className="text-xs text-muted-foreground">segundos</div>
                    </div>
                </div>

                <Progress value={(timeLeft / currentQuestion.timeLimit) * 100} className="h-2 mb-6" />

                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm bg-muted px-3 py-1 rounded-full">
                                {currentQuestion.type === "TRUE_FALSE" ? "Verdadeiro ou Falso" : "Múltipla Escolha"}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                <Users className="inline h-4 w-4 mr-1" />
                                <span>
                                    {answeredCount} de {players.length}{" "}
                                    {answeredCount === 1 ? "respondeu" : "responderam"}
                                </span>
                            </span>
                        </div>

                        {endReason && !answersRevealed && (
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

                        {answersRevealed && (
                            <div className="flex items-center justify-center gap-2 rounded-lg p-3 mb-4 text-sm font-medium bg-primary/15 text-primary border border-primary/30">
                                <Eye className="h-4 w-4" />
                                Resposta correta revelada
                            </div>
                        )}

                        <h3 className="text-2xl font-bold mb-6 text-center">{currentQuestion.text}</h3>

                        {/* Options */}
                        {currentQuestion.type === "TRUE_FALSE" ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`p-6 rounded-lg text-center font-bold text-xl cursor-pointer transition-all text-white ${answersRevealed && currentQuestion.correctAnswer === true
                                        ? "bg-green-600 ring-4 ring-green-400"
                                        : answersRevealed && currentQuestion.correctAnswer === false
                                            ? "bg-red-900/50"
                                            : "bg-green-600 hover:bg-green-700 hover:scale-105"
                                        }`}
                                >
                                    <Check className="h-8 w-8 mx-auto mb-2" />
                                    Verdadeiro
                                </div>
                                <div
                                    className={`p-6 rounded-lg text-center font-bold text-xl cursor-pointer transition-all text-white ${answersRevealed && currentQuestion.correctAnswer === false
                                        ? "bg-green-600 ring-4 ring-green-400"
                                        : answersRevealed && currentQuestion.correctAnswer === true
                                            ? "bg-red-900/50"
                                            : "bg-red-600 hover:bg-red-700 hover:scale-105"
                                        }`}
                                >
                                    <X className="h-8 w-8 mx-auto mb-2" />
                                    Falso
                                </div>
                            </div>
                        ) : (
                            <div className={gridClass}>
                                {currentQuestion.options?.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg text-center font-bold text-lg cursor-pointer transition-all text-white flex flex-col items-center gap-2 ${answersRevealed && option.isCorrect
                                            ? "bg-green-600 ring-4 ring-green-400"
                                            : answersRevealed && !option.isCorrect
                                                ? "bg-muted text-muted-foreground"
                                                : `${getOptionColor(index)} hover:scale-105`
                                            }`}
                                    >
                                        <span className="text-2xl leading-none" aria-hidden="true">
                                            {OPTION_SYMBOLS[index]}
                                        </span>
                                        <span>
                                            {option.text}
                                            {answersRevealed && option.isCorrect && <Check className="inline ml-2 h-5 w-5" />}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    {endReason && !answersRevealed && (
                        <>
                            <Button variant="outline" className="gap-2 bg-transparent">
                                <Eye className="h-4 w-4" />
                                Revelar Resposta
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                {currentQuestionIndex === quiz.questions.length - 1 ? "Ver Resultados" : "Próxima"}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {answersRevealed && (
                        <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8">
                            {currentQuestionIndex === quiz.questions.length - 1 ? "Ver Resultados" : "Próxima Questão"}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
