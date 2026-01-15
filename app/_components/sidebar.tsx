'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SidebarProps {
    open: boolean;
    onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const [activeView, setActiveView] = useState<"quizzes" | "classes">("quizzes")

    return (
        <aside
            className={cn(
                "border-r bg-background transition-all duration-300",
                // Mobile: sidebar fixa como overlay
                "fixed md:relative top-16 md:top-0 left-0 h-[calc(100vh-4rem)] md:h-auto z-20",
                open ? "w-64" : "w-0 overflow-hidden",
            )}
        >
            <nav className="flex flex-col gap-2 p-4">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Navegação</h2>

                <Button
                    variant={activeView === "quizzes" ? "secondary" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveView("quizzes")}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Questionários
                </Button>
            </nav>
        </aside>
    )
}