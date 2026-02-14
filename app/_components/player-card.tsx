'use client';

import { User, X } from "lucide-react";
import type Player from "@/types/Player";

interface PlayerCardProps {
  player: Player;
  colorClass: string;
  onKick: (player: Player) => void;
  disabled?: boolean;
}

export default function PlayerCard({ player, colorClass, onKick, disabled }: PlayerCardProps) {
  return (
    <div className="group relative flex items-center gap-2 bg-background border rounded-full pl-2 pr-4 py-1.5 shadow-sm animate-in zoom-in duration-300">
      <div className={`${colorClass} h-7 w-7 rounded-full flex items-center justify-center shrink-0`}>
        <User className="h-4 w-4 text-white" />
      </div>

      <span className="font-medium text-sm max-w-50 truncate" title={player.nickname}>
        {player.nickname}
      </span>

      <button
        type="button"
        onClick={() => onKick(player)}
        disabled={disabled}
        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 disabled:opacity-30 disabled:hover:scale-100"
        title="Expulsar"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
