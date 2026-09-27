# Pundi Component Architecture

Dokumen ini mengatur kapan UI harus menjadi komponen terpisah dan bagaimana komponen disusun agar Pundi dapat berkembang dari personal finance menjadi kumpulan modul keuangan dan integrasi Hermes Agent.

## 1. Lapisan komponen

```text
components/
  primitives/          # elemen visual paling dasar
  composites/          # gabungan primitive dengan satu tanggung jawab UI
  patterns/            # workflow lintas halaman
  charts/              # visualisasi data generik
  layout/              # shell, navigation, page frame
  feedback/            # toast, banner, skeleton, empty/error

modules/
  personal-finance/
  business-finance/
  debt/
  assets/
  goals/
  hermes/
```

Struktur folder saat ini belum harus dipindahkan sekaligus. Terapkan struktur ini ketika halaman atau komponen terkait sedang direvisi agar migrasi tetap aman.

### Primitives

Tidak memahami transaksi, rekening, atau bisnis. Contoh:

- Button, IconButton
- TextField, Textarea
- Select, Checkbox, Radio, Switch
- Badge, Avatar, Divider
- Tooltip, Popover
- CardSurface
- Tabs, SegmentedControl

Primitive tidak melakukan network request, tidak membaca store global, dan tidak memiliki copy domain permanen.

### Composites

Menyelesaikan satu fungsi UI yang dapat dipakai di banyak modul:

- MoneyInput
- DateField
- SearchField
- AccountPicker
- CategoryPicker
- StatusBadge
- StatCard
- ChartFrame
- DataTable
- Pagination
- FilterToolbar

Composite menerima data dan callback melalui props. Ia boleh memahami bentuk data umum, tetapi tidak menentukan business rule.

### Patterns

Mewakili workflow yang digunakan lintas halaman:

- QuickAddPanel
- TransactionForm
- TransactionDetailDrawer
- AccountForm
- ConfirmDeleteDialog
- PageHeader
- SummaryStrip
- WidgetGrid
- CommandSearch

Pattern boleh mengorkestrasi form state, tetapi operasi cloud tetap datang dari hook/service modul.

### Module components

Memahami business rule khusus:

- Personal transaction ledger
- Business invoice aging
- Debt payment schedule
- Asset valuation card
- Hermes recommendation panel

Komponen modul tidak boleh diimpor langsung oleh modul lain. Jika pola dibutuhkan dua modul, pindahkan bagian generiknya ke composites atau patterns.

## 2. Kapan membuat komponen terpisah

Buat komponen baru jika salah satu kondisi berikut benar:

1. Pola dipakai pada dua tempat atau diperkirakan menjadi kontrak lintas modul.
2. Elemen memiliki state/interaksi sendiri seperti open, selected, loading, drag, atau validation.
3. Elemen memiliki kewajiban aksesibilitas sendiri seperti dialog, listbox, menu, tooltip, atau data table.
4. Elemen mewakili konsep domain yang jelas seperti rekening, transaksi, utang, atau insight.
5. Bagian dapat diuji secara terpisah dengan input dan output yang jelas.
6. Satu halaman melewati kira-kira 250 baris karena UI, state, dan kalkulasi bercampur.
7. Satu blok memiliki lebih dari tiga variasi visual yang harus konsisten.

Jangan membuat komponen baru hanya untuk membungkus satu `div`, satu class, atau markup statis pendek yang tidak akan digunakan lagi.

## 3. Batas tanggung jawab

```text
page route
  -> module screen
    -> module hooks/use-cases
      -> actions/repository
    -> patterns/composites
      -> primitives
```

- Route menangani routing dan metadata.
- Screen mengatur komposisi halaman dan query parameters.
- Hook/use-case mengolah data dan business rule.
- Action/repository berkomunikasi dengan Appwrite atau layanan lain.
- Komponen visual menerima hasil siap tampil.

Jangan menghitung saldo, mengubah data Appwrite, dan merender dialog kompleks dalam satu file halaman.

## 4. Aturan API komponen

- Gunakan `variant="primary"` daripada boolean seperti `blue`, `rounded`, `large`.
- Gunakan union type untuk state yang eksklusif.
- Event memakai nama tujuan: `onSave`, `onAccountChange`, `onRequestClose`.
- Jangan meneruskan object store besar jika komponen hanya membutuhkan tiga nilai.
- Input mendukung `id`, `name`, `label`, `description`, `error`, `disabled`, dan `required`.
- Komponen async mendukung `loading`, `empty`, dan `error` secara eksplisit.
- Gunakan composition/slots untuk header, footer, atau actions yang bervariasi.
- Buat pattern berbeda jika satu prop mengubah struktur atau alur secara ekstrem.

## 5. Model modul masa depan

Setiap modul finansial memiliki kontrak manifest:

```ts
type FinanceModuleManifest = {
  id: string;
  name: string;
  icon: IconComponent;
  accent: "blue" | "mint" | "coral" | "amber" | "lavender" | "cyan";
  routes: ModuleRoute[];
  navigation: NavigationItem[];
  widgets: WidgetDefinition[];
  permissions: PermissionKey[];
  commands?: CommandDefinition[];
};
```

Manifest memungkinkan sidebar, global search, command menu, dashboard widgets, permission, dan Hermes membaca kemampuan modul tanpa hard-code di shell.

### Scope data

Semua fitur baru harus menyatakan scope:

- `user`: preferensi pribadi.
- `workspace`: data bersama personal atau organisasi.
- `account`: rekening/sumber dana.
- `module`: konfigurasi khusus modul.

Business finance tidak boleh mengasumsikan satu user sama dengan satu workspace. UI harus siap menampilkan workspace switcher, role, permission, dan audit trail.

### Hermes Agent

Hermes adalah capability lintas modul, bukan halaman yang mengambil alih semua UI.

- Saran agent selalu menyebut data sumber dan periode.
- Aksi yang mengubah data membutuhkan preview dan konfirmasi.
- Agent tidak menampilkan angka tanpa satuan atau tanggal.
- Riwayat aksi dan status eksekusi harus terlihat.
- Komponen Hermes memakai palet Lavender tetapi tetap mengikuti komponen inti Pundi.

## 6. Widget dashboard

Setiap widget didaftarkan melalui definisi:

```ts
type WidgetDefinition = {
  id: string;
  moduleId: string;
  title: string;
  component: React.ComponentType<WidgetProps>;
  allowedSizes: WidgetSize[];
  defaultSize: WidgetSize;
  minRole?: string;
  dataDependencies: string[];
};
```

Widget tidak menyimpan koordinat sendiri. `DashboardLayout` menyimpan urutan, posisi, ukuran, visibility, dan breakpoint preference. Setiap widget wajib memiliki skeleton, empty state, error state, serta tampilan ringkas untuk mobile.

## 7. Definition of done komponen

- API props kecil dan dapat dipahami tanpa membaca implementasi.
- Tidak mengambil data global tanpa alasan.
- Keyboard dan screen reader berfungsi.
- Semua state visual tersedia.
- Menggunakan token, bukan hex atau shadow lokal.
- Tidak membuat network request di primitive/composite.
- Responsive tanpa parent-specific hack.
- Memiliki satu sumber copy dan formatter.
- Dapat digunakan modul baru tanpa membawa business rule modul asal.
