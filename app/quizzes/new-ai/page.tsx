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
import { ChevronLeft, ChevronDown, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { QuestionType } from "@/types/QuestionType";
import { QuizForm } from "@/app/_components/quiz-form";
import { generateAIQuiz } from "@/app/_actions/generate-ai-quiz";

export default function CreateAIQuiz() {
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

            <main className="flex-1 container py-6 max-w-3xl mx-auto px-4">
                <form onSubmit={handleSubmitAIData} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração do Quiz</CardTitle>
                            <CardDescription>A IA criará as perguntas baseada nestes parâmetros.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme">Tema / Assunto <span className="text-destructive">*</span></Label>
                                <Input
                                    id="theme"
                                    placeholder="Ex: Revolução Francesa, Fotossíntese..."
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                    required
                                    disabled={isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subtopics">Subtópicos (Opcional)</Label>
                                <Textarea
                                    id="subtopics"
                                    placeholder="Detalhes específicos para focar..."
                                    value={subtopics}
                                    onChange={(e) => setSubtopics(e.target.value)}
                                    rows={2}
                                    disabled={isPending}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Público Alvo <span className="text-destructive">*</span></Label>
                                    <Select value={targetAudience} onValueChange={setTargetAudience} required disabled={isPending}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="iniciante">Iniciante</SelectItem>
                                            <SelectItem value="intermediário">Intermediário</SelectItem>
                                            <SelectItem value="avançado">Avançado</SelectItem>
                                            <SelectItem value="ensino-medio">Ensino Médio</SelectItem>
                                            <SelectItem value="ensino-superior">Ensino Superior</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Quantidade: <span className="text-primary font-bold">{questionCount}</span></Label>
                                    <Slider
                                        min={2}
                                        max={20}
                                        step={1}
                                        value={[questionCount]}
                                        onValueChange={(v) => setQuestionCount(v[0])}
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label>Tipos de Questão <span className="text-destructive">*</span></Label>
                                <RadioGroup value={questionTypes} onValueChange={handleQuestionTypeChange} className="flex gap-4" disabled={isPending}>
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
                                        <Label htmlFor="TF">V / F</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                    </Card>

                    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <Card>
                            <CollapsibleTrigger className="w-full">
                                <CardHeader className="py-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm">Opções Avançadas</span>
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
                                    </div>
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="space-y-4 pt-0">
                                    <div className="space-y-2">
                                        <Label>Objetivo de Aprendizagem</Label>
                                        <Input 
                                            value={learningObjective} 
                                            onChange={e => setLearningObjective(e.target.value)} 
                                            placeholder="O que o aluno deve aprender?"
                                            disabled={isPending}
                                        />
                                    </div>
                                    {/* ... Outros campos avançados podem ser simplificados ou mantidos conforme necessário ... */}
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label>Dificuldade</Label>
                                            <Select value={difficulty} onValueChange={setDifficulty} disabled={isPending}>
                                                <SelectTrigger><SelectValue placeholder="Padrão" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="easy">Fácil</SelectItem>
                                                    <SelectItem value="medium">Médio</SelectItem>
                                                    <SelectItem value="hard">Difícil</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Tom</Label>
                                            <Select value={tone} onValueChange={setTone} disabled={isPending}>
                                                <SelectTrigger><SelectValue placeholder="Padrão" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="formal">Formal</SelectItem>
                                                    <SelectItem value="casual">Casual</SelectItem>
                                                    <SelectItem value="gamified">Gamificado</SelectItem>
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
                </form>
            </main>
        </div>
    )
}
