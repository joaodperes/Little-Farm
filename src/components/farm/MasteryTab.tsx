"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Check, Lock } from "lucide-react";
import {
  CROPS, MASTERY_RANKS, getNextMasteryRank, ACHIEVEMENTS,
  type AchievementStats, type AchievementDef,
} from "@/lib/game-data";

interface MasteryTabProps {
  masteries: Record<string, { harvestCount: number; masteryLevel: number; rank: string }>;
  totalHarvests: number;
  masteryLevel6Count: number;
  animalCount: number;
  level: number;
}

export default function MasteryTab({
  masteries, totalHarvests, masteryLevel6Count, animalCount, level,
}: MasteryTabProps) {
  const stats: AchievementStats = {
    totalHarvests,
    totalCoinsEarned: 0,
    level,
    masteryLevel6Count,
    animalCount,
  };

  return (
    <div className="space-y-4">
      {/* Crop Mastery Grid */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-600" /> Crop Mastery
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {Object.values(CROPS).map((crop) => {
              const m = masteries[crop.id];
              const count = m?.harvestCount ?? 0;
              const ml = m?.masteryLevel ?? 0;
              const hasHarvested = count > 0;
              const nextRank = getNextMasteryRank(count);
              const currentRank = MASTERY_RANKS[ml - 1];
              const pct = nextRank
                ? ((count - (currentRank?.threshold ?? 0)) / (nextRank.threshold - (currentRank?.threshold ?? 0))) * 100
                : 100;

              return (
                <div
                  key={crop.id}
                  className={`rounded-lg border p-2 space-y-1 ${
                    hasHarvested ? "bg-white" : "bg-gray-50 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{crop.emoji}</span>
                      <span className="text-xs font-medium">{crop.name}</span>
                    </div>
                    {ml > 0 && (
                      <Badge variant="outline" className={`text-[9px] px-1 ${currentRank?.color ?? ""}`}>
                        {currentRank?.emoji} {currentRank?.name}
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {count} harvests
                    {ml > 0 && <span className="text-emerald-600 ml-1">(+{ml * 3}% sell, +{ml * 2}% XP)</span>}
                  </div>
                  {nextRank && hasHarvested ? (
                    <div>
                      <Progress value={Math.min(100, pct)} className="h-1.5" />
                      <div className="text-[9px] text-muted-foreground">
                        {nextRank.emoji} {nextRank.name} at {nextRank.threshold}
                      </div>
                    </div>
                  ) : ml >= 6 ? (
                    <div className="text-[9px] text-amber-600 font-medium">👑 MAX MASTERY</div>
                  ) : (
                    <div className="text-[9px] text-muted-foreground">{MASTERY_RANKS[0].emoji} Next: {MASTERY_RANKS[0].threshold} harvests</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-600" /> Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {ACHIEVEMENTS.map((ach) => {
              const done = ach.check(stats);
              return (
                <div
                  key={ach.id}
                  className={`flex items-center gap-2 rounded-lg border p-2 ${
                    done ? "bg-amber-50 border-amber-300" : "bg-gray-50"
                  }`}
                >
                  <span className={`text-lg ${done ? "" : "grayscale opacity-40"}`}>{ach.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium ${done ? "text-amber-800" : "text-muted-foreground"}`}>
                      {ach.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{ach.description}</div>
                  </div>
                  {done && <Check className="h-4 w-4 text-amber-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}