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

export default function DataList({ records = [], onExport, onDeleteAll }) {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>記録一覧</CardTitle>
          <CardDescription>日付の新しい順に表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          {sorted.length ? (
            <ul className="flex flex-col gap-2">
              {sorted.map((r) => (
                <li key={r.date} className="rounded-lg border p-3">
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
                  {r.note && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {r.note}
                    </p>
                  )}
                </li>
              ))}
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
