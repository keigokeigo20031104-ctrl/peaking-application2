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

const RANGES = [
  { key: "30", label: "30日" },
  { key: "90", label: "90日" },
  { key: "all", label: "全期間" },
];

export default function WeightChart({ records = [] }) {
  const [range, setRange] = useState("30");

  const withWeight = records
    .filter((r) => r.weight != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  let data = withWeight;
  if (range !== "all") {
    const days = Number(range);
    const now = new Date(todayString());
    data = withWeight.filter(
      (r) => (now - new Date(r.date)) / 86400000 <= days
    );
  }

  const W = 320;
  const H = 160;
  const P = 28;
  let body = null;

  if (data.length < 2) {
    body = (
      <p className="py-10 text-center text-sm text-muted-foreground">
        2件以上記録するとグラフが表示されます。
      </p>
    );
  } else {
    const vals = data.map((r) => Number(r.weight));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const points = data.map((r, i) => {
      const x = P + (W - 2 * P) * (i / (data.length - 1));
      const y = H - P - (H - 2 * P) * ((Number(r.weight) - min) / span);
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
          aria-label="体重推移グラフ"
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
            {max.toFixed(1)}kg
          </text>
          <text x="4" y={H - P} fontSize="10" fill="hsl(var(--muted-foreground))">
            {min.toFixed(1)}kg
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
        <CardTitle>体重グラフ</CardTitle>
        <CardDescription>体重の推移を表示します。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
