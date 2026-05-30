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

  function deleteMeal(index) {
    onChange(meals.filter((_, i) => i !== index));
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
        </CardHeader>
        <CardContent>
          {meals.length ? (
            <ul className="flex flex-col gap-2">
              {meals.map((m, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-md border bg-secondary/30 p-3"
                >
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                    {m.time || "--:--"}
                  </span>
                  <span className="flex-1 break-words text-sm">{m.text}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMeal(i)}
                  >
                    削除
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
