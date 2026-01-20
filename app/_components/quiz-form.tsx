"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ChevronLeft, Plus, Save, Trash2 } from "lucide-react"
import { Question } from "@/types/Question"
import { QuestionCard } from "../_components/question-card"
import { SuccessModal } from "../_components/success-modal"
import QuizSkeleton from "./quiz-skeleton"
import Swal from "sweetalert2"

type Mode = 'create' | 'edit'

interface InitialValues {
    title: string
    description: string
    questions: Question[]
}

export function QuizForm({ mode }: { mode: Mode }) {
    const router = useRouter()
    const { id } = useParams();

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(mode === 'edit')

    const initialValuesRef = useRef<InitialValues>({
        title: "",
        description: "",
        questions: []
    })

    const hasUnsavedChanges = useCallback(() => {
        const initial = initialValuesRef.current

        if (title !== initial.title) return true
        if (description !== initial.description) return true
        if (JSON.stringify(questions) !== JSON.stringify(initial.questions)) return true

        return false
    }, [title, description, questions])

    const handleBack = () => {
        if (hasUnsavedChanges()) {
            setShowUnsavedChangesDialog(true)
        } else {
            router.push("/")
        }
    }

    const confirmBack = () => {
        setShowUnsavedChangesDialog(false)
        router.push("/")
    }

    useEffect(() => {
        if (mode === 'create') {
            return;
        }

        const fetchQuiz = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`)
                const data = await response.json()

                setTitle(data.title)
                setDescription(data.description)

                //for each question inside data.questions, if is multiple choice and has
                //less than 4 options, fill with empty options until reach 4 options
                const updatedQuestions = data.questions.map((q: Question) => {
                    if (q.type === "MULTIPLE_CHOICE" && q.options && q.options.length < 4) {
                        const optionsToAdd = 4 - q.options.length
                        const newOptions = [...q.options]
                        for (let i = 0; i < optionsToAdd; i++) {
                            newOptions.push({ text: "", isCorrect: false })
                        }
                        return { ...q, options: newOptions }
                    }
                    return q
                })

                setQuestions(updatedQuestions)

                initialValuesRef.current = {
                    title: data.title,
                    description: data.description,
                    questions: updatedQuestions
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchQuiz();
    }, [])

    const addQuestion = () => {
        const timestamp = Date.now()
        const newQuestion: Question = {
            id: `NEW_QUESTION_${timestamp}`,
            type: "MULTIPLE_CHOICE",
            text: "",
            timeLimit: 30,
            options: [
                { id: `NEW_OPTION_${timestamp}_1`, text: "", isCorrect: true },
                { id: `NEW_OPTION_${timestamp}_2`, text: "", isCorrect: false },
                { id: `NEW_OPTION_${timestamp}_3`, text: "", isCorrect: false },
                { id: `NEW_OPTION_${timestamp}_4`, text: "", isCorrect: false },
            ],
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
                        if (value === "TRUE_FALSE") {
                            return {
                                id: q.id,
                                type: "TRUE_FALSE",
                                text: q.text,
                                timeLimit: q.timeLimit,
                                correctAnswer: true,
                            }
                        } else {
                            const timestamp = Date.now()
                            return {
                                id: q.id,
                                type: "MULTIPLE_CHOICE",
                                text: q.text,
                                timeLimit: q.timeLimit,
                                options: [
                                    { id: `NEW_OPTION_${timestamp}_1`, text: "", isCorrect: true },
                                    { id: `NEW_OPTION_${timestamp}_2`, text: "", isCorrect: false },
                                    { id: `NEW_OPTION_${timestamp}_3`, text: "", isCorrect: false },
                                    { id: `NEW_OPTION_${timestamp}_4`, text: "", isCorrect: false },
                                ],
                            }
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
                if (q.id === questionId && q.type === "MULTIPLE_CHOICE" && q.options) {
                    const newOptions = [...q.options]
                    newOptions[optionIndex] = { ...newOptions[optionIndex], text: value }
                    return { ...q, options: newOptions }
                }
                return q
            }),
        )
    }

    const setCorrectOption = (questionId: string, optionIndex: number) => {
        setQuestions(
            questions.map((q) => {
                if (q.id === questionId && q.type === "MULTIPLE_CHOICE" && q.options) {
                    const newOptions = q.options.map((opt, idx) => ({
                        ...opt,
                        isCorrect: idx === optionIndex,
                    }))
                    return { ...q, options: newOptions }
                }
                return q
            }),
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        Swal.fire({
            title: "Aguarde!",
            text: "Salvando questionário",
            showConfirmButton: false,
            allowOutsideClick: false,
            theme: 'auto',
            didOpen: () => {
                Swal.showLoading()
            }
        })

        // Função auxiliar para verificar se é um ID novo (criado localmente)
        const isNewId = (id: string | undefined) => id?.startsWith('NEW_QUESTION_') || id?.startsWith('NEW_OPTION_')

        let body = {
            title,
            description,
            questions: questions.map(q => {
                // No modo edit, só incluir ID se não for novo
                const questionId = mode === 'edit' && !isNewId(q.id) ? q.id : undefined

                if (q.type === "TRUE_FALSE") {
                    return {
                        ...(questionId && { id: questionId }),
                        text: q.text,
                        type: q.type,
                        timeLimit: q.timeLimit,
                        correctAnswer: q.correctAnswer
                    }
                } else if (q.type === "MULTIPLE_CHOICE") {
                    return {
                        ...(questionId && { id: questionId }),
                        text: q.text,
                        type: q.type,
                        timeLimit: q.timeLimit,
                        options: q.options
                            ?.filter((option: any) => option.text.trim() !== '')
                            .map((option: any) => {
                                // No modo edit, só incluir ID da option se não for novo
                                const optionId = mode === 'edit' && !isNewId(option.id) ? option.id : undefined
                                return {
                                    ...(optionId && { id: optionId }),
                                    text: option.text,
                                    isCorrect: option.isCorrect
                                }
                            })
                    }
                }
            })
        }

        if (mode === 'create') {
            await createQuiz(body);
        } else if (mode === 'edit') {
            await updateQuiz({ ...body, id });
        }
    }

    const createQuiz = async (body: Object) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                Swal.close();
                setShowSuccessModal(true)
            }
        } catch (error) {
            toast.error('Erro ao salvar questionário.')
            console.error(error)
        }
    }

    const updateQuiz = async (body: Object) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                Swal.close();
                setShowSuccessModal(true)
            }
        } catch (error) {
            toast.error('Erro ao editar questionário.')
            console.error(error)
        }
    }

    const handleDelete = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })

            if (response.ok) {
                toast.success('Questionário excluído com sucesso.')
                router.push("/")
            } else {
                toast.error('Erro ao excluir questionário.')
                console.error('Delete failed with status:', response.status)
            }
        } catch (error) {
            toast.error('Erro ao editar questionário.')
            console.error(error)
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-background mx-auto w-9/10">
            <header className="sticky top-0 z-10 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleBack} className="cursor-pointer">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-xl font-bold ml-5">{
                            mode === 'create' ? 'Novo Questionário' : 'Editar Questionário'}
                        </h1>
                    </div>

                    <div className="flex justify-between items-center gap-10">
                        {
                            mode === 'edit' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="cursor-pointer">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Excluir Questionário
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente este questionário e todas as suas perguntas.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                                                Confirmar exclusão
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )
                        }

                        <Button
                            onClick={handleSubmit}
                            className="cursor-pointer"
                            disabled={questions.length === 0 || title.length === 0}
                        >
                            <Save className="h-4 w-4" />
                            Salvar Questionário
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-6 max-w-4xl mx-auto">
                {isLoading ? (
                    <QuizSkeleton />
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações do questionário</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="title">
                                            Nome <span className="text-red-500">*</span>
                                        </Label>
                                        <span>{title.length} / 100</span>
                                    </div>
                                    <Input
                                        id="title"
                                        placeholder="Digite o nome do questionário"
                                        value={title}
                                        maxLength={100}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="description">Descrição</Label>
                                        <span>{description.length} / 200</span>
                                    </div>
                                    <Textarea
                                        id="description"
                                        placeholder="Descreva o questionário (opcional)"
                                        value={description}
                                        maxLength={200}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">
                                    Questões{" "}
                                    <span className="text-sm text-muted-foreground font-normal">
                                        ({questions.length})
                                    </span>
                                </h2>
                                {
                                    questions.length === 0 && (
                                        <Button type="button" onClick={addQuestion} variant="outline" className="cursor-pointer">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar questão
                                        </Button>
                                    )
                                }
                            </div>

                            {questions.map((question, index) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    totalQuestions={questions.length}
                                    onRemove={removeQuestion}
                                    onMove={moveQuestion}
                                    onUpdate={updateQuestion}
                                    onUpdateOption={updateOption}
                                    onSetCorrectOption={setCorrectOption}
                                />
                            ))}

                            {
                                questions.length !== 0 && (
                                    <div className="flex justify-end mb-3">
                                        <Button type="button" onClick={addQuestion} variant="outline" className="cursor-pointer">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Adicionar questão
                                        </Button>
                                    </div>
                                )
                            }
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={handleBack} className="cursor-pointer">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={questions.length === 0 || title.length === 0} className="cursor-pointer">
                                <Save className="h-4 w-4" />
                                Salvar Questionário
                            </Button>
                        </div>
                    </form>
                )}
            </main>

            <SuccessModal
                mode={mode}
                open={showSuccessModal}
                onOpenChange={setShowSuccessModal}
                onBack={() => router.push("/")}
            />

            <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Alterações não salvas</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você tem alterações não salvas. Tem certeza que deseja sair? Todas as alterações serão perdidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBack} className="bg-destructive text-destructive-foreground">
                            Sair sem salvar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}