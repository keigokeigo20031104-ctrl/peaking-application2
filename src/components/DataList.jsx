import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/date";

function RecordDetail({ record }) {
  const meals = record.meals || [];
  const training = record.training || [];
  return (
    <div className="mt-3 flex flex-col gap-3 border-t pt-3">
      <div>
        <p className="mb-1 text-xs font-bold text-muted-foreground">食事</p>
        {meals.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {meals.map((m, i) => (
              <li key={i} className="flex gap-2">
                <span className="tabular-nums text-muted-foreground">
                  {m.time || "--:--"}
                </span>
                <span className="break-words">{m.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">記録なし</p>
        )}
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-muted-foreground">トレーニング</p>
        {training.length ? (
          <ul className="flex flex-col gap-1 text-sm">
            {training.map((t, i) => (
              <li key={i} className="break-words">
                <span className="font-semibold">{t.exercise || "種目"}</span>
                <span className="text-muted-foreground">
                  {" "}
                  {(t.sets || [])
                    .map((s) =>
                      s.weight != null || s.reps != null
                        ? `${s.weight ?? "-"}kg×${s.reps ?? "-"}`
                        : "-"
                    )
                    .join(" / ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">記録なし</p>
        )}
      </div>
    </div>
  );
}

export default function DataList({
  records = [],
  onExport,
  onExportCsv,
  onDeleteOne,
  onDeleteAll,
}) {
  const [openDate, setOpenDate] = useState(null);
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>記録一覧</CardTitle>
          <CardDescription>
            日付の新しい順に表示します。行をタップで詳細を開きます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length ? (
            <ul className="flex flex-col gap-2">
              {sorted.map((r) => {
                const open = openDate === r.date;
                return (
                  <li key={r.date} className="rounded-lg border p-3">
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setOpenDate(open ? null : r.date)}
                      aria-expanded={open}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold tabular-nums">
                          {formatDate(r.date)}
                        </span>
                        <span className="text-sm tabular-nums">
                          {r.weight != null ? `${r.weight} kg` : "-- kg"}
                          {" / "}
                          {r.calories != null ? `${r.calories} kcal` : "-- kcal"}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          食事 {(r.meals || []).length}
                        </Badge>
                        <Badge variant="secondary">
                          種目 {(r.training || []).length}
                        </Badge>
                      </div>
                    </button>
                    {r.note && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                        {r.note}
                      </p>
                    )}
                    {open && (
                      <>
                        <RecordDetail record={r} />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            const deleted = onDeleteOne?.(r.date);
                            if (deleted) setOpenDate(null);
                          }}
                        >
                          この日の記録を削除
                        </Button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm leading-7 text-muted-foreground">
              まだ記録がありません。
              <br />
              「今日の記録」から保存してください。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>データ管理</CardTitle>
          <CardDescription>バックアップと削除を行います。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={onExport}
            disabled={!records.length}
          >
            JSONエクスポート
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={onExportCsv}
            disabled={!records.length}
          >
            CSVエクスポート
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onDeleteAll}
            disabled={!records.length}
          >
            全削除
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
