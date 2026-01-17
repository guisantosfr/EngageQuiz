import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function QuizSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <Card>
                <CardHeader>
                    <div className="h-6 bg-muted rounded w-48"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-10 bg-muted rounded w-full"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-24 bg-muted rounded w-full"></div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-5">
                <div className="h-8 bg-muted rounded w-32"></div>
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-24"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-10 bg-muted rounded w-full"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-muted rounded"></div>
                            <div className="h-10 bg-muted rounded"></div>
                            <div className="h-10 bg-muted rounded"></div>
                            <div className="h-10 bg-muted rounded"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}