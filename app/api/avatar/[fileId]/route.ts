/**
 * app/api/avatar/[fileId]/route.ts
 * Menyajikan foto profil lewat server, hanya untuk pemiliknya. File avatar
 * kini diunggah dengan izin baca privat (Role.user), jadi URL Appwrite
 * langsung tidak lagi bisa dibuka orang lain.
 */
import { getAuthUserAction } from "@/actions/auth";
import { createAdminServerClient } from "@/lib/appwrite/server";
import { AVATAR_BUCKET_ID } from "@/lib/appwrite/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const user = await getAuthUserAction();
  if (!user || user.isDemo) return new Response(null, { status: 404 });

  try {
    const { users, storage } = await createAdminServerClient();
    const prefs = (await users.getPrefs(user.id)) as { avatarFileId?: string };
    if (prefs.avatarFileId !== fileId) return new Response(null, { status: 404 });

    const [file, content] = await Promise.all([
      storage.getFile({ bucketId: AVATAR_BUCKET_ID, fileId }),
      storage.getFileView({ bucketId: AVATAR_BUCKET_ID, fileId }),
    ]);
    return new Response(content, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        // ID file berubah setiap unggah ulang, jadi aman di-cache lama — tapi privat.
        "Cache-Control": "private, max-age=86400, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
