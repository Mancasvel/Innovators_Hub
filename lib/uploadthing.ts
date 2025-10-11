/**
 * Uploadthing configuration for file uploads
 * Handles event images and other media
 */

import { generateComponents, generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Uploadthing React components
 * Use these in your client components
 */
export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();

/**
 * Uploadthing React helpers (hooks)
 * Use useUploadThing hook for programmatic uploads
 */
export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

