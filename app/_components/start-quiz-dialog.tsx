import {
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

const StartQuizDialog = ({ onClick }: {onClick: () => void}) => {
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Iniciar questionário?
                </AlertDialogTitle>

                <AlertDialogDescription>
                    Isto criará uma nova sessão deste questionário para os alunos
                    se conectarem em tempo real.
                </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
                <AlertDialogCancel>
                    Cancelar
                </AlertDialogCancel>

                <AlertDialogAction onClick={onClick}>
                    Iniciar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}

export default StartQuizDialog;