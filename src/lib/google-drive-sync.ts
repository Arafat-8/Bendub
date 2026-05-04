
'use client';

/**
 * Utility for interacting with the Google Drive API to find video files.
 */

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
}

export async function fetchVideosFromFolder(driveFolderId: string, apiKey: string): Promise<DriveVideoFile[]> {
  if (!apiKey) throw new Error("Google Drive API Key is required for synchronization.");

  const query = encodeURIComponent(`'${driveFolderId}' in parents and mimeType contains 'video/' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${apiKey}&fields=files(id, name, mimeType)`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch files from Google Drive.");
    }

    return data.files || [];
  } catch (error: any) {
    console.error("Drive Sync Error:", error);
    throw error;
  }
}

export function extractFolderId(url: string): string | null {
  try {
    if (url.includes("/folders/")) {
      return url.split("/folders/")[1].split(/[/?]/)[0];
    }
    // Handle short IDs or direct strings
    if (url.length > 20 && !url.includes("/")) {
      return url;
    }
    return null;
  } catch {
    return null;
  }
}
