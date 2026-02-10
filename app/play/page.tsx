import { ErrorBoundary } from "@/components/error-boundary";
import { getSession, getPlayers } from "../_actions/session-actions";
import { LobbyClient } from "../_components/lobby-client";
import { QuestionDisplay } from "../_components/question-display";
import { redirect } from "next/navigation";

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

    session.status = 'IN_PROGRESS';

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Sessão não encontrada ou expirada.</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (session.status) {
            case 'CREATED':
                return (
                    <LobbyClient
                        initialSession={session}
                        initialPlayers={initialPlayers}
                        sessionId={sessionId}
                        quizId={quizId}
                    />
                );
            case 'IN_PROGRESS':
                return (
                    <QuestionDisplay
                        sessionId={sessionId}
                        quizId={quizId}
                    />
                );
            default:
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <p className="text-muted-foreground">Sessão encerrada.</p>
                    </div>
                );
        }
    };

    return (
        <ErrorBoundary variant="page" title="Erro na sessão do quiz">
            {renderContent()}
        </ErrorBoundary>
    );
}