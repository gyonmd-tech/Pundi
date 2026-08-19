/**
 * lib/utils/noop.ts
 * Stub modul kosong untuk menggantikan modul Node.js (fs, path, stream, dll.)
 * yang tidak tersedia di browser saat exceljs di-bundle oleh Turbopack/webpack.
 *
 * Ref: next.config.ts turbopack.resolveAlias
 */

// Export default object kosong — exceljs tidak akan pernah memanggil fs/path
// dari browser context (kode export berjalan client-side, bukan SSR).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop: any = {};
export default noop;
export {};
