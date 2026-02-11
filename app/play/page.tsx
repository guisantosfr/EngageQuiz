import { ErrorBoundary } from "@/components/error-boundary";
import { getSession, getPlayers } from "../_actions/session-actions";
import { redirect } from "next/navigation";
import { PlayContent } from "../_components/play-content";

interface PageProps {
    searchParams: Promise<{
        quizId?: string;
        sessionId?: string;
    }>;
}

export default async function PlayQuizPage({ searchParams }: PageProps) {
    const { quizId, sessionId } = await searchParams;

    if (!quizId || !sessionId) {
        redirect('/');
    }

    const [session, initialPlayers] = await Promise.all([
        getSession(sessionId, quizId),
        getPlayers(sessionId)
    ]);

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Sessão não encontrada ou expirada.</p>
            </div>
        );
    }

    return (
        <ErrorBoundary variant="page" title="Erro na sessão do quiz">
            <PlayContent
                initialSession={session}
                initialPlayers={initialPlayers}
                sessionId={sessionId}
                quizId={quizId}
            />
        </ErrorBoundary>
    );
}