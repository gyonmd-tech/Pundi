/**
 * lib/validations/asset.ts
 * Zod schemas untuk validasi portofolio aset & investasi.
 */
import { z } from "zod";

export const AssetTypeEnum = z.enum(["stock", "mutual_fund", "crypto", "gold", "property"]);

export const createAssetSchema = z.object({
  type: AssetTypeEnum,
  name: z.string().min(1, "Masukkan nama aset").max(100, "Nama maksimal 100 karakter"),
  units: z
    .number()
    .positive("Jumlah unit harus lebih dari 0")
    .max(999_999_999_999, "Jumlah unit terlalu besar"),
  buyPrice: z
    .number()
    .int("Harga beli harus berupa bilangan bulat")
    .nonnegative("Harga beli tidak boleh negatif")
    .max(999_999_999_999, "Nominal terlalu besar"),
  currentPrice: z
    .number()
    .int("Harga saat ini harus berupa bilangan bulat")
    .nonnegative("Harga saat ini tidak boleh negatif")
    .max(999_999_999_999, "Nominal terlalu besar"),
});

export const updateAssetSchema = createAssetSchema.extend({
  id: z.string().min(1),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
