'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, Gamepad2, User, ShieldAlert, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { logoutAction, getAuthUser, UserSession } from '@/app/_actions/auth-actions';
import { toast } from 'sonner';

export default function StudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      try {
        // Tenta buscar da sessão do servidor primeiro
        const authUser = await getAuthUser();
        if (authUser) {
          setUser(authUser);
        } else {
          // Fallback para localStorage
          const cached = localStorage.getItem('user');
          if (cached) {
            setUser(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
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
      toast.error('Erro ao encerrar sessão.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        <Card className="border-border/60 shadow-xl backdrop-blur-xs bg-card/80">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                Área do Estudante <Sparkles className="w-5 h-5 text-amber-500" />
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Painel de acesso para alunos da plataforma EngageQuiz
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Card com informações do Usuário */}
            <div className="flex items-center gap-3 p-3.5 rounded-lg border bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold">
                <User className="w-5 h-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name || 'Estudante'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'email@aluno.com'}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Estudante
              </span>
            </div>

            {/* Quadro explicativo sobre a restrição de gerenciamento */}
            <div className="p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Acesso a gerenciamento restrito</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                A criação, edição e gerenciamento de questionários nesta plataforma web são exclusivos para a função de <strong>Professor</strong>.
              </p>
            </div>

            {/* Dica de como jogar um quiz */}
            <div className="p-4 rounded-lg border bg-card/50 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                <Gamepad2 className="w-4 h-4 text-primary shrink-0" />
                <span>Como participar de um Quiz?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Para ingressar em um quiz ao vivo, utilize o link direto ou código de acesso da sessão fornecido pelo seu professor durante a aula.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Encerrando sessão...' : 'Sair da Conta'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
