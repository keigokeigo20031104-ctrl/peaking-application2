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

export default function RecordForm({
  draft,
  onField,
  onDateChange,
  onSave,
  savedRecord,
}) {
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
          <Field label="日付">
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </Field>
          <Field label="体重 kg">
            <Input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={draft.weight}
              onChange={(e) => onField("weight", e.target.value)}
              placeholder="例 70.5"
            />
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
