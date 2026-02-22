"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { QuizForm } from "@/app/_components/quiz-form";
import { generateAIQuiz } from "@/app/_actions/quiz-actions";
import { ErrorBoundary } from "@/components/error-boundary";
import BasicAIConfig from "@/app/_components/basic-ai-config";
import AdvancedAIConfig, { AIQuizFormValues } from "@/app/_components/advanced-ai-config";

function CreateAIQuizContent() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition()
    const [generatedData, setGeneratedData] = useState<any>(null)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const { control, handleSubmit } = useForm<AIQuizFormValues>({
        defaultValues: {
            theme: "",
            subtopics: "",
            restrictions: "",
            targetAudience: "",
            questionCount: 10,
            questionTypes: "ALL",
            generalComments: "",
            learningObjective: "",
            difficulty: "",
            educationalContext: "",
            tone: "",
            timeLimit: "",
        },
    })

    const onSubmit = (values: AIQuizFormValues) => {
        if (!values.targetAudience) {
            return toast.error("Por favor, selecione o nível/público alvo")
        }

        const body = {
            mainSubject: values.theme,
            topicsToInclude: values.subtopics,
            restrictions: values.restrictions,
            level: values.targetAudience,
            numberOfQuestions: values.questionCount,
            questionTypes: values.questionTypes,
            otherComments: values.generalComments,
            learningObjective: values.learningObjective,
            difficultyLevel: values.difficulty,
            educationalContext: values.educationalContext,
            tone: values.tone,
            estimatedTime: values.timeLimit,
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <BasicAIConfig control={control} disabled={isPending} />

                    <AdvancedAIConfig
                        control={control}
                        isOpen={isAdvancedOpen}
                        onOpenChange={setIsAdvancedOpen}
                        disabled={isPending}
                    />

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
