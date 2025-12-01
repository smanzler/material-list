import type { Build } from "./db";
import pako from "pako";

/**
 * Encodes a build to a URL-safe string with compression
 * Works on both client and server
 * Removes timestamps to reduce size (they're set on decode)
 */
export function encodeBuild(build: Omit<Build, "id">): string {
  // Only encode essential data (name and materials)
  // Timestamps are not needed for sharing
  const data = {
    name: build.name,
    materials: build.materials,
  };
  const json = JSON.stringify(data);

  // Compress using deflate (gzip without headers for smaller size)
  const compressed = pako.deflate(json);

  // Use base64url encoding (URL-safe)
  if (typeof window !== "undefined") {
    // Client-side: convert Uint8Array to base64
    let binary = "";
    for (let i = 0; i < compressed.length; i++) {
      binary += String.fromCharCode(compressed[i]);
    }
    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  } else {
    // Server-side: use Buffer
    return Buffer.from(compressed)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

/**
 * Decodes a URL-encoded build string with decompression
 * Works on both client and server
 * Adds timestamps on decode
 * Supports both compressed (new) and uncompressed (old) formats for backward compatibility
 */
export function decodeBuild(encoded: string): Omit<Build, "id"> | null {
  try {
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    // Try compressed format first (new format)
    try {
      let compressed: Uint8Array;
      if (typeof window !== "undefined") {
        // Client-side: use atob and convert to Uint8Array
        const binary = atob(base64);
        compressed = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          compressed[i] = binary.charCodeAt(i);
        }
      } else {
        // Server-side: use Buffer
        const buffer = Buffer.from(base64, "base64");
        compressed = new Uint8Array(buffer);
      }

      // Decompress using deflate
      const json = pako.inflate(compressed, { to: "string" });
      const data = JSON.parse(json);

      // Add timestamps (use current time since they weren't encoded)
      const now = Date.now();
      return {
        name: data.name,
        materials: data.materials,
        createdAt: now,
        updatedAt: now,
      };
    } catch {
      // Fall back to uncompressed format (old format) for backward compatibility
      let json: string;
      if (typeof window !== "undefined") {
        // Client-side: use atob
        json = atob(base64);
      } else {
        // Server-side: use Buffer
        json = Buffer.from(base64, "base64").toString("utf-8");
      }

      const data = JSON.parse(json);
      // Old format includes timestamps, so use them if present
      return {
        name: data.name,
        materials: data.materials,
        createdAt: data.createdAt ?? Date.now(),
        updatedAt: data.updatedAt ?? Date.now(),
      };
    }
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
