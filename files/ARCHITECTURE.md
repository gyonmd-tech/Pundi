# ARCHITECTURE.md — Pundi (Personal Finance Dashboard)

> Update: backend memakai **Appwrite** (bukan Supabase) karena kuota Supabase milik pemilik repo sudah penuh. Appwrite dipilih sebagai pengganti all-in-one (auth + database + storage + functions dalam satu platform), free tier terpisah total dari kuota Supabase.

## 1. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Konsisten dengan pola project web app lain di Rumah Design (ArroBuild, Smart Presence Platform) |
| Styling | **Tailwind CSS** + `shadcn/ui` sebagai primitives | Semua token warna/tipografi di-override total mengikuti DESIGN.md § 4 |
| Backend platform | **Appwrite Cloud** (Auth + Databases + Storage + Functions) | All-in-one seperti Supabase, tapi kuota terpisah total. Free tier: 75K monthly active users, 5GB bandwidth, 2GB storage, 1 database, 1 storage bucket, 2 functions per project, dan **project tidak auto-pause** — penting karena Pundi butuh demo publik yang selalu aktif |
| Data access | **Appwrite Web SDK & Server SDK** (`TablesDB`/`Databases`) | Appwrite mengelola skema lewat Collections & Attributes sendiri (berjalan di atas MariaDB secara internal), bukan akses SQL langsung — jadi **tidak memakai Prisma**. Definisi schema dikelola sebagai kode lewat `appwrite.json` + Appwrite CLI, perannya mirip `schema.prisma` di alur kerja sebelumnya |
| Data fetching | **Server Components** (Appwrite Server SDK + API key) untuk render awal + **TanStack Query** untuk interaksi client (filter transaksi, optimistic update quick-add) | Kombinasi SSR cepat + interaksi mulus, sama seperti rencana sebelumnya |
| Charts | **Recharts** untuk chart standar + komponen SVG custom untuk elemen signature "Ledger Baseline" | Tidak berubah dari rencana awal |
| Validasi form | **Zod + React Hook Form** | Tidak berubah |
| Deployment | **Vercel** untuk frontend Next.js, **Appwrite Cloud** untuk seluruh layanan backend | Frontend tetap konsisten dengan project lain di Rumah Design; backend berdiri sendiri di Appwrite |

## 2. Folder Structure (usulan)

```
pundi/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                 # landing singkat versi publik
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                # shell: SidebarNav + topbar
│   │   ├── dashboard/page.tsx
│   │   ├── transaksi/page.tsx
│   │   ├── anggaran/page.tsx
│   │   ├── arus-kas/page.tsx
│   │   ├── aset/page.tsx
│   │   ├── tujuan/page.tsx
│   │   ├── insight/page.tsx
│   │   └── pengaturan/page.tsx
│   └── api/                          # route handlers bila perlu di luar server actions
├── components/
│   ├── ui/                           # shadcn primitives yang sudah di-restyle
│   ├── charts/                       # CashFlowChart, NetWorthTrendChart, CategoryBreakdownChart
│   ├── dashboard/                    # SummaryCard, BudgetProgress, GoalCard, InsightFeed
│   └── transaction/                  # TransactionList, QuickAddTransaction
├── lib/
│   ├── appwrite/
│   │   ├── client.ts                  # Appwrite Web SDK client (browser, session user)
│   │   ├── server.ts                  # Appwrite Server SDK client (API key, dipakai di Server Components/Actions)
│   │   └── collections.ts             # konstanta databaseId & collectionId
│   ├── validations/                  # Zod schemas
│   └── utils/                        # formatter Rupiah, tanggal, dsb.
├── appwrite.json                     # definisi Database, Collections, Attributes, Indexes, Permissions (setara "schema.prisma")
├── functions/
│   └── reset-demo-data/              # Appwrite Function terjadwal untuk reset data akun demo
├── styles/
│   └── tokens.css                    # CSS variables dari DESIGN.md § 4.2–4.3
└── AGENTS.md, PRD.md, DESIGN.md, CONTEXT.md, PLAN.md   # dokumen perencanaan, ikut serta di repo
```

## 3. Database Schema (Appwrite Collections & Attributes)

Satu Appwrite Database (`pundi-db`) berisi 7 Collections berikut. Semua kolom nominal uang memakai tipe **Integer** (rupiah penuh, tanpa desimal) — bukan Float — untuk menghindari floating point error saat menjumlahkan transaksi, sekaligus karena Rupiah tidak punya subunit yang dipakai sehari-hari.

**`accounts`**
| Attribute | Type | Ket. |
|---|---|---|
| name | String | required |
| type | Enum | `bank, ewallet, cash, credit_card, investment` |
| balance | Integer | saldo dalam Rupiah penuh |
| colorTag | String | hex warna label |
| isActive | Boolean | default `true` |
| userId | String | pemilik data, dipakai di permission (lihat § 4) |

