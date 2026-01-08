// app/_components/dashboard-layout.tsx
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Sidebar from "./sidebar";

export function HomeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background w-full px-8 mx-auto">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-2xl font-bold">EngageQuiz</h1>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} />
        {children}
      </div>
    </>
  );
}