"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home, Trash2 } from "lucide-react"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
    /** Variante de fallback: 'page' para páginas inteiras, 'card' para componentes menores, 'inline' para itens de lista */
    variant?: "page" | "card" | "inline"
    /** Título customizado para o erro */
    title?: string
    /** Callback opcional quando o usuário clica em "Tentar novamente" */
    onReset?: () => void
    /** Callback opcional para ação de remoção (útil para itens de lista) */
    onRemove?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        this.props.onReset?.()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            const { variant = "card", title = "Algo deu errado", onRemove } = this.props

            if (variant === "page") {
                return <PageErrorFallback title={title} onReset={this.handleReset} />
            }

            if (variant === "inline") {
                return <InlineErrorFallback title={title} onReset={this.handleReset} onRemove={onRemove} />
            }

            return <CardErrorFallback title={title} onReset={this.handleReset} />
        }

        return this.props.children
    }
}

// Fallback para páginas inteiras
function PageErrorFallback({ title, onReset }: { title: string; onReset: () => void }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Ocorreu um erro inesperado. Por favor, tente novamente ou volte para a página inicial.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                        <Home className="mr-2 h-4 w-4" />
                        Página Inicial
                    </Button>
                    <Button onClick={onReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tentar Novamente
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

// Fallback para cards e seções
function CardErrorFallback({ title, onReset }: { title: string; onReset: () => void }) {
    return (
        <Card className="border-destructive/50">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="mb-3 h-8 w-8 text-destructive" />
                <p className="font-medium text-destructive">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Não foi possível carregar este conteúdo.
                </p>
                <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Tentar Novamente
                </Button>
            </CardContent>
        </Card>
    )
}

// Fallback para itens inline (como questões em uma lista)
function InlineErrorFallback({
    title,
    onReset,
    onRemove
}: {
    title: string;
    onReset: () => void;
    onRemove?: () => void
}) {
    return (
        <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                        <p className="font-medium text-destructive">{title}</p>
                        <p className="text-sm text-muted-foreground">Erro ao renderizar este item.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onReset}>
                        <RefreshCw className="h-3 w-3" />
                    </Button>
                    {onRemove && (
                        <Button variant="destructive" size="sm" onClick={onRemove}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default ErrorBoundary
