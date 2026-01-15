import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Pencil } from "lucide-react"
import { HomeLayout } from "./_components/home-layout"
import { EmptyState } from "./_components/empty-state"
import { Quiz } from "@/types/Quiz"
import { NewQuizModal } from "./_components/new-quiz-modal"

export default async function Home() {
  let quizzes: Quiz[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes`, {
      cache: 'no-store'
    });

    quizzes = await res.json();
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
    quizzes = [];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HomeLayout>
        <main className="flex-1 container px-4 md:px-8 py-4 md:py-6 mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                    <Card key={quiz.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.questions?.length} {quiz.questions?.length === 1 ? 'questão' : 'questões'}
                        </CardDescription>
                      </CardHeader>

                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/quizzes/${quiz.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </Button>

                        <Button size="sm" asChild>
                          <Link href={`/`}>
                            <Play className="mr-2 h-4 w-4" />
                            Iniciar
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
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
