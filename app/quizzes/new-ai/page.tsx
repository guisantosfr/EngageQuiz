"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronLeft, ChevronDown, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CreateAIQuiz() {
    const router = useRouter()
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const [theme, setTheme] = useState("")
    const [subtopics, setSubtopics] = useState("")
    const [targetAudience, setTargetAudience] = useState("")
    const [questionCount, setQuestionCount] = useState("10")
    const [questionTypes, setQuestionTypes] = useState("")

    const [learningObjective, setLearningObjective] = useState("")
    const [difficulty, setDifficulty] = useState("")
    const [educationalContext, setEducationalContext] = useState("")
    const [tone, setTone] = useState("")
    const [timeLimit, setTimeLimit] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!targetAudience) {
            return toast.error("Por favor, selecione o nível/público alvo")
        }

        if (!questionTypes) {
            return toast.error("Por favor, selecione os tipos de questão")
        }

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

        // show a loading modal
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                // get response data
                // close loading modal
                // show success modal with button to go to quiz page
                // redirect to /quizzes/ai/:id page sending data as prop, replacing id from id get from response
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
                    <Button onClick={handleSubmit}>Gerar Questionário</Button>
                </div>
            </header>

            <main className="flex-1 container py-6 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                        Quantidade de Questões (min. 2, max. 20) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="questionCount"
                                        type="number"
                                        min="2"
                                        max="20"
                                        placeholder="10"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="questionTypes">
                                        Tipos de Questão <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={questionTypes} onValueChange={setQuestionTypes} required>
                                        <SelectTrigger id="questionTypes">
                                            <SelectValue placeholder="Selecione os tipos de questão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MULTIPLE_CHOICE">Apenas Múltipla Escolha</SelectItem>
                                            <SelectItem value="TRUE_FALSE">Apenas Verdadeiro ou Falso</SelectItem>
                                            <SelectItem value="ALL">Misto (Ambos os tipos)</SelectItem>
                                        </SelectContent>
                                    </Select>
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
            </main>
        </div>
    )
}
