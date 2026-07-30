'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileText, Loader2, LogOut, User } from "lucide-react";
import { getAuthUser, logoutAction } from "@/app/_actions/auth-actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SidebarProps {
    open: boolean;
    onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [userName, setUserName] = useState<string>('');
    const [loggingOut, setLoggingOut] = useState<boolean>(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState<boolean>(false);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed?.name) {
                    setUserName(parsed.name);
                }
            }
        } catch (e) {
            console.error("Erro ao ler dados do localStorage:", e);
        }

        getAuthUser().then((user) => {
            if (user?.name) {
                setUserName(user.name);
            }
        });
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logoutAction();
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            toast.success('Sessão encerrada com sucesso.');
            router.push('/login');
        } catch (error) {
            toast.error('Erro ao encerrar sessão. Tente novamente.');
        } finally {
            setLoggingOut(false);
            setIsLogoutDialogOpen(false);
        }
    };

    const isQuizzesActive = pathname === "/quizzes" || pathname.startsWith("/quizzes/");

    return (
        <aside
            className={cn(
                "border-r bg-background transition-all duration-300 flex flex-col justify-between shrink-0",
                "fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] z-20",
                open ? "w-64" : "w-0 overflow-hidden",
            )}
        >
            {/* Seção Superior de Navegação */}
            <nav className="flex flex-col gap-2 p-4">
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">Navegação</h2>

                <Button
                    variant={isQuizzesActive ? "secondary" : "ghost"}
                    className="justify-start"
                    asChild
                    onClick={onClose}
                >
                    <Link href="/quizzes">
                        <FileText className="mr-2 h-4 w-4" />
                        Questionários
                    </Link>
                </Button>
            </nav>
            {/* Seção Inferior com Informações do Usuário e Logout */}
            <div className="p-3 border-t border-border mt-auto">
                <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-3 w-full p-2.5 rounded-lg hover:bg-accent/70 text-left transition-colors group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-destructive/10 group-hover:text-destructive transition-colors shrink-0">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                                    Logado como
                                </span>
                                <span className="text-sm font-semibold truncate text-foreground group-hover:text-destructive transition-colors">
                                    {userName || 'Usuário'}
                                </span>
                            </div>
                            <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors shrink-0" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Você precisará fazer login novamente com suas credenciais para acessar a plataforma.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loggingOut}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                                disabled={loggingOut}
                                className={buttonVariants({ variant: "destructive" })}
                            >
                                {loggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sair
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </aside>
    )
}