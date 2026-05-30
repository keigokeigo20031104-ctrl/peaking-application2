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

export default function MealForm({ meals = [], onChange }) {
  const [time, setTime] = useState("");
  const [text, setText] = useState("");

  function addMeal() {
    const t = text.trim();
    if (!t) return;
    onChange([...meals, { time, text: t }]);
    setText("");
  }

  function updateMeal(index, field, value) {
    onChange(meals.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function deleteMeal(index) {
    onChange(meals.filter((_, i) => i !== index));
  }

  function sortByTime() {
    const sorted = [...meals].sort((a, b) =>
      (a.time || "99:99").localeCompare(b.time || "99:99")
    );
    onChange(sorted);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>食事を追加</CardTitle>
          <CardDescription>時刻と内容を入力して追加します。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-muted-foreground">
              時刻
            </label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-muted-foreground">
              食事内容
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例 鶏むね肉とご飯"
            />
          </div>
          <Button className="w-full" onClick={addMeal}>
            ＋ 食事を追加
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>今日の食事</CardTitle>
          <CardDescription>
            {meals.length
              ? `${meals.length} 件 ・ 各項目はその場で編集できます。`
              : "追加した食事がここに表示されます。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {meals.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={sortByTime}
            >
              時刻順に並べ替え
            </Button>
          )}
          {meals.length ? (
            <ul className="flex flex-col gap-2">
              {meals.map((m, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-md border bg-secondary/30 p-2"
                >
                  <Input
                    type="time"
                    value={m.time || ""}
                    onChange={(e) => updateMeal(i, "time", e.target.value)}
                    className="w-28 shrink-0"
                    aria-label="食事の時刻"
                  />
                  <Input
                    value={m.text}
                    onChange={(e) => updateMeal(i, "text", e.target.value)}
                    className="flex-1"
                    aria-label="食事内容"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeal(i)}
                    aria-label="食事削除"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm leading-7 text-muted-foreground">
              まだ食事記録がありません。
              <br />
              食事内容を追加してください。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
