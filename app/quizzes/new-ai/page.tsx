"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronDown, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionType } from "@/types/QuestionType";
import { QuizForm } from "@/app/_components/quiz-form";
import { generateAIQuiz } from "@/app/_actions/generate-ai-quiz";
import { ErrorBoundary } from "@/components/error-boundary";

function CreateAIQuizContent() {
    const router = useRouter();

    const [isPending, startTransition] = useTransition()

    const [generatedData, setGeneratedData] = useState<any>(null)

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
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

        startTransition(async () => {
            const result = await generateAIQuiz(body);

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.success) {
                toast.success("Questionário gerado! Revise e salve.");
                setGeneratedData(result.data);

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (generatedData) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <QuizForm mode="create" initialData={generatedData} />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col bg-background mx-auto w-full">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                <div className="container flex h-16 items-center justify-between py-4 px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/')} disabled={isPending}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <h1 className="text-base sm:text-xl font-bold flex items-center gap-2 ml-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Criar com IA
                        </h1>
                    </div>
                </div>
            </header>

            <main className="flex-1 container py-6 w-4/5 sm:max-w-4xl mx-auto">
                <form onSubmit={handleSubmitAIData} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                            <CardDescription>Configure os parâmetros principais do seu questionário</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Tema / Assunto Principal<span className="text-destructive">*</span></Label>
                                <Input
                                    id="theme"
                                    placeholder="Ex: Revolução Francesa, Funções Quadráticas, Sistema Solar..."
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    required
                                    disabled={isPending}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtopics">Subtópicos / Assuntos a Incluir (Opcional)</Label>
                                <Textarea
                                    id="subtopics"
                                    placeholder="Ex: Causas da revolução, Queda da Bastilha, Período do Terror..."
                                    value={subtopics}
                                    onChange={(e) => setSubtopics(e.target.value)}
                                    rows={3}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nível / Público Alvo <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={targetAudience} onValueChange={setTargetAudience} required disabled={isPending}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma opção..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="iniciante">Iniciante</SelectItem>
                                            <SelectItem value="intermediário">Intermediário</SelectItem>
                                            <SelectItem value="avançado">Avançado</SelectItem>
                                            <hr />
                                            <SelectItem value="ensino-fundamental">Ensino Fundamental</SelectItem>
                                            <SelectItem value="ensino-medio">Ensino Médio</SelectItem>
                                            <SelectItem value="ensino-superior">Ensino Superior</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="questionsCount">Quantidade de questões</Label>
                                    <div className="pt-2 space-y-3">
                                        <Slider
                                            id="questionsCount"
                                            min={2}
                                            max={20}
                                            step={1}
                                            value={[questionCount]}
                                            onValueChange={(v) => setQuestionCount(v[0])}
                                            disabled={isPending}
                                            className="w-full cursor-pointer"
                                        />
                                        <div className="text-center text-2xl text-primary">{questionCount}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label>Tipos de Questão <span className="text-destructive">*</span></Label>
                                <RadioGroup value={questionTypes} onValueChange={handleQuestionTypeChange} className="flex flex-col sm:flex-row gap-4" disabled={isPending}>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="ALL" id="ALL" />
                                        <Label htmlFor="ALL">Misto</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="MULTIPLE_CHOICE" id="MC" />
                                        <Label htmlFor="MC">Múltipla Escolha</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="TRUE_FALSE" id="TF" />
                                        <Label htmlFor="TF">Verdadeiro ou Falso</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <Card>
                            <CollapsibleTrigger className="w-full">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <CardTitle>Opções Avançadas (Opcional)</CardTitle>
                                                <CardDescription className="my-3">
                                                    Personalize ainda mais a geração do questionário
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-4 pt-0">
                                    <div className="space-y-2">
                                        <Label>Objetivo de Aprendizagem</Label>
                                        <Textarea
                                            value={learningObjective}
                                            onChange={e => setLearningObjective(e.target.value)}
                                            placeholder="Ex: Avaliar compreensão dos eventos principais e suas consequências..."
                                            disabled={isPending}
                                            rows={2}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Grau de Dificuldade</Label>
                                            <Select value={difficulty} onValueChange={setDifficulty} disabled={isPending}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a dificuldade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="facil">Fácil</SelectItem>
                                                    <SelectItem value="medio">Médio</SelectItem>
                                                    <SelectItem value="dificil">Difícil</SelectItem>
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
                                                    <SelectItem value="aula_presencial">Aula Presencial</SelectItem>
                                                    <SelectItem value="aula_remota">Aula Remota</SelectItem>
                                                    <SelectItem value="revisao_pre_prova">Revisão antes da Prova</SelectItem>
                                                    <SelectItem value="avaliacao_diagnostica">Avaliação Diagnóstica</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Lingagem / Tom das Questões</Label>
                                            <Select value={tone} onValueChange={setTone} disabled={isPending}>
                                                <SelectTrigger id="tone">
                                                    <SelectValue placeholder="Selecione o tom das questões" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="neutro">Neutro</SelectItem>
                                                    <SelectItem value="formal">Formal</SelectItem>
                                                    <SelectItem value="descontraido">Descontraído</SelectItem>
                                                    <SelectItem value="gamificado">Gamificado</SelectItem>
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
                        <Button type="submit" size="lg" disabled={isPending} className="w-full sm:w-auto">
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando (isso pode levar um minuto)...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Gerar Questionário
                                </>
                            )}
                        </Button>
                    </div>

                    <AlertDialog open={isPending}>
                        <AlertDialogContent>
                            <AlertDialogTitle>Aguarde. Gerando questionário ...</AlertDialogTitle>
                            <AlertDialogDescription>
                                Isto pode levar alguns instantes
                            </AlertDialogDescription>
                        </AlertDialogContent>
                    </AlertDialog>
                </form>
            </main>
        </div>
    )
}

export default function CreateAIQuiz() {
    return (
        <ErrorBoundary variant="page" title="Erro ao criar quiz com IA">
            <CreateAIQuizContent />
        </ErrorBoundary>
    )
}
