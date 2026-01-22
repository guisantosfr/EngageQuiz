"use client"

import { memo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowUp, ArrowDown, Trash2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Question } from "@/types/Question"

interface QuestionCardProps {
    question: Question
    index: number
    totalQuestions: number
    onRemove: (id: string) => void
    onMove: (index: number, direction: "up" | "down") => void
    onUpdate: (id: string, field: keyof Question, value: any) => void
    onUpdateOption: (questionId: string, optionIndex: number, value: string) => void
    onSetCorrectOption: (questionId: string, optionIndex: number) => void
}

function QuestionCardComponent({
    question,
    index,
    totalQuestions,
    onRemove,
    onMove,
    onUpdate,
    onUpdateOption,
    onSetCorrectOption,
}: QuestionCardProps) {
    const canChangeType = question?.id.startsWith('NEW_QUESTION');

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onMove(index, "up")
                                }}
                                disabled={index === 0}
                                asChild
                            >
                                <ArrowUp size="48"/>
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onMove(index, "down")
                                }}
                                disabled={index === totalQuestions - 1}
                                asChild
                            >
                                <ArrowDown size="48" />
                            </Button>
                        </div>
                        <div className="text-left">
                            <CardTitle className="text-lg">
                                Questão {index + 1}
                            </CardTitle>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Button
                            type="button"
                            variant="link"
                            size="lg"
                            onClick={(e) => {
                                e.stopPropagation()
                                onRemove(question.id)
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tipo de Questão</Label>
                        <Select
                            value={question.type}
                            disabled={!canChangeType}
                            onValueChange={(value) => onUpdate(question.id, "type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MULTIPLE_CHOICE">
                                    Múltipla escolha (2 - 4 opções)
                                </SelectItem>
                                <SelectItem value="TRUE_FALSE">Verdadeiro ou Falso</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Tempo Limite</Label>
                        <Select
                            value={question.timeLimit.toString()}
                            onValueChange={(value) =>
                                onUpdate(question.id, "timeLimit", Number.parseInt(value))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="15">15 segundos</SelectItem>
                                <SelectItem value="30">30 segundos</SelectItem>
                                <SelectItem value="45">45 segundos</SelectItem>
                                <SelectItem value="60">1 minuto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>
                        Questão <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        placeholder="Digite o texto da questão"
                        value={question.text}
                        onChange={(e) => onUpdate(question.id, "text", e.target.value)}
                        required
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label>
                        Opções de Resposta{" "}
                        <span className="text-sm text-muted-foreground">
                            (selecione a resposta correta)
                        </span>
                    </Label>

                    {question.type === "TRUE_FALSE" ? (
                        <RadioGroup
                            value={question.correctAnswer ? "true" : "false"}
                            onValueChange={(value) =>
                                onUpdate(question.id, "correctAnswer", value === "true")
                            }
                        >
                            <div className="space-y-2">
                                <div
                                    className={cn(
                                        "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                        question.correctAnswer === true &&
                                            "bg-green-50 border-green-500 dark:bg-green-950"
                                    )}
                                >
                                    <RadioGroupItem value="true" id={`${question.id}-true`} />
                                    <Label
                                        htmlFor={`${question.id}-true`}
                                        className="flex-1 cursor-pointer flex items-center"
                                    >
                                        Verdadeiro
                                        {question.correctAnswer === true && (
                                            <Check className="ml-2 h-4 w-4 text-green-600" />
                                        )}
                                    </Label>
                                </div>

                                <div
                                    className={cn(
                                        "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                        question.correctAnswer === false &&
                                            "bg-green-50 border-green-500 dark:bg-green-950"
                                    )}
                                >
                                    <RadioGroupItem value="false" id={`${question.id}-false`} />
                                    <Label
                                        htmlFor={`${question.id}-false`}
                                        className="flex-1 cursor-pointer flex items-center"
                                    >
                                        Falso
                                        {question.correctAnswer === false && (
                                            <Check className="ml-2 h-4 w-4 text-green-600" />
                                        )}
                                    </Label>
                                </div>
                            </div>
                        </RadioGroup>
                    ) : (
                        question.options && (
                            <RadioGroup
                                value={question.options
                                    .findIndex((opt) => opt.isCorrect)
                                    .toString()}
                                onValueChange={(value) =>
                                    onSetCorrectOption(question.id, Number.parseInt(value))
                                }
                            >
                                <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className={cn(
                                                "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                                option.isCorrect &&
                                                    "bg-green-50 border-green-500 dark:bg-green-950"
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={optionIndex.toString()}
                                                id={`${question.id}-${optionIndex}`}
                                            />
                                            <Input
                                                placeholder={`Opção ${optionIndex + 1}${
                                                    optionIndex >= 2 ? " (opcional)" : ""
                                                }`}
                                                value={option.text}
                                                onChange={(e) =>
                                                    onUpdateOption(
                                                        question.id,
                                                        optionIndex,
                                                        e.target.value
                                                    )
                                                }
                                                required={optionIndex < 2}
                                                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            {option.isCorrect && (
                                                <Check className="h-4 w-4 text-green-600 shrink-0" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export const QuestionCard = memo(QuestionCardComponent, (prev, next) => {
    return (
        prev.question === next.question &&
        prev.index === next.index &&
        prev.totalQuestions === next.totalQuestions
    );
});