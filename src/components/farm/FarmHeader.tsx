"use client";

import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Coins, Star, Bot, Banknote, Info } from "lucide-react";
import {
  getNextUnlock, formatDuration,
  getCropTierLabel,
} from "@/lib/game-data";
import { toast } from "sonner";

interface FarmHeaderProps {
  coins: number;
  level: number;
  xpInCurrentLevel: number;
  xpNeeded: number;
  autoFarmerCount: number;
  autoSellerLevel: number;
  autoFarmerEnabled: boolean;
  autoSellerEnabled: boolean;
}

export default function FarmHeader({
  coins, level, xpInCurrentLevel, xpNeeded,
  autoFarmerCount, autoSellerLevel, autoFarmerEnabled, autoSellerEnabled,
}: FarmHeaderProps) {
  const xpPercent = xpNeeded > 0 ? Math.min(100, (xpInCurrentLevel / xpNeeded) * 100) : 0;

  const handleXpClick = () => {
    const next = getNextUnlock(level);
    if (next) {
      toast.info(`${next.emoji} ${next.name} unlocks at Lv.${next.requiredLevel} (${getCropTierLabel(next.tier)})`, {
        description: `Growth: ${formatDuration(next.growthTimeSec)} · Sell: ${next.baseSellPrice}🪙 · XP: +${next.xpReward}`,
        duration: 4000,
      });
    } else {
      toast.success("All crops unlocked! You're a master farmer! 🌾");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <h1 className="text-xl font-bold text-green-800 tracking-tight">
            Little Farm
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {autoFarmerCount > 0 && (
            <Badge
              variant="secondary"
              className={`gap-1 ${autoFarmerEnabled ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "opacity-50"}`}
            >
              <Bot className="w-3 h-3" />
              ×{autoFarmerCount}
            </Badge>
          )}
          {autoSellerLevel > 0 && (
            <Badge
              variant="secondary"
              className={`gap-1 ${autoSellerEnabled ? "bg-amber-100 text-amber-700 border-amber-200" : "opacity-50"}`}
            >
              <Banknote className="w-3 h-3" />
              Lv.{autoSellerLevel}
            </Badge>
          )}
          <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-amber-700 text-sm">
              {coins.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Star className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">
              Lv.{level}
            </span>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mt-2 flex items-center gap-2">
        <button
          className="text-[11px] font-medium text-emerald-600 whitespace-nowrap hover:text-emerald-800 transition-colors"
          onClick={handleXpClick}
          title="Click to see next unlock"
        >
          <Info className="w-3 h-3 inline mr-0.5" />
          XP {xpInCurrentLevel}/{xpNeeded}
        </button>
        <Progress
          value={xpPercent}
          className="h-1.5 bg-emerald-100 flex-1"
        />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          Lv.{level}
        </span>
      </div>
    </motion.div>
  );
}
