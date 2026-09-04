export type DocumentUrlType = "DIRECT_PDF" | "GOOGLE_DRIVE_PREVIEW" | "INVALID";

export function detectDocumentUrlType(url: string): DocumentUrlType {
  try {
    const parsedUrl = new URL(url);

    // Only allow HTTPS protocol for security (no javascript:, data:, etc.)
    if (parsedUrl.protocol !== "https:") {
      return "INVALID";
    }

    // Check if it's a Google Drive preview URL
    // Examples: 
    // https://drive.google.com/file/d/1Xjazjeo_iwaJAq5VAg0UfXjIFJy2lFGk/preview
    // https://drive.google.com/file/d/FILE_ID/view
    if (parsedUrl.hostname === "drive.google.com") {
      // Must match /file/d/{id}/preview or /file/d/{id}/view
      const match = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)\/(preview|view)\/?$/);
      if (match) {
        return "GOOGLE_DRIVE_PREVIEW";
      }
      // If it's on drive.google.com but doesn't match the preview pattern,
      // it might not be embeddable, but let's assume if the admin pasted it, 
      // they might have pasted the /view link. We'll accept /preview or /view.
      // Otherwise, mark as invalid or direct pdf? Better to mark invalid if it's drive but not preview/view.
      return "INVALID";
    }

    // Default: Assume direct PDF for any other valid HTTPS URL
    return "DIRECT_PDF";

  } catch (error) {
    // URL parsing failed
    return "INVALID";
  }
}
