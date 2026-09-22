import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function POST(req: NextRequest) {
  try {
    const isAuthorized = await isAdmin();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Yetkisiz işlem. Lütfen yönetici girişi yapın." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Geçerli bir görsel dosyası seçilmedi." }, { status: 400 });
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/pjpeg",
    ];
    const fileType = file.type.toLowerCase();
    const isImage = fileType.startsWith("image/") || allowedMimeTypes.includes(fileType);

    if (!isImage) {
      return NextResponse.json(
        { error: "Sadece JPG, JPEG, PNG, WEBP, GIF formatları desteklenmektedir." },
        { status: 400 }
      );
    }

    // Maksimum 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "Görsel boyutu en fazla 10MB olabilir." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Vercel serverless ortamında dosya sistemi salt-okunur (read-only) olabileceğinden
    // yerel diske yazmayı dener, yazamazsa kesintisiz Data URL fallback sunar.
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });

      const cleanFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-");
      const uniqueFileName = `${Date.now()}-${cleanFileName}`;
      const targetFilePath = path.join(uploadsDir, uniqueFileName);

      await writeFile(targetFilePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
      });
    } catch (fsError) {
      // Vercel serverless / read-only filesystem fallback
      const mime = file.type || "image/jpeg";
      const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: file.name,
        fallback: true,
      });
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Görsel yüklenirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
