import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        {/* <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia> */}
        <EmptyTitle>Sem questionários</EmptyTitle>

        <EmptyDescription>
          Você ainda não tem nenhum questionário.<br />Crie seu primeiro questionário clicando no botão abaixo.
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="flex gap-2">
          <Button asChild>
              <Link href="/quizzes/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Questionário
              </Link>
            </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
