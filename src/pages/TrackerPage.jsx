import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function TrackerPage() {
  return (
    <main className="container max-w-xl py-8">
      <header className="mb-6">
        <a href="/" className="text-sm text-muted-foreground hover:underline">
          ← ホーム
        </a>
        <h1 className="mt-2 text-2xl font-black tracking-tight">入力者側</h1>
        <p className="text-muted-foreground">記録を管理者へ送信する画面（v2 土台）</p>
      </header>

      <Tabs defaultValue="today">
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">
            今日の記録
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1">
            履歴
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>今日の記録</CardTitle>
              <CardDescription>体重と摂取カロリーを入力します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">
                  体重 kg
                </label>
                <Input type="number" step="0.1" inputMode="decimal" placeholder="例 70.5" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-muted-foreground">
                  摂取カロリー kcal
                </label>
                <Input type="number" inputMode="numeric" placeholder="例 2500" />
              </div>
              <Button className="w-full">保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              履歴はまだ実装されていません。（v2 で移植予定）
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
