import { describe, expect, it } from "vitest";
import { activeBudgetsFor, cycleFor, nextCycle, normalizeCycleDay, scheduledBudgets } from "@/lib/utils/budgetCycle";
import { computeBudgetPace } from "@/lib/utils/budgetPace";
import type { Budget, Transaction } from "@/lib/data/mock";

const d = (y: number, m: number, day: number, h = 12) => new Date(y, m - 1, day, h);
const ymd = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()];
const tx = (day: Date, amount: number, extra: Partial<Transaction> = {}): Transaction => ({
  id: Math.random().toString(36), accountId: "bca", categoryId: "food", type: "expense", amount, date: day, tags: [], ...extra,
});

describe("cycleFor", () => {
  it("default = bulan kalender", () => {
    const c = cycleFor(d(2026, 11, 13));
    expect(ymd(c.start)).toEqual([2026, 11, 1]);
    expect(ymd(c.end)).toEqual([2026, 11, 30]);
    expect(c.days).toBe(30);
    expect(c.key).toBe("2026-11");
  });

  it("siklus gajian tanggal 25: 25 Okt – 24 Nov", () => {
    const c = cycleFor(d(2026, 11, 13), 25);
    expect(ymd(c.start)).toEqual([2026, 10, 25]);
    expect(ymd(c.end)).toEqual([2026, 11, 24]);
    expect(c.days).toBe(31);
    expect(c.key).toBe("2026-10");
  });

  it("tepat di tanggal gajian sudah masuk siklus baru", () => {
    expect(ymd(cycleFor(d(2026, 11, 25), 25).start)).toEqual([2026, 11, 25]);
  });

  it("akhir bulan mengikuti panjang bulan (Februari)", () => {
    const c = cycleFor(d(2026, 3, 10), 31);
    expect(ymd(c.start)).toEqual([2026, 2, 28]);
    expect(ymd(c.end)).toEqual([2026, 3, 30]);
  });

  it("siklus berikutnya berurutan tanpa celah", () => {
    const c = cycleFor(d(2026, 11, 13), 25);
    const n = nextCycle(c, 25);
    expect(ymd(n.start)).toEqual([2026, 11, 25]);
    expect(ymd(n.end)).toEqual([2026, 12, 24]);
  });

  it("nilai preferensi tidak valid jatuh ke tanggal 1", () => {
    expect(normalizeCycleDay(0)).toBe(1);
    expect(normalizeCycleDay(30)).toBe(1);
    expect(normalizeCycleDay("abc")).toBe(1);
    expect(normalizeCycleDay(31)).toBe(31);
  });
});

describe("activeBudgetsFor", () => {
  const nov = cycleFor(d(2026, 11, 13));
  const dec = cycleFor(d(2026, 12, 5));
  const base: Budget = { id: "b1", categoryId: "food", period: "2026-11", limitAmount: 900_000 };

  it("anggaran berulang tetap aktif di siklus berikutnya (tidak hilang di Desember)", () => {
    expect(activeBudgetsFor([base], dec)).toHaveLength(1);
  });

  it("anggaran tidak berulang hanya aktif di siklusnya", () => {
    const once = { ...base, repeat: false };
    expect(activeBudgetsFor([once], nov)).toHaveLength(1);
    expect(activeBudgetsFor([once], dec)).toHaveLength(0);
  });

  it("data lama per bulan: yang terbaru menggantikan yang lama", () => {
    const older = { ...base, id: "old", period: "2026-10", limitAmount: 500_000 };
    const active = activeBudgetsFor([older, base], nov);
    expect(active.map((b) => b.id)).toEqual(["b1"]);
  });

  it("anggaran yang mulai siklus depan dijadwalkan, belum aktif", () => {
    const later = { ...base, period: "2026-12", startDate: d(2026, 12, 1, 0) };
    expect(activeBudgetsFor([later], nov)).toHaveLength(0);
    expect(scheduledBudgets([later], nov)).toHaveLength(1);
    expect(activeBudgetsFor([later], dec)).toHaveLength(1);
  });
});

