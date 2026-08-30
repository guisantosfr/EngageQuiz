"use client"

import { Control, Controller } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuestionType } from "@/types/QuestionType"

// Tipo compartilhado exportado daqui para evitar dependência circular
export interface AIQuizFormValues {
    theme: string
    subtopics: string
    restrictions: string
    targetAudience: string
    questionCount: number
    questionTypes: QuestionType
    generalComments: string
    // Avançadas
    learningObjective: string
    difficulty: string
    educationalContext: string
    tone: string
    timeLimit: string
}

interface AdvancedAIConfigProps {
    control: Control<AIQuizFormValues>
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    disabled?: boolean
}

export default function AdvancedAIConfig({ control, isOpen, onOpenChange, disabled }: AdvancedAIConfigProps) {
    return (
        <Collapsible open={isOpen} onOpenChange={onOpenChange}>
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
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <CardContent className="space-y-4 pt-0">
                        <div className="space-y-2">
                            <Label>Objetivo de Aprendizagem</Label>
                            <Controller
                                control={control}
                                name="learningObjective"
                                render={({ field }) => (
                                    <Textarea
                                        placeholder="Ex: Avaliar compreensão dos eventos principais e suas consequências..."
                                        disabled={disabled}
                                        rows={2}
                                        maxLength={200}
                                        {...field}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Grau de Dificuldade</Label>
                                <Controller
                                    control={control}
                                    name="difficulty"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a dificuldade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facil">Fácil</SelectItem>
                                                <SelectItem value="medio">Médio</SelectItem>
                                                <SelectItem value="dificil">Difícil</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="educationalContext">Contexto Educacional</Label>
                                <Controller
                                    control={control}
                                    name="educationalContext"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
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
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Linguagem / Tom das Questões</Label>
                                <Controller
                                    control={control}
                                    name="tone"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
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
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Tempo Estimado por Resposta</Label>
                                <Controller
                                    control={control}
                                    name="timeLimit"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
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
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    )
}