"use client"

import { useTransition, useState } from "react"
import { useForm, useFieldArray, Control } from "react-hook-form"
import { useRouter } from "next/navigation"
import { saveQuiz, deleteQuiz } from '../_actions/quiz-actions';
import { createSession } from "../_actions/session-actions";
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

// Question no contexto do formulário tem um flag isNew para controlar canChangeType
export type FormQuestion = Question & { isNew: boolean }

export interface QuizFormValues {
    title: string
    description: string
    questions: FormQuestion[]
}

interface QuizFormProps {
    mode: Mode
    initialData?: any
}

function normalizeQuestions(dataQuestions: Question[] = []): FormQuestion[] {
    return dataQuestions.map((q) => {
        let normalized = q
        if (q.type === "MULTIPLE_CHOICE" && q.options && q.options.length < 4) {
            const newOptions = [...q.options]
            for (let i = 0; i < 4 - q.options.length; i++) {
                newOptions.push({ text: "", isCorrect: false })
            }
            normalized = { ...q, options: newOptions }
        }
        return { ...normalized, isNew: false }
    })
}

function makeNewQuestion(): FormQuestion {
    const ts = Date.now()
    return {
        id: `NEW_QUESTION_${ts}`,
        type: "MULTIPLE_CHOICE",
        text: "",
        timeLimit: 30,
        isNew: true,
        options: [
            { id: `NEW_OPTION_${ts}_1`, text: "", isCorrect: true },
            { id: `NEW_OPTION_${ts}_2`, text: "", isCorrect: false },
            { id: `NEW_OPTION_${ts}_3`, text: "", isCorrect: false },
            { id: `NEW_OPTION_${ts}_4`, text: "", isCorrect: false },
        ],
    }
}

