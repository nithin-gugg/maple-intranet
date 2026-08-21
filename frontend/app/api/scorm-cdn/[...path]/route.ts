import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const supabaseBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iidmjrsfflnpbijiijpo.supabase.co';
    const targetUrl = `${supabaseBaseUrl}/storage/v1/object/public/scorm/${path}`;

    const lowerPath = path.toLowerCase();
    
    // HTML files MUST be proxied directly to bypass Supabase's strict text/plain XSS protection.
    // This also ensures that any nested iframes remain on the same domain as the parent LMS,
    // which is critical for SCORM window.parent.API communication.
    if (lowerPath.endsWith('.html') || lowerPath.endsWith('.htm')) {
      const response = await fetch(targetUrl);
      
      if (!response.ok) {
        return new NextResponse(`Error fetching SCORM content: ${response.statusText}`, { status: response.status });
      }
      
      const html = await response.text();
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // For all other assets (JS, CSS, images, videos), we issue a 302 redirect to the Supabase CDN.
    // This offloads the bandwidth to the CDN and ensures fast delivery.
    return NextResponse.redirect(targetUrl, 302);
  } catch (error) {
    console.error('SCORM CDN Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
