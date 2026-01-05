import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Play, FileText, Pencil } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

export default async function Home() {
  let quizzes = [];
  
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
    <div className="flex min-h-screen flex-col w-9/10 mx-auto">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
            <h1 className="text-2xl font-bold">EngageQuiz</h1>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Meus Questionários</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/quizzes/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Questionário
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="quizzes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="quizzes" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Questionários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-4">
            {
              quizzes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        <CardDescription>{quiz.questions} questions</CardDescription>
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

          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