export function QuizForm({ mode, initialData }: QuizFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
    const [quizId, setQuizId] = useState('')

    const form = useForm<QuizFormValues>({
        defaultValues: {
            title: initialData?.title ?? "",
            description: initialData?.description ?? "",
            questions: normalizeQuestions(initialData?.questions),
        },
    })

    const { fields, append, remove, move } = useFieldArray({
        control: form.control,
        name: "questions",
    })

    const { formState: { isDirty }, watch, setValue, getValues } = form

    const title = watch("title")

    // ── Callbacks para QuestionCard ──────────────────────────────────────────

    const handleUpdate = (index: number, field: keyof FormQuestion, value: any) => {
        console.log('update')
        if (field === "type") {
            const ts = Date.now()
            if (value === "TRUE_FALSE") {
                setValue(`questions.${index}`, {
                    id: getValues(`questions.${index}.id`),
                    type: "TRUE_FALSE",
                    text: getValues(`questions.${index}.text`),
                    timeLimit: getValues(`questions.${index}.timeLimit`),
                    correctAnswer: true,
                    isNew: getValues(`questions.${index}.isNew`),
                }, { shouldDirty: true })
            } else {
                setValue(`questions.${index}`, {
                    id: getValues(`questions.${index}.id`),
                    type: "MULTIPLE_CHOICE",
                    text: getValues(`questions.${index}.text`),
                    timeLimit: getValues(`questions.${index}.timeLimit`),
                    isNew: getValues(`questions.${index}.isNew`),
                    options: Array(4).fill(null).map((_, i) => ({
                        id: `NEW_OPTION_${ts}_${i}`,
                        text: "",
                        isCorrect: i === 0,
                    })),
                }, { shouldDirty: true })
            }
            return
        }
        setValue(`questions.${index}.${field}` as any, value, { shouldDirty: true })
    }

    const handleUpdateOption = (questionIndex: number, optionIndex: number, value: string) => {
        setValue(`questions.${questionIndex}.options.${optionIndex}.text` as any, value, { shouldDirty: true })
    }

    const handleSetCorrectOption = (questionIndex: number, correctIdx: number) => {
        const options = getValues(`questions.${questionIndex}.options`) ?? []
        setValue(
            `questions.${questionIndex}.options` as any,
            options.map((opt: any, i: number) => ({ ...opt, isCorrect: i === correctIdx })),
            { shouldDirty: true }
        )
    }

    const handleMove = (index: number, direction: "up" | "down") => {
        const target = direction === "up" ? index - 1 : index + 1
        if (target < 0 || target >= fields.length) return
        move(index, target)
    }

    const handleRemove = (index: number) => {
        remove(index)
    }

    const handleAddQuestion = () => {
        append(makeNewQuestion())
    }

    // ── Navegação ────────────────────────────────────────────────────────────

    const handleBack = () => {
        if (isDirty) {
            setShowUnsavedDialog(true)
        } else {
            router.push("/")
        }
    }

    // ── Validação ────────────────────────────────────────────────────────────

    const validateQuestions = (questions: FormQuestion[]): string | null => {
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) return `Questão ${i + 1}: O enunciado não pode estar vazio.`;

            if (q.type === "MULTIPLE_CHOICE" && q.options) {
                const hasEmptyOption = q.options.some(opt => !opt.text.trim());
                if (hasEmptyOption) return `Questão ${i + 1}: Todas as alternativas devem ser preenchidas.`;
            }
        }
        return null
    }

    // ── Submit ───────────────────────────────────────────────────────────────

    const onSubmit = (values: QuizFormValues) => {
        const validationError = validateQuestions(values.questions)
        if (validationError) {
            toast.error(validationError)
            return
        }

        const isNewId = (id: string | undefined) =>
            id?.startsWith('NEW_QUESTION_') || id?.startsWith('NEW_OPTION_')

        const cleanedQuestions = values.questions.map(q => {
            const base = {
                text: q.text,
                type: q.type,
                timeLimit: q.timeLimit,
                id: (mode === 'edit' && !isNewId(q.id)) ? q.id : undefined,
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
                        id: (mode === 'edit' && !isNewId(opt.id)) ? opt.id : undefined,
                    })),
            }
        })

        startTransition(async () => {
            const result = await saveQuiz(
                { title: values.title, description: values.description, questions: cleanedQuestions },
                mode,
                initialData?.id
            )
            if (result.error) {
                toast.error(result.error)
                return
            }
            setQuizId(result.quizId)
            setShowSuccessDialog(true)
        })
    }

    const handleDelete = () => {
        if (!initialData?.id) return
        startTransition(async () => {
            const result = await deleteQuiz(initialData.id)
            if (result.success) {
                toast.success("Questionário excluído.")
                router.push("/")
            } else {
                toast.error(result.error)
            }
        })
    }

    const handleConfirmStartQuiz = () => {
        startTransition(async () => {
            const result = await createSession(quizId)
            if (result?.error) {
                toast.error(result.error)
                return
            }
            if (result?.success) {
                toast.success("Sessão criada com sucesso!")
                router.push(`/play?sessionId=${result.sessionId}&quizId=${result.quizId}`)
            }
        })
    }

    // ── Render ───────────────────────────────────────────────────────────────

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
                        {mode === 'edit' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="cursor-pointer">
                                        <Trash2 className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Excluir Questionário</span>
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
                        )}

                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={fields.length === 0 || !title || isPending}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 sm:mr-2" />}
                            <span className="hidden sm:inline">Salvar</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-6 max-w-4xl mx-auto">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                    maxLength={100}
                                    autoComplete="off"
                                    required
                                    {...form.register("title")}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label htmlFor="description">Descrição</Label>
                                    <span>{watch("description").length} / 200</span>
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Descreva o questionário (opcional)"
                                    maxLength={200}
                                    rows={3}
                                    {...form.register("description")}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold">
                                Questões{" "}
                                <span className="text-sm text-muted-foreground font-normal">
                                    ({fields.length})
                                </span>
                            </h2>
                            {fields.length === 0 && (
                                <Button type="button" onClick={handleAddQuestion} variant="outline" className="cursor-pointer">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar questão
                                </Button>
                            )}
                        </div>

                        {fields.map((field, index) => (
                            <ErrorBoundary
                                key={field.id}
                                variant="inline"
                                title={`Erro na questão ${index + 1}`}
                                onRemove={() => handleRemove(index)}
                            >
                                <QuestionCard
                                    control={form.control}
                                    index={index}
                                    totalQuestions={fields.length}
                                    onRemove={handleRemove}
                                    onMove={handleMove}
                                    onUpdate={handleUpdate}
                                    onUpdateOption={handleUpdateOption}
                                    onSetCorrectOption={handleSetCorrectOption}
                                />
                            </ErrorBoundary>
                        ))}

                        {fields.length > 0 && (
                            <div className="flex justify-center sm:justify-end mb-3">
                                <Button type="button" onClick={handleAddQuestion} variant="outline" className="cursor-pointer">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar questão
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center sm:justify-end gap-4">
                        <Button type="button" variant="outline" onClick={handleBack} className="cursor-pointer">
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={fields.length === 0 || !title || isPending}
                            className="cursor-pointer"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4" />}
                            Salvar Questionário
                        </Button>
                    </div>
                </form>
            </main>

            {/* Loading dialog */}
            <AlertDialog open={isPending}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aguarde...</AlertDialogTitle>
                        <AlertDialogDescription>
                            {mode === 'create' ? 'Criando questionário' : 'Salvando alterações'} — isso pode levar alguns instantes.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            {/* Success dialog */}
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
                        <AlertDialogAction onClick={handleConfirmStartQuiz}>
                            Iniciar Agora
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Unsaved changes dialog */}
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
                        <AlertDialogAction
                            onClick={() => { setShowUnsavedDialog(false); router.push("/") }}
                            className="bg-destructive text-destructive-foreground"
                        >
                            Sair sem salvar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}