# Video Pundi (Remotion)

## "Dari Gajian ke Gajian" (identitas 2026-11: kobalt + lime, Fraunces + Geist)

Sumber di `src/jujur/`. Tujuh adegan: hook → janji → siklus gajian → jatah yang jujur → pindahkan jatah → bukti → ajakan.

| Komposisi | Ukuran | Durasi | Untuk |
|---|---|---|---|
| `Gajian` | 1920×1080 | ±37,6 dtk | Portofolio, YouTube, landing |
| `GajianVertikal` | 1080×1920 | ±37,6 dtk | Story, Reels panjang |
| `GajianReels15` | 1080×1920 | ±14,2 dtk | Reels/TikTok (masalah → pindahkan jatah → ajakan) |

Setiap adegan juga terdaftar sendiri di folder Studio `Gajian-Adegan`. Screenshot aplikasi ada di `public/jujur/` (diambil dari mode demo).

```console
npx remotion render Gajian out/pundi-gajian.mp4
```

Belum ada musik: tambahkan `<Audio>` dari `@remotion/media` di `src/jujur/GajianVideo.tsx` dengan lagu yang lisensinya aman.

---

# Remotion video

<p align="center">
  <a href="https://github.com/remotion-dev/logo">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-dark.apng">
      <img alt="Animated Remotion Logo" src="https://github.com/remotion-dev/logo/raw/main/animated-logo-banner-light.gif">
    </picture>
  </a>
</p>

Welcome to your Remotion project!

## Commands

**Install Dependencies**

```console
npm i --loglevel=error
```

**Start Preview**

```console
npm run dev
```

**Render video**

```console
npx remotion render
```

**Upgrade Remotion**

```console
npx remotion upgrade
```

## Docs

Get started with Remotion by reading the [fundamentals page](https://www.remotion.dev/docs/the-fundamentals).

## Help

We provide help on our [Discord server](https://discord.gg/6VzzNDwUwV).

## Issues

Found an issue with Remotion? [File an issue here](https://github.com/remotion-dev/remotion/issues/new).

## License

Note that for some entities a company license is needed. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
