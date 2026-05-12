import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <main className="container px-4 md:px-8 py-6 mx-auto animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardHeader>
                        <CardFooter className="flex justify-between mt-4">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-20" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </main>
    );
}