/**
 * lib/penjaga/tools.ts
 * Daftar tool MCP yang diekspos Pundi ke Hermes Agent. Deskripsi tool
 * sengaja berbahasa Indonesia & preskriptif: deskripsi inilah "SOP" yang
 * dibaca Hermes saat memutuskan cara mencatat keuangan pengguna.
 */
import {
  confirmDrafts,
  createDrafts,
  getFinanceContext,
  listDrafts,
  listTransactionsBetween,
  rejectDrafts,
  summarizePeriod,
  todayInJakarta,
  type DraftRequest,
} from "./service";

type JsonSchema = Record<string, unknown>;

export interface PenjagaTool {
  name: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean };
  run: (userId: string, args: Record<string, unknown>) => Promise<unknown>;
}

const dateSchema = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", description: "Tanggal kalender YYYY-MM-DD (WIB)." };

function str(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export const penjagaTools: PenjagaTool[] = [
  {
    name: "pundi_konteks",
    title: "Konteks keuangan",
    description:
      "Panggil PERTAMA KALI di setiap percakapan pencatatan. Mengembalikan tanggal hari ini (WIB), daftar rekening aktif beserta saldo, " +
      "daftar kategori (income/expense), dan jumlah draft yang menunggu konfirmasi. Gunakan nama/ID dari sini saat membuat draft.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    run: (userId) => getFinanceContext(userId),
  },
  {
    name: "pundi_buat_draft",
    title: "Catat sebagai draft",
    description:
      "Ubah cerita pengguna tentang harinya menjadi DRAFT transaksi (belum mengubah saldo). Pecah setiap kejadian menjadi satu item. " +
      "Nominal dalam Rupiah bulat (\"25rb\" = 25000, \"1,5jt\" = 1500000). type: expense untuk pengeluaran, income untuk pemasukan, " +
      "transfer untuk pindah uang antar rekening sendiri (isi destinationAccount). account/category boleh ID atau nama dari pundi_konteks; " +
      "kosongkan bila ragu — pengguna akan melengkapinya. Setelah membuat draft, ringkas daftarnya ke pengguna dan minta konfirmasi.",
    inputSchema: {
      type: "object",
      required: ["items"],
      additionalProperties: false,
      properties: {
        items: {
          type: "array",
          minItems: 1,
          maxItems: 30,
          items: {
            type: "object",
            required: ["type", "amount"],
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["expense", "income", "transfer"] },
              amount: { type: "integer", minimum: 1, description: "Nominal Rupiah tanpa desimal." },
              account: { type: "string", description: "ID atau nama rekening sumber." },
              destinationAccount: { type: "string", description: "Khusus transfer: ID atau nama rekening tujuan." },
              category: { type: "string", description: "ID atau nama kategori (tidak dipakai untuk transfer)." },
              date: dateSchema,
              note: { type: "string", maxLength: 500, description: "Catatan singkat, mis. \"Makan siang soto\"." },
              rawText: { type: "string", maxLength: 1000, description: "Potongan kalimat asli pengguna untuk item ini." },
            },
          },
        },
      },
    },
    run: async (userId, args) => {
      const items = (Array.isArray(args.items) ? args.items : []) as DraftRequest[];
      const results = await createDrafts(userId, items, "hermes");
      return {
        created: results.map(({ draft, missing }) => ({ ...draft, missing })),
        message: "Draft tersimpan dan menunggu konfirmasi pengguna. Pengguna juga bisa meninjaunya di halaman Penjaga di aplikasi Pundi.",
      };
    },
  },
  {
    name: "pundi_daftar_draft",
    title: "Draft menunggu",
    description: "Daftar draft transaksi yang masih menunggu konfirmasi (status pending).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    run: async (userId) => ({ drafts: await listDrafts(userId, "pending") }),
  },
  {
    name: "pundi_konfirmasi_draft",
    title: "Simpan draft",
    description:
      "Menyimpan draft menjadi transaksi nyata dan MENGUBAH SALDO. Hanya panggil setelah pengguna secara eksplisit menyetujui " +
      "(mis. \"ya, simpan\") daftar draft yang sudah kamu tunjukkan. Jangan pernah memanggil ini atas inisiatif sendiri.",
    inputSchema: {
      type: "object",
      required: ["draftIds"],
      additionalProperties: false,
      properties: { draftIds: { type: "array", minItems: 1, maxItems: 30, items: { type: "string" } } },
    },
    annotations: { destructiveHint: false, idempotentHint: true },
    run: async (userId, args) => {
      const outcomes = await confirmDrafts(userId, stringList(args.draftIds), {}, "hermes");
      return { results: outcomes.map(({ draftId, ok, error, transaction }) => ({ draftId, ok, error, transactionId: transaction?.id })) };
    },
  },
  {
    name: "pundi_tolak_draft",
    title: "Buang draft",
    description: "Membuang draft yang salah atau dibatalkan pengguna. Tidak mengubah saldo.",
    inputSchema: {
      type: "object",
      required: ["draftIds"],
      additionalProperties: false,
      properties: { draftIds: { type: "array", minItems: 1, maxItems: 30, items: { type: "string" } } },
    },
    annotations: { idempotentHint: true },
    run: async (userId, args) => ({ rejected: await rejectDrafts(userId, stringList(args.draftIds)) }),
  },
  {
    name: "pundi_transaksi",
    title: "Lihat transaksi",
    description: "Daftar transaksi yang sudah tersimpan pada rentang tanggal (default hari ini). Pakai untuk menghindari pencatatan ganda.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: { from: dateSchema, to: dateSchema, limit: { type: "integer", minimum: 1, maximum: 200 } },
    },
    annotations: { readOnlyHint: true },
    run: async (userId, args) => {
      const today = todayInJakarta();
      const from = str(args.from) ?? today;
      const transactions = await listTransactionsBetween(userId, from, str(args.to) ?? from, Number(args.limit) || 100);
      return { transactions };
    },
  },
  {
    name: "pundi_ringkasan",
    title: "Ringkasan periode",
    description: "Total pemasukan, pengeluaran, selisih, dan 5 kategori pengeluaran terbesar pada rentang tanggal (default bulan ini).",
    inputSchema: { type: "object", additionalProperties: false, properties: { from: dateSchema, to: dateSchema } },
    annotations: { readOnlyHint: true },
    run: async (userId, args) => {
      const today = todayInJakarta();
      return summarizePeriod(userId, str(args.from) ?? `${today.slice(0, 8)}01`, str(args.to) ?? today);
    },
  },
];

export const PENJAGA_INSTRUCTIONS =
  "Kamu adalah Penjaga Pundi — penjaga ruang keuangan pribadi pengguna. Saat pengguna bercerita tentang harinya, " +
  "panggil pundi_konteks, lalu catat setiap pemasukan/pengeluaran/transfer dengan pundi_buat_draft. Tampilkan ringkasan draft " +
  "(jumlah, nominal, rekening, kategori) dan minta konfirmasi. Panggil pundi_konfirmasi_draft HANYA setelah pengguna setuju. " +
  "Jangan mengarang nominal; tanyakan bila tidak jelas. Jawab singkat, hangat, dalam Bahasa Indonesia.";
