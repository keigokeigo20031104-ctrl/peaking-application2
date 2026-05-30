import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createRecordStore,
  SOLO_STORAGE_KEY,
  todayISO,
} from "@/lib/storage";

const store = createRecordStore(SOLO_STORAGE_KEY);

export default function SoloPage() {
  const [user, setUser] = useState("");
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(null);
  const [toast, setToast] = useState("");

  // 選択中の日付の保存済み記録を読み込んでフォームに反映する
  useEffect(() => {
    const rec = store.getRecord(date);
    setSaved(rec);
    if (rec) {
      setUser((prev) => prev || rec.user || "");
      setWeight(rec.weight != null ? String(rec.weight) : "");
      setCalories(rec.calories != null ? String(rec.calories) : "");
      setNote(rec.note || "");
    }
  }, [date]);

  // toast を一定時間で自動的に消す
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function handleSave() {
    const w = Number(weight);
    if (!date) {
      setToast("日付を入力してください");
      return;
    }
    if (!Number.isFinite(w) || w <= 0) {
      setToast("体重を入力してください");
      return;
    }
    const record = {
      user: user.trim() || "unknown",
      date,
      weight: Math.round(w * 10) / 10,
      calories: calories === "" ? null : Math.round(Number(calories)),
      note: note.trim(),
      meals: [],
      training: [],
    };
    store.saveRecord(record);
    setSaved(record);
    setToast("保存しました");
  }

  return (
    <main className="container max-w-xl py-8">
      <header className="mb-6">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← ホーム
        </a>
        <h1 className="mt-2 text-2xl font-black tracking-tight">個人側</h1>
        <p className="text-muted-foreground">個人用の体重記録（v2 最小実装）</p>
      </header>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>今日の記録</CardTitle>
            <CardDescription>体重・摂取カロリー・メモを保存します。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-muted-foreground">
                入力者名
              </label>
              <Input
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="名前"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-muted-foreground">
                日付
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-muted-foreground">
                体重 kg
              </label>
              <Input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例 70.5"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-muted-foreground">
                摂取カロリー kcal
              </label>
              <Input
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="例 2500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-muted-foreground">
                メモ
              </label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="体調、睡眠、反省など"
              />
            </div>

            <Button className="w-full" onClick={handleSave}>
              保存
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>保存済みの記録</CardTitle>
            <CardDescription>{date} の記録</CardDescription>
          </CardHeader>
          <CardContent>
            {saved ? (
              <dl className="grid grid-cols-3 gap-y-2 text-sm">
                <dt className="font-semibold text-muted-foreground">入力者</dt>
                <dd className="col-span-2">{saved.user}</dd>
                <dt className="font-semibold text-muted-foreground">体重</dt>
                <dd className="col-span-2">{saved.weight} kg</dd>
                <dt className="font-semibold text-muted-foreground">摂取カロリー</dt>
                <dd className="col-span-2">
                  {saved.calories != null ? `${saved.calories} kcal` : "--"}
                </dd>
                <dt className="font-semibold text-muted-foreground">メモ</dt>
                <dd className="col-span-2 whitespace-pre-wrap">
                  {saved.note || "--"}
                </dd>
              </dl>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                この日付の記録はまだありません。上のフォームから保存してください。
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
