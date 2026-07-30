'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAction } from '@/app/_actions/auth-actions';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginAction({ email, password });

      if (res.error) {
        toast.error(res.error);
      } else if (res.success && res.data) {
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
        }
        if (res.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        toast.success('Login realizado com sucesso!');
        router.push(from);
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao tentar entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Elementos decorativos de fundo para harmonia visual */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Card do Formulário */}
        <Card className="border-border/60 shadow-xl backdrop-blur-xs bg-card/80">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">EngageQuiz</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 mt-6">
              <Button
                type="submit"
                className="w-full font-semibold cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground mt-3">
                Ainda não tem conta?{' '}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline transition-colors"
                >
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
