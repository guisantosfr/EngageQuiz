'use client';

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
    const [activeView, setActiveView] = useState<"quizzes" | "classes">("quizzes")

    return (
        <aside
            className={cn(
                "border-r bg-muted/40 transition-all duration-300",
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