describe("computeBudgetPace dengan tanggal mulai", () => {
  // Kasus nyata dari laporan pengguna: anggaran Transportasi mingguan dibuat 13 Nov.
  const weekly: Budget = {
    id: "t", categoryId: "food", period: "2026-11", limitAmount: 0, cadence: "weekly", cadenceAmount: 70_000, rollover: true, startDate: d(2026, 11, 13, 0),
  };

  it("tidak ada jatah mundur dari tanggal 1–12", () => {
    const pace = computeBudgetPace(weekly, [], { now: d(2026, 11, 13) });
    expect(pace.carryIn).toBe(0);
    expect(pace.startedMidCycle).toBe(true);
    // Minggu 9–15 Nov dipotong ke 13–15 Nov: 3 hari × Rp10.000.
    expect(pace.unitAllowance).toBe(30_000);
    // Jatah siklus = 18 hari aktif (13–30 Nov) × Rp10.000.
    expect(pace.monthLimit).toBe(180_000);
  });

  it("belanja sebelum anggaran berlaku tidak dihitung", () => {
    const pace = computeBudgetPace(weekly, [tx(d(2026, 11, 5), 90_000), tx(d(2026, 11, 13), 5_000)], { now: d(2026, 11, 13) });
    expect(pace.monthSpent).toBe(5_000);
    expect(pace.unitSpent).toBe(5_000);
  });

  it("anggaran lama tanpa startDate tetap dihitung dari awal siklus", () => {
    const legacy: Budget = { id: "l", categoryId: "food", period: "2026-11", limitAmount: 300_000, cadence: "daily", cadenceAmount: 10_000, rollover: true };
    const pace = computeBudgetPace(legacy, [], { now: d(2026, 11, 13) });
    expect(pace.startedMidCycle).toBe(false);
    expect(pace.carryIn).toBe(120_000);
  });

  it("kelebihan kemarin mengurangi jatah hari ini (harian, rollover)", () => {
    const daily: Budget = { id: "m", categoryId: "food", period: "2026-11", limitAmount: 0, cadence: "daily", cadenceAmount: 35_000, rollover: true, startDate: d(2026, 11, 12, 0) };
    const pace = computeBudgetPace(daily, [tx(d(2026, 11, 12), 47_500), tx(d(2026, 11, 13), 30_000)], { now: d(2026, 11, 13) });
    expect(pace.carryIn).toBe(-12_500);
    expect(pace.unitAvailable).toBe(22_500);
    expect(pace.unitRemaining).toBe(-7_500);
  });

  it("sumber dana: hanya rekening terpilih yang dihitung", () => {
    const fromOvo: Budget = { ...weekly, accountIds: ["ovo"] };
    const pace = computeBudgetPace(fromOvo, [tx(d(2026, 11, 13), 20_000, { accountId: "bca" }), tx(d(2026, 11, 13), 8_000, { accountId: "ovo" })], { now: d(2026, 11, 13) });
    expect(pace.monthSpent).toBe(8_000);
  });

  it("mengikuti siklus gajian, bukan bulan kalender", () => {
    const perCycle: Budget = { id: "s", categoryId: "food", period: "2026-10", limitAmount: 310_000 };
    const pace = computeBudgetPace(perCycle, [tx(d(2026, 10, 26), 50_000), tx(d(2026, 10, 20), 99_000)], { now: d(2026, 11, 13), cycleDay: 25 });
    expect(pace.daysInMonth).toBe(31);
    expect(pace.monthLimit).toBe(310_000);
    expect(pace.monthSpent).toBe(50_000); // 20 Okt di siklus sebelumnya
  });

  it("penyesuaian saldo tidak dihitung sebagai belanja", () => {
    const pace = computeBudgetPace(weekly, [tx(d(2026, 11, 13), 50_000, { recordKind: "balance_adjustment" })], { now: d(2026, 11, 13) });
    expect(pace.monthSpent).toBe(0);
  });
});

describe("pindahkan jatah", () => {
  const daily: Budget = { id: "food", categoryId: "food", period: "2026-11", limitAmount: 0, cadence: "daily", cadenceAmount: 35_000, rollover: true, startDate: d(2026, 11, 12, 0) };
  const reward: Budget = { id: "reward", categoryId: "fun", period: "2026-11", limitAmount: 300_000 };
  const spend = [tx(d(2026, 11, 12), 47_500), tx(d(2026, 11, 13), 30_000)];
  const transfer = { id: "x", fromBudgetId: "reward", toBudgetId: "food", amount: 7_500, date: d(2026, 11, 13) };

  it("menutup kelebihan hari ini dan menambah jatah siklus penerima", () => {
    const before = computeBudgetPace(daily, spend, { now: d(2026, 11, 13) });
    const after = computeBudgetPace(daily, spend, { now: d(2026, 11, 13), transfers: [transfer] });
    expect(before.unitRemaining).toBe(-7_500);
    expect(after.unitRemaining).toBe(0);
    expect(after.monthLimit).toBe(before.monthLimit + 7_500);
    expect(after.transferNet).toBe(7_500);
  });

  it("mengurangi jatah anggaran pemberi", () => {
    const before = computeBudgetPace(reward, [], { now: d(2026, 11, 13) });
    const after = computeBudgetPace(reward, [], { now: d(2026, 11, 13), transfers: [transfer] });
    expect(after.monthLimit).toBe(before.monthLimit - 7_500);
    expect(after.transferNet).toBe(-7_500);
  });

  it("pemindahan dari siklus lain tidak dihitung", () => {
    const old = { ...transfer, date: d(2026, 10, 20) };
    expect(computeBudgetPace(daily, spend, { now: d(2026, 11, 13), transfers: [old] }).transferNet).toBe(0);
  });

  it("jatah yang dipindah kemarin ikut terbawa ke hari ini", () => {
    const yesterday = { ...transfer, amount: 20_000, date: d(2026, 11, 12) };
    const pace = computeBudgetPace(daily, spend, { now: d(2026, 11, 13), transfers: [yesterday] });
    // Kemarin: 35.000 + 20.000 − 47.500 = sisa 7.500 → hari ini 42.500.
    expect(pace.carryIn).toBe(7_500);
    expect(pace.unitAvailable).toBe(42_500);
  });
});
