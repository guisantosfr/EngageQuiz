"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, PlayCircle, ArrowLeft } from "lucide-react"

interface SuccessModalProps {
    mode: 'create' | 'edit'
    open: boolean
    onOpenChange: (open: boolean) => void
    onBack: () => void
}

export function SuccessModal({ mode, open, onOpenChange, onBack }: SuccessModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-950">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        {
                            mode === 'create' 
                            ? 'Questionário criado com sucesso!'
                            : 'Questionário editado com sucesso!'
                        }
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        O que você deseja fazer?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col md:flex-row gap-3">
                    <Button onClick={onBack} variant="outline" size="lg">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </Button>
                    <Button size="lg">
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Iniciar Questionário
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}