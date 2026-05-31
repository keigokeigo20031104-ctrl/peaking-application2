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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

// 日付文字列を days 日分ずらす（YYYY-MM-DD → YYYY-MM-DD）
function shiftDate(dateStr, days) {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function RecordForm({
  draft,
  onField,
  onDateChange,
  onSave,
  savedRecord,
}) {
  function handleWeightStep(delta) {
    const current = parseFloat(draft.weight);
    const base = Number.isFinite(current) ? current : 0;
    const next = Math.max(0, base + delta);
    onField("weight", next.toFixed(1));
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>今日の記録</CardTitle>
          <CardDescription>体重・摂取カロリー・メモを保存します。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field label="入力者名">
            <Input
              value={draft.user}
              onChange={(e) => onField("user", e.target.value)}
              placeholder="名前"
            />
          </Field>

          {/* 日付：前日 / input / 翌日 ボタン */}
          <Field label="日付">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onDateChange(shiftDate(draft.date, -1))}
                aria-label="前日"
                className="shrink-0 text-base"
              >
                ‹
              </Button>
              <Input
                type="date"
                value={draft.date}
                onChange={(e) => onDateChange(e.target.value)}
                className="flex-1 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onDateChange(shiftDate(draft.date, 1))}
                aria-label="翌日"
                className="shrink-0 text-base"
              >
                ›
              </Button>
            </div>
          </Field>

          {/* 体重：- / input / + ボタン */}
          <Field label="体重 kg">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleWeightStep(-0.1)}
                aria-label="-0.1kg"
                className="shrink-0 text-base font-bold"
              >
                −
              </Button>
              <Input
                type="number"
                step="0.1"
                inputMode="decimal"
                value={draft.weight}
                onChange={(e) => onField("weight", e.target.value)}
                placeholder="例 70.5"
                className="flex-1 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleWeightStep(0.1)}
                aria-label="+0.1kg"
                className="shrink-0 text-base font-bold"
              >
                ＋
              </Button>
            </div>
          </Field>

          <Field label="摂取カロリー kcal">
            <Input
              type="number"
              inputMode="numeric"
              value={draft.calories}
              onChange={(e) => onField("calories", e.target.value)}
              placeholder="例 2500"
            />
          </Field>

          <Field label="メモ">
            <Textarea
              value={draft.note}
              onChange={(e) => onField("note", e.target.value)}
              placeholder="体調、睡眠、反省など"
            />
          </Field>

          <Button className="w-full" onClick={onSave}>
            保存
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>保存済みの記録</CardTitle>
          <CardDescription>{formatDate(draft.date)} の記録</CardDescription>
        </CardHeader>
        <CardContent>
          {savedRecord ? (
            <dl className="grid grid-cols-3 gap-y-2 text-sm">
              <dt className="font-semibold text-muted-foreground">入力者</dt>
              <dd className="col-span-2">{savedRecord.user}</dd>
              <dt className="font-semibold text-muted-foreground">体重</dt>
              <dd className="col-span-2">
                {savedRecord.weight != null ? `${savedRecord.weight} kg` : "--"}
              </dd>
              <dt className="font-semibold text-muted-foreground">摂取カロリー</dt>
              <dd className="col-span-2">
                {savedRecord.calories != null
                  ? `${savedRecord.calories} kcal`
                  : "--"}
              </dd>
              <dt className="font-semibold text-muted-foreground">食事 / 種目</dt>
              <dd className="col-span-2 flex gap-2">
                <Badge variant="secondary">
                  食事 {(savedRecord.meals || []).length}
                </Badge>
                <Badge variant="secondary">
                  種目 {(savedRecord.training || []).length}
                </Badge>
              </dd>
              <dt className="font-semibold text-muted-foreground">メモ</dt>
              <dd className="col-span-2 whitespace-pre-wrap">
                {savedRecord.note || "--"}
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
  );
}
