import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  estimateOneRepMax,
  estimateOneRepMaxBrzycki,
  calcTrainingVolume,
  calcSetCount,
  calcRepCount,
  calcBestOneRepMax,
} from "@/lib/calculations";

const PARTS = ["脚", "胸", "背中", "肩", "腕", "その他"];
const TEMPLATES = {
  脚: ["スクワット", "レッグプレス", "レッグカール", "カーフレイズ"],
  胸: ["ベンチプレス", "インクラインベンチ", "ダンベルプレス", "チェストフライ"],
  背中: ["デッドリフト", "ラットプルダウン", "ローイング", "懸垂"],
  肩: ["ショルダープレス", "サイドレイズ", "リアレイズ"],
  腕: ["アームカール", "トライセプスプレスダウン", "ナローベンチ"],
  その他: ["腹筋", "有酸素", "ストレッチ"],
};

function num(value) {
  return value === "" || value == null ? null : Number(value);
}

export default function TrainingForm({ training = [], onChange }) {
  const [part, setPart] = useState("脚");

  function addExercise(name) {
    onChange([
      ...training,
      {
        parts: [part],
        exercise: name,
        sets: [{ weight: null, reps: null, note: "" }],
      },
    ]);
  }

  function updateExercise(i, patch) {
    onChange(training.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }

  function deleteExercise(i) {
    onChange(training.filter((_, idx) => idx !== i));
  }

  function addSet(i) {
    updateExercise(i, {
      sets: [...(training[i].sets || []), { weight: null, reps: null, note: "" }],
    });
  }

  // 直前のセットの重量・回数を引き継いで新しいセットを追加する。
  function duplicateLastSet(i) {
    const sets = training[i].sets || [];
    const last = sets[sets.length - 1] || { weight: null, reps: null };
    updateExercise(i, {
      sets: [...sets, { weight: last.weight, reps: last.reps, note: "" }],
    });
  }

  function updateSet(i, j, field, value) {
    const sets = (training[i].sets || []).map((s, idx) =>
      idx === j ? { ...s, [field]: field === "note" ? value : num(value) } : s
    );
    updateExercise(i, { sets });
  }

  function deleteSet(i, j) {
    updateExercise(i, {
      sets: (training[i].sets || []).filter((_, idx) => idx !== j),
    });
  }

  const bestRM = calcBestOneRepMax(training);
  const stats = [
    ["セット数", calcSetCount(training)],
    ["合計レップ", calcRepCount(training)],
    ["総負荷量", `${calcTrainingVolume(training).toFixed(1)}`],
    ["最高1RM", bestRM != null ? `${bestRM.toFixed(1)}kg` : "--"],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>部位を選ぶ</CardTitle>
          <CardDescription>部位を選ぶと種目テンプレートが出ます。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {PARTS.map((p) => (
              <Button
                key={p}
                variant={p === part ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setPart(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(TEMPLATES[part] || []).map((name) => (
              <Button
                key={name}
                variant="secondary"
                size="sm"
                onClick={() => addExercise(name)}
              >
                ＋ {name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>今日のトレーニング</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map(([label, value]) => (
              <div
                key={label}
                className="rounded-md border bg-secondary/30 p-3 text-center"
              >
                <div className="text-xs font-semibold text-muted-foreground">
                  {label}
                </div>
                <div className="text-lg font-black tabular-nums">{value}</div>
              </div>
            ))}
          </div>

          {training.length ? (
            <div className="flex flex-col gap-4">
              {training.map((t, i) => {
                const exBest = calcBestOneRepMax([t]);
                return (
                  <div key={i} className="flex flex-col gap-3 rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={t.exercise}
                        onChange={(e) =>
                          updateExercise(i, { exercise: e.target.value })
                        }
                        placeholder="種目名"
                        className="flex-1"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteExercise(i)}
                      >
                        削除
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {(t.parts || []).map((p) => (
                        <Badge key={p} variant="secondary">
                          {p}
                        </Badge>
                      ))}
                      {exBest != null && (
                        <Badge>最高1RM {exBest.toFixed(1)}kg</Badge>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {(t.sets || []).map((s, j) => {
                        const rm = estimateOneRepMax(s.weight, s.reps);
                        const rmB = estimateOneRepMaxBrzycki(s.weight, s.reps);
                        return (
                          <div key={j} className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="w-10 shrink-0 text-xs font-bold text-muted-foreground">
                                {j + 1}set
                              </span>
                              <Input
                                type="number"
                                step="0.5"
                                inputMode="decimal"
                                value={s.weight ?? ""}
                                onChange={(e) =>
                                  updateSet(i, j, "weight", e.target.value)
                                }
                                placeholder="kg"
                              />
                              <Input
                                type="number"
                                inputMode="numeric"
                                value={s.reps ?? ""}
                                onChange={(e) =>
                                  updateSet(i, j, "reps", e.target.value)
                                }
                                placeholder="回数"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSet(i, j)}
                                aria-label="セット削除"
                              >
                                ×
                              </Button>
                            </div>
                            <Input
                              value={s.note || ""}
                              onChange={(e) =>
                                updateSet(i, j, "note", e.target.value)
                              }
                              placeholder="メモ（任意）"
                              className="ml-12"
                            />
                            {rm != null && (
                              <p className="ml-12 text-xs font-semibold text-primary">
                                {s.weight}kg × {s.reps}回 ・ 推定1RM: {rm.toFixed(1)}kg
                                {rmB != null && (
                                  <span className="font-normal text-muted-foreground">
                                    {" "}
                                    (Brzycki {rmB.toFixed(1)}kg)
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => addSet(i)}
                      >
                        ＋ セット追加
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateLastSet(i)}
                        disabled={!(t.sets || []).length}
                      >
                        前セットを複製
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-4 text-center text-sm leading-7 text-muted-foreground">
              まだトレーニング記録がありません。
              <br />
              部位を選んで種目を追加してください。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
