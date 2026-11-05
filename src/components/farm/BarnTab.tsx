"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Clock, ShoppingCart } from "lucide-react";
import { ANIMALS, CROPS, formatDuration } from "@/lib/game-data";
import { toast } from "sonner";

interface AnimalResponse {
  id: string;
  animalType: string;
  emoji: string;
  name: string;
  productEmoji: string;
  productName: string;
  productSellPrice: number;
  productsReady: number;
  nextProductTime: number;
  fedAt: string | null;
  lastCollectedAt: string;
  feedCrop: string | null;
  feedCropEmoji: string;
  feedCropName: string;
}

interface BarnTabProps {
  level: number;
  coins: number;
  inventory: Record<string, number>;
  animals: AnimalResponse[];
  onBuy: (animalType: string) => void;
  onFeed: (animalId: string) => void;
  onCollect: (animalId: string) => void;
}

export default function BarnTab({ level, coins, inventory, animals, onBuy, onFeed, onCollect }: BarnTabProps) {
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const iv = setInterval(() => {
      setTimers((prev) => {
        const next: Record<string, number> = {};
        for (const a of animals) {
          const base = a.nextProductTime;
          next[a.id] = Math.max(0, (prev[a.id] ?? base) - 1);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [animals]);

  if (level < 46) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Lock className="h-10 w-10 text-gray-300 dark:text-slate-400 mx-auto mb-3" />
          <div className="font-medium text-gray-500 dark:text-slate-400">Barn Locked</div>
          <div className="text-sm text-muted-foreground">Unlocks at Level 46</div>
          <div className="text-xs text-muted-foreground mt-1">Master all crop tiers first to unlock animals!</div>
        </CardContent>
      </Card>
    );
  }

  const getOwnedCount = (type: string) =>
    animals.filter((a) => a.animalType === type).length;

  const getFeedCount = (type: string) => {
    const def = ANIMALS[type];
    if (!def) return 0;
    return inventory[`crop_${def.feedCrop}`] || 0;
  };

  return (
    <div className="space-y-4">
      {/* Animal Shop */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
            <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Animal Shop
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(ANIMALS).map((def) => {
              const owned = getOwnedCount(def.id);
              const locked = level < def.requiredLevel;
              const maxed = owned >= def.maxPerFarm;
              const canAfford = coins >= def.cost;
              const feedCount = getFeedCount(def.id);
              const feedCrop = CROPS[def.feedCrop];

              return (
                <div key={def.id} className={`rounded-lg border p-3 space-y-1.5 ${locked ? "opacity-50 bg-gray-50 dark:bg-slate-800/40" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{def.emoji}</span>
                      <div>
                        <div className="font-medium text-sm">{def.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {def.productEmoji} {def.productName} ({formatDuration(def.productionTimeSec)})
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{owned}/{def.maxPerFarm}</Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{def.description}</div>
                  <div className="text-[10px]">Feed: {feedCrop?.emoji} {feedCrop?.name} (have {feedCount})</div>
                  {locked ? (
                    <div className="text-xs text-red-500 dark:text-rose-400">🔒 Requires Lv.{def.requiredLevel}</div>
                  ) : maxed ? (
                    <div className="text-xs text-muted-foreground">Max owned!</div>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 w-full"
                      disabled={!canAfford}
                      onClick={() => onBuy(def.id)}
                    >
                      Buy ({def.cost}🪙)
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Owned Animals */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-sm font-semibold">🏠 Your Animals</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          {animals.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No animals yet. Buy some from the shop!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {animals.map((animal) => {
                const ready = animal.productsReady;
                const timer = timers[animal.id] ?? animal.nextProductTime;
                const def = ANIMALS[animal.animalType];
                const fedCount = inventory[`seed_${def.feedCrop}`] || 0;
                return (
                  <div key={animal.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{animal.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{animal.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {animal.productEmoji} {ready} ready
                        </div>
                      </div>
                    </div>
                    {timer > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Next in {formatDuration(timer)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        disabled={fedCount < 1}
                        onClick={() => onFeed(animal.id)}
                      >
                        🌾 Feed ({fedCount})
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1 bg-amber-600 hover:bg-amber-700"
                        disabled={ready <= 0}
                        onClick={() => onCollect(animal.id)}
                      >
                        {animal.productEmoji} Collect ({ready})
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}