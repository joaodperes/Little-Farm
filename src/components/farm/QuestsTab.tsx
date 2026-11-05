"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Scroll, Clock, Gift, Check } from "lucide-react";
import { CROPS, type Quest } from "@/lib/game-data";

interface QuestsTabProps {
  quests: Quest[];
  onClaim: (questId: string) => void;
}

export default function QuestsTab({ quests, onClaim }: QuestsTabProps) {
  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Scroll className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Daily Quests
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" /> Resets in {timeUntilReset()}
        </div>
      </div>

      {quests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No quests available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {quests.map((quest, i) => {
            const pct = Math.min(100, (quest.progress / quest.target) * 100);
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={quest.completed && !quest.claimed ? "border-amber-400 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/30" : ""}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{quest.description}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {Math.min(quest.progress, quest.target)}/{quest.target}
                        </div>
                      </div>
                      {quest.claimed ? (
                        <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-950/45 text-emerald-700 dark:text-emerald-300 shrink-0">
                          <Check className="h-3 w-3 mr-0.5" /> Claimed ✓
                        </Badge>
                      ) : quest.completed ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-amber-500 hover:bg-amber-600 shrink-0"
                          onClick={() => onClaim(quest.id)}
                        >
                          <Gift className="h-3 w-3 mr-1" /> Claim
                        </Button>
                      ) : (
                        <Badge variant="outline" className="shrink-0">In Progress</Badge>
                      )}
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>🪙 {quest.reward.coins}</span>
                      <span>⭐ +{quest.reward.xp} XP</span>
                      {quest.reward.seedCropType && quest.reward.seedQuantity && (
                        <span>+
                          {quest.reward.seedQuantity}× {CROPS[quest.reward.seedCropType]?.emoji} {CROPS[quest.reward.seedCropType]?.name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}