**`categories`**
| Attribute | Type | Ket. |
|---|---|---|
| name | String | required |
| type | Enum | `income, expense` |
| icon | String | |
| color | String | |
| parentId | String | optional, relasi self-reference untuk sub-kategori |
| userId | String | |

**`transactions`**
| Attribute | Type | Ket. |
|---|---|---|
| accountId | Relationship → `accounts` | many-to-one |
| categoryId | Relationship → `categories` | many-to-one, optional |
| type | Enum | `income, expense, transfer` |
| amount | Integer | Rupiah penuh |
| date | Datetime | |
| note | String | optional |
| tags | String[] | array |
| userId | String | |

**`budgets`**
| Attribute | Type | Ket. |
|---|---|---|
| categoryId | Relationship → `categories` | |
| period | String | format `YYYY-MM` |
| limitAmount | Integer | |
| userId | String | |

**`goals`**
| Attribute | Type | Ket. |
|---|---|---|
| name | String | |
| targetAmount | Integer | |
| currentAmount | Integer | default 0 |
| targetDate | Datetime | |
| linkedAccountId | Relationship → `accounts` | optional |
| userId | String | |

**`assets`**
| Attribute | Type | Ket. |
|---|---|---|
| type | Enum | `stock, mutual_fund, crypto, gold, property` |
| name | String | |
| units | Float | jumlah unit/lot boleh desimal (mis. 0.05 BTC) |
| buyPrice | Integer | harga beli per unit, Rupiah |
| currentPrice | Integer | harga sekarang per unit, Rupiah |
| userId | String | |

**`insights`**
| Attribute | Type | Ket. |
|---|---|---|
| type | Enum | `budget_warning, goal_progress, trend, tip` |
| message | String | |
| isRead | Boolean | default `false` |
| userId | String | |

Semua Collection & Attribute di atas didefinisikan lewat `appwrite.json` agar bisa di-push konsisten via Appwrite CLI (`appwrite push collections`), setara dengan cara kerja `prisma migrate` sebelumnya.

## 4. Permissions (pengganti RLS)

Appwrite tidak memakai SQL policy seperti Supabase RLS, tapi permission per Collection dan per Document. Defaultnya **tertutup** (tidak ada yang bisa akses tanpa izin eksplisit).

Pola untuk seluruh Collection data pribadi (`accounts`, `transactions`, `budgets`, `goals`, `assets`, `insights`, `categories`):
- Saat dokumen dibuat lewat Server Action, set permission dokumen: `Permission.read(Role.user(userId))`, `Permission.update(Role.user(userId))`, `Permission.delete(Role.user(userId))` — hanya pemilik `userId` yang bisa akses dokumennya sendiri.
- Collection-level permission dikosongkan (tidak ada akses publik/anon), supaya query tanpa login otomatis gagal.

Untuk **akun demo publik**, dokumen milik user demo diberi permission:
- `Permission.read(Role.any())` — publik boleh baca.
- **Tidak** diberi `update`/`delete`/`create` untuk `Role.any()` — publik hanya bisa melihat, tidak bisa mengubah.
- Sebuah Appwrite Function terjadwal (lihat § 6) berjalan dengan API key server (yang selalu bisa bypass permission) untuk reset ulang data demo secara berkala.

## 5. Auth Setup

- Appwrite Auth dengan email/password sebagai metode utama (`account.createEmailPasswordSession`).
- Sediakan **tombol "Coba Demo"** di halaman login yang memanggil Server Action untuk login otomatis ke akun demo tetap (email/password demo disimpan sebagai env var server-side) — pengunjung tidak perlu daftar.
- Proteksi route: middleware Next.js mengecek sesi Appwrite (cookie session) di setiap request ke grup `(app)`, redirect ke `/login` bila tidak ada sesi valid.

## 6. Keamanan & Privasi Demo

- Data demo 100% sintetis, tidak ada data finansial nyata siapa pun.
- Dokumen akun demo bersifat read-only untuk publik (lihat § 4).
- **Appwrite Function** terjadwal (cron, mis. tiap tengah malam) menjalankan reset: hapus seluruh dokumen milik `userId` demo, lalu re-seed dari data JSON tetap — memastikan demo selalu terlihat rapi walau ada percobaan modifikasi dari client (yang seharusnya sudah dicegah oleh permission, tapi reset berkala tetap jadi lapisan pengaman tambahan).
- Signup publik boleh dibuka untuk pengunjung yang ingin eksplorasi lebih dari sekadar demo read-only, dengan disclaimer jelas bahwa ini portfolio demo, bukan produk finansial nyata.

## 7. SEO & Deployment

- Halaman `(marketing)` publik memakai metadata SEO standar Next.js (title, description, OG image).
- Halaman `(app)` (dashboard, dsb.) memakai `robots: noindex`.
- Frontend deploy ke Vercel seperti project lain di Rumah Design.
- Environment variables: `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID` (dipakai client), `APPWRITE_API_KEY` (server-only, untuk Server Components/Actions dan reset demo).
