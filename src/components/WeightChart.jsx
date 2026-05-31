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
    const cutoff = new Date(todayString());
    cutoff.setUTCDate(cutoff.getUTCDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    data = series.filter((r) => r.date >= cutoffStr);
  }

  // SVG レイアウト定数
  const W = 320;
  const H = 180;
  const ML = 44; // Y軸ラベル用の左マージン
  const MR = 8;
  const MT = 10;
  const MB = 22; // X軸ラベル用の下マージン
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;

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
    const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
    const span = max - min || 1;
    const change = data[data.length - 1].value - data[0].value;
    const isCalories = metric === "calories";
    const dp = isCalories ? 0 : 1;

    const cx = (i) => ML + plotW * (i / (data.length - 1));
    const cy = (v) => MT + plotH * (1 - (v - min) / span);

    const points = data.map((r, i) => ({
      x: cx(i),
      y: cy(r.value),
      value: r.value,
      date: r.date,
    }));

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

    // エリア塗りつぶし用パス（折れ線の下に閉じる）
    const areaPath = [
      `M ${points[0].x},${MT + plotH}`,
      ...points.map((p) => `L ${p.x},${p.y}`),
      `L ${points[points.length - 1].x},${MT + plotH}`,
      "Z",
    ].join(" ");

    const midVal = (min + max) / 2;
    const midY = cy(midVal);
    const gradId = `chart-area-${metric}`;

    body = (
      <div className="flex flex-col gap-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`${meta.label}推移グラフ`}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Y軸ラベル */}
          <text
            x={ML - 4}
            y={MT + 4}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            textAnchor="end"
          >
            {max.toFixed(dp)}
          </text>
          <text
            x={ML - 4}
            y={midY + 4}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            textAnchor="end"
          >
            {midVal.toFixed(dp)}
          </text>
          <text
            x={ML - 4}
            y={MT + plotH + 1}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            textAnchor="end"
          >
            {min.toFixed(dp)}
          </text>

          {/* 中間グリッド線（破線） */}
          <line
            x1={ML}
            y1={midY}
            x2={ML + plotW}
            y2={midY}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4 3"
          />

          {/* 下軸 */}
          <line
            x1={ML}
            y1={MT + plotH}
            x2={ML + plotW}
            y2={MT + plotH}
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />

          {/* エリア塗り */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* 折れ線 */}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polyline}
          />

          {/* データポイント（ホバー時にtitle表示） */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
              <title>
                {p.date}: {p.value.toFixed(dp)}
                {meta.unit}
              </title>
            </g>
          ))}

          {/* X軸日付ラベル */}
          <text
            x={ML}
            y={H - 4}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            textAnchor="start"
          >
            {data[0].date.slice(5)}
          </text>
          <text
            x={ML + plotW}
            y={H - 4}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
            textAnchor="end"
          >
            {data[data.length - 1].date.slice(5)}
          </text>
        </svg>

        {/* 統計サマリー行 */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "最小", value: min.toFixed(dp), cls: "" },
            { label: "最大", value: max.toFixed(dp), cls: "" },
            { label: "平均", value: avg.toFixed(dp), cls: "" },
            {
              label: "変化",
              value: `${change >= 0 ? "+" : ""}${change.toFixed(dp)}`,
              cls: change > 0.05 ? "text-red-500" : change < -0.05 ? "text-blue-500" : "",
            },
          ].map(({ label, value, cls }) => (
            <div key={label} className="rounded-md bg-muted/50 p-2 text-center">
              <p className="text-[10px] font-semibold text-muted-foreground">{label}</p>
              <p className={`text-sm font-black tabular-nums ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

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
