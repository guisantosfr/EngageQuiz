import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

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
          <Button>Novo Questionário</Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}
