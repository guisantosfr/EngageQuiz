import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-5">
                <Skeleton className="h-8 w-32" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-24" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                            <Skeleton className="h-10" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}