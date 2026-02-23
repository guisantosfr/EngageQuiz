import { HomeLayout } from "./_components/home-layout"
import { EmptyState } from "./_components/empty-state"
import { Quiz } from "@/types/Quiz"
import { NewQuizModal } from "./_components/new-quiz-modal"
import QuizCard from "./_components/quiz-card"
import { ErrorBoundary } from "@/components/error-boundary"
import { getQuizzes } from "./_actions/quiz-queries"

export default async function Home() {
  const quizzes: Quiz[] = await getQuizzes();

  return (
    <div className="flex flex-col h-full">
      <HomeLayout>
        <main className="flex-1 container px-5 md:px-12 py-4 md:py-6 mx-auto">
          <div className="flex sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Questionários</h2>
            <div className="flex items-center gap-2">
              <ErrorBoundary variant="card" title="Erro no modal">
                <NewQuizModal />
              </ErrorBoundary>
            </div>
          </div>

          <div className="space-y-4">
            {
              quizzes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz) => (
                    <ErrorBoundary key={quiz.id} variant="card" title="Erro ao carregar quiz">
                      <QuizCard quiz={quiz} />
                    </ErrorBoundary>
                  ))}
                </div>
              )
            }
          </div>
        </main>
      </HomeLayout>
    </div>
  );
}
