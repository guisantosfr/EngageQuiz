"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteQuiz } from '../_actions/delete-quiz';
import { saveQuiz } from '../_actions/save-quiz';
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
import { ChevronLeft, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { Question } from "@/types/Question"
import { QuestionCard } from "../_components/question-card"
import { ErrorBoundary } from "@/components/error-boundary"

type Mode = 'create' | 'edit'

interface InitialValues {
    title: string
    description: string
    questions: Question[]
}

interface QuizFormProps {
    mode: Mode
    initialData?: any // O ideal seria tipar corretamente com a interface Quiz completa
}

export function QuizForm({ mode, initialData }: QuizFormProps) {
    const router = useRouter()

    const normalizeQuestions = (dataQuestions: Question[] = []) => {
        return dataQuestions.map((q) => {
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
    }

    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [questions, setQuestions] = useState<Question[]>(normalizeQuestions(initialData?.questions))

    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

    const [isPending, startTransition] = useTransition()

    const initialValuesRef = useRef<InitialValues>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        questions: normalizeQuestions(initialData?.questions)
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
            setShowUnsavedDialog(true)
        } else {
            router.push("/")
        }
    }

    const confirmBack = () => {
        setShowUnsavedDialog(false)
        router.push("/")
    }

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
        setQuestions(prevQuestions => [...prevQuestions, newQuestion])
    }

    const removeQuestion = (id: string) => {
        setQuestions(prevQuestions => prevQuestions.filter((q) => q.id !== id))
    }

    const moveQuestion = (index: number, direction: "up" | "down") => {
        setQuestions(prevQuestions => {
            const newQuestions = [...prevQuestions]
            const targetIndex = direction === "up" ? index - 1 : index + 1

            if (targetIndex < 0 || targetIndex >= newQuestions.length) return prevQuestions;
            [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
            return newQuestions
        })
    }

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setQuestions(prevQuestions =>
            prevQuestions.map((q) => {
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
                                options: Array(4).fill(null).map((_, i) => ({
                                    id: `NEW_OPTION_${timestamp}_${i}`, text: "", isCorrect: i === 0
                                }))
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
        setQuestions(prevQuestions =>
            prevQuestions.map((q) => {
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
        setQuestions(prevQuestions =>
            prevQuestions.map((q) => {
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

        const isNewId = (id: string | undefined) => id?.startsWith('NEW_QUESTION_') || id?.startsWith('NEW_OPTION_')

        const cleanedQuestions = questions.map(q => {
            const base = {
                text: q.text,
                type: q.type,
                timeLimit: q.timeLimit,
                id: (mode === 'edit' && !isNewId(q.id)) ? q.id : undefined
            }

            if (q.type === "TRUE_FALSE") {
                return { ...base, correctAnswer: q.correctAnswer }
            }

            return {
                ...base,
                options: q.options
                    ?.filter(opt => opt.text.trim() !== '')
                    .map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                        id: (mode === 'edit' && !isNewId(opt.id)) ? opt.id : undefined
                    }))
            }
        })

        let body = {
            title,
            description,
            questions: cleanedQuestions
        }

        startTransition(async () => {
            const result = await saveQuiz(body, mode, initialData?.id);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            setShowSuccessDialog(true);
        });
    }

    const handleDelete = async () => {
        if (!initialData?.id) return;

        startTransition(async () => {
            const result = await deleteQuiz(initialData.id);
            if (result.success) {
                toast.success("Questionário excluído.");
                router.push("/");
            } else {
                toast.error(result.error);
            }
        })
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
                        <h1 className="text-base sm:text-xl font-bold ml-5">
                            {mode === 'create' ? 'Novo Questionário' : 'Editar Questionário'}
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
                            disabled={questions.length === 0 || title.length === 0 || isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 sm:mr-2" />}
                            <span className="hidden sm:inline">Salvar</span>
                        </Button>
                    </div>
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
                                    autoComplete="off"
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
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
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
                            <ErrorBoundary
                                key={question.id}
                                variant="inline"
                                title={`Erro na questão ${index + 1}`}
                                onRemove={() => removeQuestion(question.id)}
                            >
                                <QuestionCard
                                    question={question}
                                    index={index}
                                    totalQuestions={questions.length}
                                    onRemove={removeQuestion}
                                    onMove={moveQuestion}
                                    onUpdate={updateQuestion}
                                    onUpdateOption={updateOption}
                                    onSetCorrectOption={setCorrectOption}
                                />
                            </ErrorBoundary>
                        ))}

                        {
                            questions.length !== 0 && (
                                <div className="flex justify-center sm:justify-end mb-3">
                                    <Button type="button" onClick={addQuestion} variant="outline" className="cursor-pointer">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar questão
                                    </Button>
                                </div>
                            )
                        }
                    </div>

                    <div className="flex justify-center sm:justify-end gap-4">
                        <Button type="button" variant="outline" onClick={handleBack} className="cursor-pointer">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={questions.length === 0 || title.length === 0} className="cursor-pointer">
                            <Save className="h-4 w-4" />
                            Salvar Questionário
                        </Button>
                    </div>
                </form>
            </main>

            <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sucesso!</AlertDialogTitle>
                        <AlertDialogDescription>
                            O questionário foi {mode === 'create' ? 'criado' : 'atualizado'} com sucesso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => router.push('/')}>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {/* Lógica para iniciar quiz se necessário */ }}>
                            Iniciar Agora
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
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