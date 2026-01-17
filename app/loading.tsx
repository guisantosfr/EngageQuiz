import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeLayout } from "./_components/home-layout";

export default function Loading() {
    return (
        <div className="flex min-h-screen flex-col">
            <HomeLayout>
                <main className="flex-1 container px-4 md:px-8 py-4 md:py-6 mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-10 w-40" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-20 mt-2" />
                                </CardHeader>
                                <CardFooter className="flex justify-between">
                                    <Skeleton className="h-9 w-24" />
                                    <Skeleton className="h-9 w-24" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </main>
            </HomeLayout>
        </div>
    );
}
