import type { Build } from "./db";

/**
 * Encodes a build to a URL-safe string
 * Works on both client and server
 */
export function encodeBuild(build: Omit<Build, "id">): string {
  const json = JSON.stringify(build);

  // Use base64url encoding (URL-safe)
  if (typeof window !== "undefined") {
    // Client-side: use btoa
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } else {
    // Server-side: use Buffer
    return Buffer.from(json, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

/**
 * Decodes a URL-encoded build string
 * Works on both client and server
 */
export function decodeBuild(encoded: string): Omit<Build, "id"> | null {
  try {
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    let json: string;
    if (typeof window !== "undefined") {
      // Client-side: use atob
      json = atob(base64);
    } else {
      // Server-side: use Buffer
      json = Buffer.from(base64, "base64").toString("utf-8");
    }

    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Creates a shareable URL for a build
 */
export function createBuildUrl(build: Omit<Build, "id">): string {
  const encoded = encodeBuild(build);
  return `/builds/${encoded}`;
}
