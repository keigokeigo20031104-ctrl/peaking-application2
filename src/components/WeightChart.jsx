import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { todayString } from "@/lib/date";
import { dailyBestOneRepMax } from "@/lib/calculations";

const RANGES = [
  { key: "30", label: "30日" },
  { key: "90", label: "90日" },
  { key: "all", label: "全期間" },
];

const METRICS = [
  { key: "weight", label: "体重", unit: "kg" },
  { key: "calories", label: "カロリー", unit: "kcal" },
  { key: "orm", label: "推定1RM", unit: "kg" },
];

// 記録配列を [{ date, value }] 系列に変換する（指標ごと）。
function buildSeries(records, metric) {
  if (metric === "orm") {
    return dailyBestOneRepMax(records);
  }
  return records
    .filter((r) => r[metric] != null)
    .map((r) => ({ date: r.date, value: Number(r[metric]) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export default function WeightChart({ records = [] }) {
  const [range, setRange] = useState("30");
  const [metric, setMetric] = useState("weight");

  const meta = METRICS.find((m) => m.key === metric) || METRICS[0];
  const series = buildSeries(records, metric);

  let data = series;
  if (range !== "all") {
    const days = Number(range);
    const now = new Date(todayString());
    data = series.filter((r) => (now - new Date(r.date)) / 86400000 <= days);
  }

  const W = 320;
  const H = 160;
  const P = 28;
  let body = null;

  if (data.length < 2) {
    body = (
      <p className="py-10 text-center text-sm text-muted-foreground">
        2件以上記録すると{meta.label}グラフが表示されます。
      </p>
    );
  } else {
    const vals = data.map((r) => r.value);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const points = data.map((r, i) => {
      const x = P + (W - 2 * P) * (i / (data.length - 1));
      const y = H - P - (H - 2 * P) * ((r.value - min) / span);
      return { x, y };
    });
    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

    body = (
      <div className="flex flex-col gap-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${meta.label}推移グラフ`}
        >
          <line
            x1={P}
            y1={H - P}
            x2={W - P}
            y2={H - P}
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={polyline}
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="hsl(var(--primary))" />
          ))}
          <text x="4" y={P} fontSize="10" fill="hsl(var(--muted-foreground))">
            {max.toFixed(1)}
            {meta.unit}
          </text>
          <text x="4" y={H - P} fontSize="10" fill="hsl(var(--muted-foreground))">
            {min.toFixed(1)}
            {meta.unit}
          </text>
        </svg>
        <p className="text-xs text-muted-foreground">
          {data[0].date} 〜 {data[data.length - 1].date} ／ {data.length} 件
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>推移グラフ</CardTitle>
        <CardDescription>指標と期間を選んで推移を表示します。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <Button
              key={m.key}
              variant={metric === m.key ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setMetric(m.key)}
            >
              {m.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <Button
              key={r.key}
              variant={range === r.key ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        {body}
      </CardContent>
    </Card>
  );
}
