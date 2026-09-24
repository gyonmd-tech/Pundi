# Arsitektur komponen Pundi

Komponen dibagi berdasarkan tanggung jawab agar halaman hanya merangkai fitur dan data.

- `ui/`: primitive presentasional reusable seperti button, input, select, dropdown, filter, tabel, card, modal, badge, search bar, dan page header.
- `layout/`: shell aplikasi seperti header, kalender, pencarian global, pemilih akun, notifikasi, sidebar desktop, sidebar kanan, dan navigasi mobile.
- `auth/`, `dashboard/`, `charts/`, `transaction/`: komponen fitur yang hanya menangani satu domain.

Aturan pemakaian:

1. Gunakan primitive dari `components/ui` sebelum membuat gaya kontrol baru di halaman.
2. Simpan state domain di komponen fitur atau store; primitive UI menerima state lewat props.
3. Satu file mengekspor satu komponen utama. Subkomponen kecil boleh tinggal bersama bila tidak dipakai di tempat lain.
4. Setiap kontrol interaktif wajib punya label aksesibel, fokus yang terlihat, dan target sentuh minimal 40 piksel.
5. Gunakan token dari `styles/tokens.css`; hindari nilai warna hard-coded di halaman.
