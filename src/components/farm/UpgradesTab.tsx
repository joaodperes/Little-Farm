"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cog, Check } from "lucide-react";
import { UPGRADES, INITIAL_FARM_ROWS, FARM_COLS, type UpgradeDef } from "@/lib/game-data";

interface UpgradesTabProps {
  farm: {
    coins: number;
    farmRows: number;
    autoFarmerCount: number;
    autoSellerLevel: number;
    storageLevel: number;
    pesticideLevel: number;
    speedLevel: number;
    level: number;
  };
  onUpgrade: (id: string) => void;
}

export default function UpgradesTab({ farm, onUpgrade }: UpgradesTabProps) {
  const getLevel = (id: string): number => {
    switch (id) {
      case "expand": return farm.farmRows - INITIAL_FARM_ROWS;
      case "autoFarmer": return Math.floor(farm.autoFarmerCount / 5);
      case "autoSeller": return farm.autoSellerLevel;
      case "storage": return farm.storageLevel;
      case "pesticide": return farm.pesticideLevel;
      case "speed": return farm.speedLevel;
      default: return 0;
    }
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <Cog className="h-4 w-4 text-gray-600 dark:text-slate-400" /> Upgrades
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          {Object.values(UPGRADES).map((def) => {
            const currentLevel = getLevel(def.id);
            const maxed = currentLevel >= def.maxLevel;
            const cost = def.costFormula(currentLevel, {
              farmRows: farm.farmRows,
              autoFarmerCount: farm.autoFarmerCount,
            });
            const canAfford = farm.coins >= cost;
            const effectMsg = maxed && def.id === "autoFarmer"
              ? `${farm.autoFarmerCount} farmers (100% of max ${(INITIAL_FARM_ROWS + 8) * FARM_COLS} plots) · Harvests & replants automatically`
              : def.effectDescription(currentLevel + 1);

            return (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{def.emoji}</span>
                    <div>
                      <div className="font-medium text-sm">{def.name}</div>
                      <div className="text-[11px] text-muted-foreground">{def.description}</div>
                    </div>
                  </div>
                  <Badge variant={maxed ? "secondary" : "outline"} className="shrink-0">
                    {def.id === "autoFarmer"
                      ? maxed ? "MAX" : `${farm.autoFarmerCount} farmers`
                      : maxed ? "MAX" : `Lv.${currentLevel}`
                    }
                  </Badge>
                </div>
                {effectMsg && <div className="text-[10px] text-emerald-600 dark:text-emerald-400">{effectMsg}</div>}
                {!maxed && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${canAfford ? "text-amber-700 dark:text-amber-300" : "text-red-500 dark:text-rose-400"}`}>
                      Next: {cost}🪙
                    </span>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      disabled={!canAfford}
                      onClick={() => onUpgrade(def.id)}
                    >
                      Upgrade
                    </Button>
                  </div>
                )}
                {maxed && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Fully Upgraded
                  </div>
                )}
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}