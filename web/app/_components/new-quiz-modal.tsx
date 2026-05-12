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
          <div className="grid grid-cols-2 gap-3 py-4">
            <Link
              href="/quizzes/new"
              onClick={() => setShowCreateModal(false)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors text-center"
            >
              <FileText className="h-8 w-8 text-muted-foreground" />
              <span className="font-semibold text-sm">Criação Manual</span>
              <p className="text-xs text-muted-foreground">
                Crie do zero
              </p>
            </Link>
            <Link
              href="/quizzes/new-ai"
              onClick={() => setShowCreateModal(false)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-accent transition-colors text-center"
            >
              <Sparkles className="h-8 w-8 text-muted-foreground" />
              <span className="font-semibold text-sm">Criar com IA</span>
              <p className="text-xs text-muted-foreground">
                Gere com IA
              </p>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}