"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, FlaskConical, Beaker, Info } from "lucide-react";
import { CROPS, formatDuration, getMissingMasteryCount, getHybridMixCost, TOTAL_CROP_COUNT } from "@/lib/game-data";
import { toast } from "sonner";

interface HybridDef {
  id: string;
  parent1: string;
  parent2: string;
  name: string;
  emoji: string;
  description: string;
  growthTimeSec: number;
  seedCost: number;
  baseSellPrice: number;
  xpReward: number;
  pestChanceMod: number;
  witherTimeMod: number;
  isKnown: boolean;
}

interface SeedLabTabProps {
  seedLabUnlocked: boolean;
  discoveredHybrids: string[];
  hybridDefs: Record<string, HybridDef>;
  masteries: Record<string, { harvestCount: number; masteryLevel: number; rank: string }>;
  inventory: Record<string, number>;
  coins: number;
  onMix: (parent1: string, parent2: string) => void;
}

export default function SeedLabTab({
  seedLabUnlocked, discoveredHybrids, hybridDefs, masteries, inventory, coins, onMix,
}: SeedLabTabProps) {
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const missing = getMissingMasteryCount(masteries);
  const baseCropIds = Object.keys(CROPS);

  // Available seeds for mixing (base crops only)
  const availableSeeds = baseCropIds
    .map((id) => ({ id, crop: CROPS[id], count: inventory[`seed_${id}`] || 0 }))
    .filter((s) => s.count > 0);

  const mixCost = selected1 && selected2 ? getHybridMixCost(selected1, selected2) : 0;
  const canMix = selected1 && selected2 && selected1 !== selected2
    && (inventory[`seed_${selected1}`] || 0) >= 3
    && (inventory[`seed_${selected2}`] || 0) >= 3
    && coins >= mixCost;

  const handleMix = () => {
    if (selected1 && selected2) onMix(selected1, selected2);
    setSelected1(null);
    setSelected2(null);
  };

  const selectCrop = (id: string) => {
    if (!selected1) setSelected1(id);
    else if (!selected2 && id !== selected1) setSelected2(id);
    else { setSelected1(id); setSelected2(null); }
  };

  if (!seedLabUnlocked) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FlaskConical className="h-10 w-10 text-purple-300 dark:text-violet-400 mx-auto mb-3" />
          <div className="font-medium text-gray-500 dark:text-slate-400">Seed Lab Locked</div>
          <div className="text-sm text-muted-foreground">
            Need mastery level 1 in all {TOTAL_CROP_COUNT} crops
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {missing} crop{missing !== 1 ? "s" : ""} remaining
          </div>
          <div className="w-48 mx-auto mt-3">
            <div className="h-1.5 bg-purple-100 dark:bg-violet-950/45 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${((TOTAL_CROP_COUNT - missing) / TOTAL_CROP_COUNT) * 100}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {TOTAL_CROP_COUNT - missing}/{TOTAL_CROP_COUNT} crops mastered
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mixing Station */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4 text-purple-600 dark:text-violet-400" /> Mixing Station
            </CardTitle>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-[10px] text-muted-foreground bg-purple-50 dark:bg-violet-950/45 rounded-lg p-2 mt-1.5"
            >
              Mix 3 seeds of two different crops to discover a hybrid. Hybrids have unique stats (growth, sell price, pest resistance, wither time). Stats are <b>hidden</b> until you grow 10 of them. You can not sell unknown hybrids!
            </motion.div>
          )}
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-3">
          {/* Selected Parents */}
          <div className="flex items-center gap-2">
            <div className={`flex-1 rounded-lg border-2 border-dashed p-2.5 text-center transition-all ${selected1 ? "border-purple-300 dark:border-violet-800 bg-purple-50 dark:bg-violet-950/45" : "border-gray-200 dark:border-slate-800"}`}>
              {selected1 ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-lg">{CROPS[selected1].emoji}</span>
                  <span className="text-xs font-medium">{CROPS[selected1].name}</span>
                  <span className="text-[9px] text-muted-foreground">×3</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Select crop 1</span>
              )}
            </div>
            <span className="text-lg font-bold text-purple-400 dark:text-violet-400">+</span>
            <div className={`flex-1 rounded-lg border-2 border-dashed p-2.5 text-center transition-all ${selected2 ? "border-purple-300 dark:border-violet-800 bg-purple-50 dark:bg-violet-950/45" : "border-gray-200 dark:border-slate-800"}`}>
              {selected2 ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-lg">{CROPS[selected2].emoji}</span>
                  <span className="text-xs font-medium">{CROPS[selected2].name}</span>
                  <span className="text-[9px] text-muted-foreground">×3</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Select crop 2</span>
              )}
            </div>
          </div>

          {mixCost > 0 && (
            <div className="text-xs text-muted-foreground text-center">
              Mixing cost: {mixCost}🪙 · You get 3 hybrid seeds
            </div>
          )}

          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={!canMix}
            onClick={handleMix}
          >
            <Beaker className="w-4 h-4 mr-1.5" />
            Mix Seeds
          </Button>

          {/* Available Seeds Grid */}
          <div className="text-[10px] text-muted-foreground font-medium">Available seeds (tap to select):</div>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {availableSeeds.length === 0 ? (
              <span className="text-xs text-muted-foreground">No seeds in inventory. Buy from the Shop!</span>
            ) : (
              availableSeeds.map(({ id, crop, count }) => {
                const isSelected = selected1 === id || selected2 === id;
                const has3 = count >= 3;
                return (
                  <button
                    key={id}
                    onClick={() => selectCrop(id)}
                    disabled={!has3}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                      isSelected
                        ? "border-purple-400 dark:border-violet-700 bg-purple-100 dark:bg-violet-950/45 text-purple-800 dark:text-violet-200 shadow-sm"
                        : has3
                          ? "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-violet-950/45 hover:border-purple-200 dark:hover:border-violet-800"
                          : "border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-gray-300 dark:text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {crop.emoji} {count}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Discovered Hybrids */}
      {discoveredHybrids.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold">
              🧬 Discovered Hybrids ({discoveredHybrids.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {discoveredHybrids.map((id) => {
                const h = hybridDefs[id];
                if (!h) return null;
                const p1 = CROPS[h.parent1];
                const p2 = CROPS[h.parent2];
                const seedCount = inventory[`seed_${id}`] || 0;
                const cropCount = inventory[`crop_${id}`] || 0;
                const harvestCount = masteries[id]?.harvestCount ?? 0;
                const known = h.isKnown;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{h.emoji}</span>
                        <div>
                          <div className="font-medium text-sm">
                            {known ? h.name : "???"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {p1?.emoji}{p2?.emoji} {p1?.name} × {p2?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={known ? "default" : "outline"} className={`text-[9px] ${known ? "bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" : ""}`}>
                          {known ? "Known" : "Unknown"}
                        </Badge>
                        <span className="text-[9px] text-muted-foreground">
                          🌱{seedCount} 🌾{cropCount}
                        </span>
                      </div>
                    </div>

                    {/* Stats (known or unknown) */}
                    <div className={`grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] ${known ? "text-muted-foreground" : "text-purple-300 dark:text-violet-400"}`}>
                      <div>Growth: {known ? formatDuration(h.growthTimeSec) : "???"}</div>
                      <div>Sell: {known ? `${h.baseSellPrice}🪙` : "???"}</div>
                      <div>XP: {known ? `+${h.xpReward}` : "???"}</div>
                      <div>Pest: {known ? `${h.pestChanceMod < 1 ? "Resistant" : h.pestChanceMod > 1.5 ? "Vulnerable" : "Normal"}` : "???"}</div>
                      <div>Wither: {known ? `${h.witherTimeMod < 1 ? "Fragile" : h.witherTimeMod > 1.5 ? "Sturdy" : "Normal"}` : "???"}</div>
                      <div>{known ? h.description : "Grow 10 to identify"}</div>
                    </div>

                    {/* Mastery progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="h-1 bg-gray-100 dark:bg-slate-800/40 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${known ? "bg-emerald-500" : "bg-purple-400 dark:bg-violet-900/40"}`}
                            style={{ width: `${Math.min(100, (harvestCount / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground w-12 text-right">
                        {Math.min(harvestCount, 10)}/10
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
