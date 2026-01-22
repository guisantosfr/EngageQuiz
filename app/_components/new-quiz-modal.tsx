"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, PlusCircle, Sparkles } from "lucide-react"

export function NewQuizModal() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowCreateModal(true)} className="flex items-center">
        <PlusCircle className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Novo Questionário</span>
        <span className="inline sm:hidden">Novo</span>
      </Button>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Questionário</DialogTitle>
            <DialogDescription>Escolha como deseja criar seu questionário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
              asChild
              onClick={() => setShowCreateModal(false)}
            >
              <Link href="/quizzes/new">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-semibold">Criação Manual</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Crie seu questionário do zero, adicionando questões manualmente
                </p>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 bg-transparent"
              asChild
              onClick={() => setShowCreateModal(false)}
            >
              <Link href="/quizzes/new-ai">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">Criar com IA</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  Gere questões automaticamente usando <b>inteligência artificial</b>
                </p>
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}