'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Medal, Trophy, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface RankingEntry {
  position: number;
  playerId: string;
  nickname: string;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
}

interface FinalResultsProps {
  ranking: RankingEntry[];
}

const PODIUM_COLORS = [
  "bg-yellow-500",   // 1º — ouro
  "bg-gray-400",     // 2º — prata
  "bg-orange-600",   // 3º — bronze
];

const PODIUM_HEIGHTS = ["h-32", "h-24", "h-16"];

const MEDAL_COLORS = [
  "text-yellow-500",
  "text-gray-400",
  "text-orange-500",
];

function formatAccuracy(accuracy: number) {
  return `${Math.round(accuracy)}%`;
}

export default function FinalResults({ ranking }: FinalResultsProps) {
  const router = useRouter();

  const podium = ranking.slice(0, 3);
  const hasPodium = podium.length >= 3;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <Card className="w-full max-w-3xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Trophy className="h-7 w-7 text-yellow-500" />
            <h1 className="text-3xl font-bold text-center">Resultado Final</h1>
          </div>

          {/* Pódio */}
          {hasPodium && (
            <div className="flex justify-center items-end gap-4 mb-8">
              {podium.map((p, index) => {
                // Reordena visualmente: 2º | 1º | 3º
                const visualOrder = index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3";
                return (
                  <div
                    key={p.playerId}
                    className={`flex flex-col items-center ${visualOrder}`}
                  >
                    <div className="text-center mb-2">
                      <p className="font-bold truncate max-w-24">{p.nickname}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.correctAnswers === 0
                          ? "Nenhum acerto"
                          : p.correctAnswers === 1
                            ? "1 acerto"
                            : `${p.correctAnswers} acertos`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatAccuracy(p.accuracy)}
                      </p>
                    </div>
                    <div
                      className={`w-20 flex items-center justify-center text-2xl font-bold rounded-t-lg text-white ${PODIUM_COLORS[index]} ${PODIUM_HEIGHTS[index]}`}
                    >
                      {p.position}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranking completo */}
          <div className="mb-8">
            <h2 className="font-semibold mb-3 text-center">Ranking Completo</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {ranking.map((p) => (
                <div
                  key={p.playerId}
                  className={`flex justify-between items-center p-3 rounded-lg ${p.position <= 3
                    ? "bg-muted/80 border border-border"
                    : "bg-muted"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {p.position <= 3 ? (
                      <Medal className={`h-5 w-5 ${MEDAL_COLORS[p.position - 1]}`} />
                    ) : (
                      <span className="w-5 text-center font-bold text-sm text-muted-foreground">
                        {p.position}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{p.nickname}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">
                      {p.correctAnswers}/{p.totalAnswers}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatAccuracy(p.accuracy)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => router.replace("/")}
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar à Tela Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}