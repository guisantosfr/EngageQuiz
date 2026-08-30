"use client"

import { Control, Controller } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { AIQuizFormValues } from "./advanced-ai-config"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

interface BasicAIConfigProps {
    control: Control<AIQuizFormValues>
    disabled?: boolean
}

export default function BasicAIConfig({ control, disabled }: BasicAIConfigProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Configure os parâmetros principais do seu questionário</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="theme">
                        Tema / Assunto Principal <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        control={control}
                        name="theme"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Input
                                id="theme"
                                placeholder="Ex: Revolução Francesa, Funções Quadráticas, Sistema Solar..."
                                disabled={disabled}
                                autoComplete="off"
                                required
                                maxLength={50}
                                {...field}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subtopics">Subtópicos / Assuntos a Incluir (Opcional)</Label>
                    <Controller
                        control={control}
                        name="subtopics"
                        render={({ field }) => (
                            <Textarea
                                id="subtopics"
                                placeholder="Ex: Causas da revolução, Queda da Bastilha, Período do Terror..."
                                rows={3}
                                disabled={disabled}
                                maxLength={200}
                                {...field}
                            />
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="restrictions">Restrições / O Que Não Incluir (opcional)</Label>
                    <Controller
                        control={control}
                        name="restrictions"
                        render={({ field }) => (
                            <Textarea
                                id="restrictions"
                                placeholder="Ex: Não incluir datas específicas, evitar questões sobre biografias..."
                                rows={2}
                                maxLength={200}
                                {...field}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>
                            Nível / Público Alvo <span className="text-destructive">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="targetAudience"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={disabled}
                                >
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
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="questionsCount">Quantidade de questões</Label>
                        <Controller
                            control={control}
                            name="questionCount"
                            render={({ field }) => (
                                <div className="pt-2 space-y-3">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => field.onChange(Math.max(2, field.value - 1))}
                                            disabled={disabled || field.value <= 2}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <Slider
                                            id="questionsCount"
                                            min={2}
                                            max={20}
                                            step={1}
                                            value={[field.value]}
                                            onValueChange={(v) => field.onChange(v[0])}
                                            disabled={disabled}
                                            className="flex-1 cursor-pointer"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => field.onChange(Math.min(20, field.value + 1))}
                                            disabled={disabled || field.value >= 20}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="text-center text-2xl text-primary">{field.value}</div>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <Label>
                        Tipos de Questão <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                        control={control}
                        name="questionTypes"
                        render={({ field }) => (
                            <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="flex flex-col sm:flex-row gap-4"
                                disabled={disabled}
                            >
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
                        )}
                    />
                </div>

                <div className="space-y-3 pt-3">
                    <Label htmlFor="generalComments">Comentários e Instruções Gerais (opcional)</Label>
                    <Controller
                        control={control}
                        name="generalComments"
                        render={({ field }) => (
                            <Textarea
                                id="generalComments"
                                placeholder="Ex: Não incluir pegadinhas, não gerar questões subjetivas, priorizar questões práticas..."
                                rows={3}
                                maxLength={200}
                                {...field}
                            />
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}