"use client"

import { useEffect } from "react"
import Swal from "sweetalert2"

interface SuccessModalProps {
    mode: "create" | "edit"
    open: boolean
    onOpenChange: (open: boolean) => void
    onBack: () => void
}

export function SuccessModal({ mode, open, onOpenChange, onBack }: SuccessModalProps) {
    useEffect(() => {
        if (!open) return

        let mounted = true

        Swal.fire({
            title:
                mode === "create"
                    ? "Questionário criado com sucesso!"
                    : "Questionário editado com sucesso!",
            text: "O que você deseja fazer?",
            icon: "success",
            showCancelButton: true,
            confirmButtonText: "Iniciar Questionário",
            cancelButtonText: "Voltar",
            allowOutsideClick: false,
            allowEscapeKey: false,
            theme: 'auto',
            width: 520,
        }).then((result) => {
            if (!mounted) return

            // always close the external/open state
            onOpenChange(false)

            if (result.isConfirmed) {
                // user chose to start the quiz
                // there was no onStart handler in the original component,
                // so we just close the modal here. Add a prop if you need more behavior.
                return
            }

            if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                // user clicked "Voltar"
                onBack()
            }
        })

        return () => {
            mounted = false
        }
    }, [open, mode, onOpenChange, onBack])

    // This component is purely imperative (SweetAlert2), so render nothing.
    return null
}