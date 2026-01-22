import { HomeLayout } from "./_components/home-layout"
import { EmptyState } from "./_components/empty-state"
import { Quiz } from "@/types/Quiz"
import { NewQuizModal } from "./_components/new-quiz-modal"
import QuizCard from "./_components/quiz-card"

export default async function Home() {
  let quizzes: Quiz[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`);

    if (res.ok) {
        const data = await res.json();
        quizzes = Array.isArray(data) ? data : [];
    }  
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    quizzes = [];
  }

  return (
    <div className="flex flex-col h-full">
      <HomeLayout>
        <main className="flex-1 container px-4 md:px-8 py-4 md:py-6 mx-auto">
          <div className="flex sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Questionários</h2>
            <div className="flex items-center gap-2">
              <NewQuizModal />
            </div>
          </div>

          <div className="space-y-4">
            {
              quizzes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} />
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
