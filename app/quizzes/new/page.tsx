"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, Plus, Trash2, GripVertical, Check, CheckCircle2, PlayCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { Question } from "@/types/Question";

export default function NewQuiz() {
    const router = useRouter()

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [savedQuizId, setSavedQuizId] = useState<string>("")

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: "MULTIPLE_CHOICE",
            text: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            timeLimit: 30,
        }
        setQuestions([...questions, newQuestion])
    }

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter((q) => q.id !== id))
    }

    const moveQuestion = (index: number, direction: "up" | "down") => {
        const newQuestions = [...questions]
        const targetIndex = direction === "up" ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= newQuestions.length) return
            ;[newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
        setQuestions(newQuestions)
    }

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === id) {
                    if (field === "type") {
                        if (value === "true-false") {
                            return { ...q, [field]: value, options: ["True", "False"], correctAnswer: 0 }
                        } else {
                            return { ...q, [field]: value, options: ["", ""], correctAnswer: 0 }
                        }
                    }
                    return { ...q, [field]: value }
                }
                return q
            }),
        )
    }

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId) {
                    const newOptions = [...q.options]
                    newOptions[optionIndex] = value
                    return { ...q, options: newOptions }
                }
                return q
            }),
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        for (const question of questions) {
            if (question.type === "MULTIPLE_CHOICE") {
              
            }
        }

        const newQuizId = Date.now().toString()
        console.log("Quiz created:", { id: newQuizId, title, description, questions })
        setSavedQuizId(newQuizId)
        setShowSuccessModal(true)
    }

    return (
        <div className="flex min-h-screen flex-col bg-background mx-auto w-9/10">
            <header className="sticky top-0 z-10 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Link>
                        </Button>
                        <h1 className="text-xl font-bold ml-5">Novo Questionário</h1>
                    </div>
                    <Button onClick={handleSubmit} disabled={questions.length === 0}>Salvar Questionário</Button>
                </div>
            </header>

            <main className="flex-1 container py-6 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações do questionário</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Nome <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Digite o nome do questionário"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Descreva o questionário (opcional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                Questões <span className="text-sm text-muted-foreground font-normal">({questions.length})</span>
                            </h2>
                            <Button type="button" onClick={addQuestion} variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar questão
                            </Button>
                        </div>

                        {questions.map((question, index) => (
                            <Card key={question.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-6 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveQuestion(index, "up")
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <GripVertical className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-6 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveQuestion(index, "down")
                                                    }}
                                                    disabled={index === questions.length - 1}
                                                >
                                                    <GripVertical className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="text-left">
                                                <CardTitle className="text-lg">
                                                    Questão {index + 1}
                                                    {question.text && (
                                                        <span className="ml-2 font-normal text-muted-foreground">
                                                            {question.text.slice(0, 50)}
                                                            {question.text.length > 50 ? "..." : ""}
                                                        </span>
                                                    )}
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
                                                    removeQuestion(question.id)
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Tipo de Questão</Label>
                                            <Select
                                                value={question.type}
                                                onValueChange={(value) => updateQuestion(question.id, "type", value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MULTIPLE_CHOICE">Múltipla escolha (2 - 4 opções)</SelectItem>
                                                    <SelectItem value="TRUE_FALSE">Verdadeiro ou Falso</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tempo Limite</Label>
                                            <Select
                                                value={question.timeLimit.toString()}
                                                onValueChange={(value) => updateQuestion(question.id, "timeLimit", Number.parseInt(value))}
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
                                            onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                                            required
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>
                                            Opções de Resposta{" "}
                                            <span className="text-sm text-muted-foreground">(selecione a resposta correta)</span>
                                        </Label>
                                        <RadioGroup
                                            value={question.correctAnswer.toString()}
                                            onValueChange={(value) =>
                                                updateQuestion(question.id, "correctAnswer", Number.parseInt(value))
                                            }
                                        >
                                            {question.type === "TRUE_FALSE" ? (
                                                <div className="space-y-2">
                                                    <div
                                                        className={cn(
                                                            "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                                            question.correctAnswer === 0 && "bg-green-50 border-green-400 dark:bg-green-950",
                                                        )}
                                                    >
                                                        <RadioGroupItem value="0" id={`${question.id}-0`} />
                                                        <Label htmlFor={`${question.id}-0`} className="flex-1 cursor-pointer flex items-center ml-5">
                                                            Verdadeiro
                                                            {question.correctAnswer === 0 && <Check className="ml-2 h-4 w-4 text-green-500" />}
                                                        </Label>
                                                    </div>
                                                    <div
                                                        className={cn(
                                                            "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                                            question.correctAnswer === 1 && "bg-green-50 border-green-400 dark:bg-green-950",
                                                        )}
                                                    >
                                                        <RadioGroupItem value="1" id={`${question.id}-1`} />
                                                        <Label htmlFor={`${question.id}-1`} className="flex-1 cursor-pointer flex items-center ml-5">
                                                            Falso
                                                            {question.correctAnswer === 1 && <Check className="ml-2 h-4 w-4 text-green-500" />}
                                                        </Label>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {question.options.map((option, optionIndex) => (
                                                        <div
                                                            key={optionIndex}
                                                            className={cn(
                                                                "flex items-center space-x-2 p-3 border rounded-lg transition-colors",
                                                                question.correctAnswer === optionIndex &&
                                                                "bg-green-50 border-green-400 dark:bg-green-950",
                                                            )}
                                                        >
                                                            <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                                                            <Input
                                                                placeholder={`Opção ${optionIndex + 1}${optionIndex >= 2 ? " (opcional)" : ""}`}
                                                                value={option}
                                                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                                                required={optionIndex < 2}
                                                                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            />
                                                            {question.correctAnswer === optionIndex && (
                                                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </RadioGroup>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/")}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={questions.length === 0}>Salvar Questionário</Button>
                    </div>
                </form>
            </main>

            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-950">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-2xl">Questionário criado com sucesso!</DialogTitle>
                        <DialogDescription className="text-center">
                            O que você deseja fazer?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button onClick={() => router.push(`/quizzes/${savedQuizId}/present`)} className="w-full" size="lg">
                            <PlayCircle className="h-5 w-5 mr-2" />
                            Iniciar Questionário
                        </Button>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full" size="lg">
                            Voltar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}