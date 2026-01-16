"use client"

import type React from "react"
import { useState } from "react"
import Swal from 'sweetalert2';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronDown, Sparkles, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Question } from "@/types/Question";
import { QuestionCard } from "@/app/_components/question-card";
import { SuccessModal } from "@/app/_components/success-modal";
import { useRouter } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionType } from "@/types/QuestionType";

export default function CreateAIQuiz() {
    const router = useRouter();

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const [generatedQuiz, setGeneratedQuiz] = useState(false)

    const [theme, setTheme] = useState("")
    const [subtopics, setSubtopics] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [questionCount, setQuestionCount] = useState(10)
    const [questionTypes, setQuestionTypes] = useState<QuestionType>("ALL")

    const [learningObjective, setLearningObjective] = useState("")
    const [difficulty, setDifficulty] = useState("")
    const [educationalContext, setEducationalContext] = useState("")
    const [tone, setTone] = useState("")
    const [timeLimit, setTimeLimit] = useState("")

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [questions, setQuestions] = useState<Question[]>([])

    const [showSuccessModal, setShowSuccessModal] = useState(false)

    const handleQuestionTypeChange = (value: string) => {
        if (["ALL", "MULTIPLE_CHOICE", "TRUE_FALSE"].includes(value)) {
            setQuestionTypes(value as QuestionType)
        }
    }

    const handleSubmitAIData = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!targetAudience) {
            return toast.error("Por favor, selecione o nível/público alvo")
        }

        if (!questionTypes) {
            return toast.error("Por favor, selecione os tipos de questão")
        }

        //sem botao de ok
        //todos dark
        Swal.fire({
            title: "Aguarde",
            text: "A IA está criando suas questões. Isso pode levar alguns segundos...",
            icon: 'warning'
        })

        const body = {
            mainSubject: theme,
            topicsToInclude: subtopics,
            level: targetAudience,
            numberOfQuestions: questionCount,
            questionTypes: questionTypes,
            learningObjective: learningObjective,
            difficultyLevel: difficulty,
            educationalContext,
            tone,
            estimatedTime: timeLimit
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                const data = await response.json()

                Swal.close()

                Swal.fire({
                    title: "Questionário gerado com sucesso!",
                    icon: 'success'
                })

                setGeneratedQuiz(true)

                setTitle(data.title)
                setDescription(data.description)

                const processedQuestions = data.questions.map((question: Question) => {
                    if (question.correctAnswer === null) {
                        return {
                            id: question.id,
                            text: question.text,
                            type: question.type,
                            timeLimit: question.timeLimit,
                            options: question.options
                        }
                    } else {
                        return {
                            id: question.id,
                            text: question.text,
                            type: question.type,
                            timeLimit: question.timeLimit,
                            correctAnswer: question.correctAnswer
                        }
                    }
                })

                setQuestions(processedQuestions)

            } else {
                Swal.fire({
                    title: "Erro ao gerar questionário!",
                    icon: 'error'
                })
            }

        } catch (error) {
            Swal.fire({
                title: "Erro ao gerar questionário!",
                icon: 'error'
            })
            console.error(error)
        }
    }

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: "MULTIPLE_CHOICE",
            text: "",
            timeLimit: 30,
            options: [
                { text: "", isCorrect: true },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
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
                            return {
                                id: q.id,
                                type: "MULTIPLE_CHOICE",
                                text: q.text,
                                timeLimit: q.timeLimit,
                                options: [
                                    { text: "", isCorrect: true },
                                    { text: "", isCorrect: false },
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

    const handleSubmitNewQuiz = async (e: React.FormEvent) => {
        e.preventDefault()

        let body = {
            title,
            description,
            questions: questions.map(q => {
                if (q.type === "TRUE_FALSE") {
                    return {
                        text: q.text,
                        type: q.type,
                        timeLimit: q.timeLimit,
                        correctAnswer: q.correctAnswer
                    }
                } else if (q.type === "MULTIPLE_CHOICE") {
                    return {
                        text: q.text,
                        type: q.type,
                        timeLimit: q.timeLimit,
                        options: q.options
                            ?.filter((option: any) => option.text.trim() !== '')
                            .map((option: any) => ({
                                text: option.text,
                                isCorrect: option.isCorrect
                            }))
                    }
                }
            })
        }

        await createQuiz(body);
    }

    const createQuiz = async (body: Object) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.status === 201) {
                setShowSuccessModal(true)
            }
        } catch (error) {
            toast.error('Erro ao salvar questionário.')
            console.error(error)
        }
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
                        <h1 className="text-xl font-bold flex items-center gap-2 ml-5">
                            <Sparkles className="h-5 w-5" />
                            Criar Quiz com IA
                        </h1>
                    </div>

                    {
                        generatedQuiz ?
                            <Button onClick={handleSubmitNewQuiz}>Salvar Questionário</Button>
                            :
                            <Button onClick={handleSubmitAIData}>Gerar Questionário</Button>

                    }
                </div>
            </header>

            <main className="flex-1 container py-6 max-w-5xl mx-auto">
                {
                    generatedQuiz ? (
                        <form onSubmit={handleSubmitNewQuiz} className="space-y-6">
                            <Card className="bg-blue-400">
                                <CardContent className="flex gap-3">
                                    <AlertCircle />
                                    Confira as informações do questionário gerado antes de salvar
                                </CardContent>
                            </Card>

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
                                        Questões{" "}
                                        <span className="text-sm text-muted-foreground font-normal">
                                            ({questions.length})
                                        </span>
                                    </h2>
                                    <Button type="button" onClick={addQuestion} variant="outline" className="cursor-pointer">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Adicionar questão
                                    </Button>
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
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="outline" onClick={() => router.push("/")}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={questions.length === 0} className="cursor-pointer">
                                    Salvar Questionário
                                </Button>
                            </div>


                        </form>
                    ) : (
                        <form onSubmit={handleSubmitAIData} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informações Básicas</CardTitle>
                                    <CardDescription>Configure os parâmetros principais do seu questionário</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="theme">
                                            Tema / Assunto Principal <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="theme"
                                            placeholder="Ex: Revolução Francesa, Funções Quadráticas, Sistema Solar..."
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subtopics">Subtópicos / Assuntos a Incluir (opcional)</Label>
                                        <Textarea
                                            id="subtopics"
                                            placeholder="Ex: Causas da revolução, Queda da Bastilha, Período do Terror..."
                                            value={subtopics}
                                            onChange={(e) => setSubtopics(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="targetAudience">
                                                Nível / Público Alvo <span className="text-red-500">*</span>
                                            </Label>
                                            <Select value={targetAudience} onValueChange={setTargetAudience} required>
                                                <SelectTrigger id="targetAudience">
                                                    <SelectValue placeholder="Selecione o nível" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginner">Iniciante</SelectItem>
                                                    <SelectItem value="intermediate">Intermediário</SelectItem>
                                                    <SelectItem value="advanced">Avançado</SelectItem>
                                                    <SelectItem value="elementary">Fundamental</SelectItem>
                                                    <SelectItem value="middle">Médio</SelectItem>
                                                    <SelectItem value="university">Universitário</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="questionCount">
                                                Quantidade de Questões <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="pt-2 space-y-3">
                                                <Slider
                                                    id="questionCount"
                                                    min={2}
                                                    max={20}
                                                    step={1}
                                                    value={[questionCount]}
                                                    onValueChange={(value) => setQuestionCount(value[0])}
                                                    className="w-full"
                                                />
                                                <div className="text-center text-2xl font-semibold text-primary">{questionCount}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="questionTypes" className="mb-3">
                                                Tipos de Questão <span className="text-red-500">*</span>
                                            </Label>
                                            <RadioGroup value={questionTypes} onValueChange={handleQuestionTypeChange} className="flex justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="ALL" id="ALL" />
                                                    <Label htmlFor="ALL" className="cursor-pointer font-normal">
                                                        Misto
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="MULTIPLE_CHOICE" id="MULTIPLE_CHOICE" />
                                                    <Label htmlFor="MULTIPLE_CHOICE" className="cursor-pointer font-normal">
                                                        Múltipla Escolha
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="TRUE_FALSE" id="TRUE_FALSE" />
                                                    <Label htmlFor="TRUE_FALSE" className="cursor-pointer font-normal">
                                                        Verdadeiro ou Falso
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                            {/* <Select value={questionTypes} onValueChange={setQuestionTypes} required>
                                                <SelectTrigger id="questionTypes">
                                                    <SelectValue placeholder="Selecione os tipos de questão" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MULTIPLE_CHOICE">Apenas Múltipla Escolha</SelectItem>
                                                    <SelectItem value="TRUE_FALSE">Apenas Verdadeiro ou Falso</SelectItem>
                                                    <SelectItem value="ALL">Misto (Ambos os tipos)</SelectItem>
                                                </SelectContent>
                                            </Select> */}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                                <Card>
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="text-left">
                                                    <CardTitle>Opções Avançadas (Opcional)</CardTitle>
                                                    <CardDescription className="my-3">
                                                        Personalize ainda mais a geração do questionário
                                                    </CardDescription>
                                                </div>
                                                <ChevronDown className={cn("h-5 w-5 transition-transform", isAdvancedOpen && "rotate-180")} />
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="learningObjective">Objetivo de Aprendizagem</Label>
                                                <Textarea
                                                    id="learningObjective"
                                                    placeholder="Ex: Avaliar compreensão dos eventos principais e suas consequências..."
                                                    value={learningObjective}
                                                    onChange={(e) => setLearningObjective(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="difficulty">Grau de Dificuldade</Label>
                                                    <Select value={difficulty} onValueChange={setDifficulty}>
                                                        <SelectTrigger id="difficulty">
                                                            <SelectValue placeholder="Selecione a dificuldade" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="easy">Fácil</SelectItem>
                                                            <SelectItem value="medium">Médio</SelectItem>
                                                            <SelectItem value="hard">Difícil</SelectItem>
                                                            <SelectItem value="mixed">Misto</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="educationalContext">Contexto Educacional</Label>
                                                    <Select value={educationalContext} onValueChange={setEducationalContext}>
                                                        <SelectTrigger id="educationalContext">
                                                            <SelectValue placeholder="Selecione o contexto" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="in_person">Aula Presencial</SelectItem>
                                                            <SelectItem value="remote">Aula Remota</SelectItem>
                                                            <SelectItem value="pre_exam">Revisão antes da Prova</SelectItem>
                                                            <SelectItem value="diagnostic">Avaliação Diagnóstica</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="tone">Linguagem / Tom</Label>
                                                    <Select value={tone} onValueChange={setTone}>
                                                        <SelectTrigger id="tone">
                                                            <SelectValue placeholder="Selecione o tom" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="neutral">Neutro</SelectItem>
                                                            <SelectItem value="formal">Formal</SelectItem>
                                                            <SelectItem value="casual">Descontraído</SelectItem>
                                                            <SelectItem value="gamified">Gamificado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="timeLimit">Tempo Estimado por Resposta</Label>
                                                    <Select value={timeLimit} onValueChange={setTimeLimit}>
                                                        <SelectTrigger id="timeLimit">
                                                            <SelectValue placeholder="Selecione o tempo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="15">15 segundos</SelectItem>
                                                            <SelectItem value="30">30 segundos</SelectItem>
                                                            <SelectItem value="45">45 segundos</SelectItem>
                                                            <SelectItem value="60">1 minuto (60 segundos)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>

                            <div className="flex justify-end">
                                <Button type="submit" size="lg" className="gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Gerar Questionário com IA
                                </Button>
                            </div>
                        </form>

                    )
                }

                <SuccessModal
                    mode='create'
                    open={showSuccessModal}
                    onOpenChange={setShowSuccessModal}
                    onBack={() => router.push("/")}
                />
            </main>
        </div>
    )
}
