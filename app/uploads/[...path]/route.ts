import { NextRequest, NextResponse } from "next/server";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const rawSegments = resolvedParams.path;

    if (!rawSegments || rawSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Path traversal koruması ve URL decode
    const safeSegments = rawSegments.map((segment) => {
      const decoded = decodeURIComponent(segment);
      return path.basename(decoded);
    });

    // Olası dosya yolları (public/uploads veya uploads)
    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", ...safeSegments),
      path.join(process.cwd(), "uploads", ...safeSegments),
    ];

    let targetFile: string | null = null;
    let fileStat = null;

    for (const p of possiblePaths) {
      try {
        const s = await stat(p);
        if (s.isFile()) {
          targetFile = p;
          fileStat = s;
          break;
        }
      } catch {
        // Dosya bu konumda bulunamadı
      }
    }

    if (!targetFile || !fileStat) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await readFile(targetFile);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileStat.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Uploads serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
