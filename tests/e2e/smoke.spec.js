import { test, expect } from "@playwright/test";

test.describe("/ ホーム", () => {
  test("タイトルと各画面へのリンクが表示される", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Peaking Application v2" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "入力者側へ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "個人側へ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "管理者画面へ" })).toBeVisible();
    await expect(page.getByRole("link", { name: "意見箱へ" })).toBeVisible();
  });
});

test.describe("/tracker/ 入力者側", () => {
  test("記録フォームが表示される", async ({ page }) => {
    await page.goto("/tracker/");
    await expect(
      page.getByRole("heading", { name: "入力者側" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("例 70.5")).toBeVisible();
    await expect(page.getByPlaceholder("例 2500")).toBeVisible();
    await expect(page.getByRole("button", { name: "保存" })).toBeVisible();
  });

  test("保存すると localStorage に tracker キーが作成される", async ({ page }) => {
    await page.goto("/tracker/");
    await page.getByPlaceholder("名前").fill("テスト太郎");
    await page.getByPlaceholder("例 70.5").fill("70.5");
    await page.getByPlaceholder("例 2500").fill("2500");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page.getByText("保存しました")).toBeVisible();

    const stored = await page.evaluate(() =>
      localStorage.getItem("weight-log-v2-tracker-records")
    );
    expect(stored).not.toBeNull();
    expect(stored).toContain("70.5");
  });
});

test.describe("/solo/ 個人側", () => {
  test("記録フォームが表示される", async ({ page }) => {
    await page.goto("/solo/");
    await expect(page.getByRole("heading", { name: "個人側" })).toBeVisible();
    await expect(page.getByPlaceholder("例 70.5")).toBeVisible();
    await expect(page.getByPlaceholder("例 2500")).toBeVisible();
    await expect(page.getByRole("button", { name: "保存" })).toBeVisible();
  });

  test("保存すると localStorage に solo キーが作成される", async ({ page }) => {
    await page.goto("/solo/");
    await page.getByPlaceholder("名前").fill("テスト花子");
    await page.getByPlaceholder("例 70.5").fill("60.2");
    await page.getByPlaceholder("例 2500").fill("1800");
    await page.getByRole("button", { name: "保存" }).click();

    await expect(page.getByText("保存しました")).toBeVisible();

    const stored = await page.evaluate(() =>
      localStorage.getItem("weight-log-v2-solo-records")
    );
    expect(stored).not.toBeNull();
    expect(stored).toContain("60.2");
  });
});

test.describe("/admin/ 管理者画面", () => {
  test("3つの管理カードが表示される", async ({ page }) => {
    await page.goto("/admin/");
    await expect(
      page.getByRole("heading", { name: "管理者画面" })
    ).toBeVisible();
    await expect(page.getByText("今日の管理状況")).toBeVisible();
    await expect(page.getByText("サーバーデータ状態")).toBeVisible();
    await expect(page.getByText("AIからのフィードバック")).toBeVisible();
  });
});

test.describe("/feedback/ 意見箱", () => {
  test("カテゴリ・メッセージ・送信ボタンが表示される", async ({ page }) => {
    await page.goto("/feedback/");
    await expect(page.getByRole("heading", { name: "意見箱" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "バグ報告" })).toBeVisible();
    await expect(
      page.getByPlaceholder("ご意見・ご要望を入力してください")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "送信する" })).toBeVisible();
  });
});
