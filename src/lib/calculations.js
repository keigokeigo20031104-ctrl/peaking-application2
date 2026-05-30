// トレーニング関連の計算ロジック。

// Epley式 推定1RM = 重量 × (1 + 回数 / 30)
// 重量・回数のどちらかが未入力/不正なら null を返す。
export function estimateOneRepMax(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) {
    return null;
  }
  return w * (1 + r / 30);
}

// 総負荷量 kg × rep
export function calcTrainingVolume(training = []) {
  return training.reduce(
    (sum, item) =>
      sum +
      (item.sets || []).reduce(
        (s, set) => s + (Number(set.weight) || 0) * (Number(set.reps) || 0),
        0
      ),
    0
  );
}

export function calcSetCount(training = []) {
  return training.reduce((s, item) => s + (item.sets || []).length, 0);
}

export function calcRepCount(training = []) {
  return training.reduce(
    (s, item) =>
      s + (item.sets || []).reduce((a, set) => a + (Number(set.reps) || 0), 0),
    0
  );
}

// 全セット中の最高推定1RM（なければ null）
export function calcBestOneRepMax(training = []) {
  let best = 0;
  training.forEach((item) =>
    (item.sets || []).forEach((set) => {
      const e = estimateOneRepMax(set.weight, set.reps);
      if (e && e > best) best = e;
    })
  );
  return best > 0 ? best : null;
}
