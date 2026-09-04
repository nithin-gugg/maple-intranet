import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const ALLOWED_DOMAIN = "mapleintranet.lxdguildacademy.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pdfUrl = searchParams.get("url");

    if (!pdfUrl) {
      return new NextResponse("Missing url parameter", { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(pdfUrl);
    } catch {
      return new NextResponse("Invalid url format", { status: 400 });
    }

    if (parsedUrl.hostname !== ALLOWED_DOMAIN) {
      return new NextResponse("Unauthorized domain", { status: 403 });
    }

    // Forward the Range header if it exists to support chunked downloading in PDF.js
    const headers = new Headers();
    const range = req.headers.get("range");
    if (range) {
      headers.set("range", range);
    }
    
    // Add standard browser headers to bypass CDN bot protection (like Hostinger CDN)
    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    headers.set("Accept", "application/pdf,*/*");

    const response = await fetch(pdfUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, { status: response.status });
    }

    // Construct the response headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", "application/pdf");
    
    // Forward necessary headers for range requests
    const acceptRanges = response.headers.get("accept-ranges");
    if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);
    
    const contentLength = response.headers.get("content-length");
    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    
    const contentRange = response.headers.get("content-range");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error("PDF Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
