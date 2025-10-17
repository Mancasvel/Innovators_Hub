"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useUploadThing } from "@/lib/uploadthing";

/**
 * Image upload component with preview before upload
 * Shows selected images in preview with option to remove before uploading
 */

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxImages?: number;
  uploadType?: "eventImage" | "profileImage";
}

interface PreviewImage {
  file: File;
  preview: string;
  id: string;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  multiple = false,
  maxImages = 10,
  uploadType = "eventImage",
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Use UploadThing hook
  const { startUpload, isUploading: isUploadingUT } = useUploadThing(
    uploadType,
    {
      onClientUploadComplete: (res) => {
        console.log("✅ Upload complete from hook:", res);
      },
      onUploadError: (error) => {
        console.error("❌ Upload error from hook:", error);
        setError(error.message);
      },
      onUploadBegin: (fileName) => {
        console.log("🔄 Upload started for:", fileName);
      },
    },
  );

  // Normalize value to always be an array when in multiple mode
  const normalizedValue = multiple
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : value;

  const images = multiple
    ? (normalizedValue as string[])
    : normalizedValue
      ? [normalizedValue as string]
      : [];

  // Handle file selection
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const newPreviewImages: PreviewImage[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9),
      }));

      setPreviewImages((prev) => {
        const combined = [...prev, ...newPreviewImages];
        // Limit to maxImages
        return combined.slice(0, maxImages);
      });

      setError(null);
    },
    [disabled, maxImages],
  );

  // Remove preview image
  const removePreviewImage = useCallback((id: string) => {
    setPreviewImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // Upload all preview images
  const uploadImages = useCallback(async () => {
    console.log("🔵 uploadImages called");
    console.log("📊 State:", {
      previewImagesLength: previewImages.length,
      isUploading,
      isUploadingUT,
      startUploadAvailable: !!startUpload,
    });

    if (previewImages.length === 0) {
      console.warn("⚠️ No preview images to upload");
      return;
    }

    if (isUploading || isUploadingUT) {
      console.warn("⚠️ Already uploading");
      return;
    }

    if (!startUpload) {
      console.error("❌ startUpload function not available");
      setError("Upload function not initialized. Please refresh the page.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Extract files from preview images
      const filesToUpload = previewImages.map(
        (previewImage) => previewImage.file,
      );

      console.log(
        "🚀 Starting upload of",
        filesToUpload.length,
        "files to",
        uploadType,
      );
      console.log(
        "📁 Files:",
        filesToUpload.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      );

      // Upload files using UploadThing hook
      console.log("📤 Calling startUpload...");
      const uploadedFiles = await startUpload(filesToUpload);

      console.log("📥 Upload response received:", {
        result: uploadedFiles,
        isArray: Array.isArray(uploadedFiles),
        length: uploadedFiles?.length,
        type: typeof uploadedFiles,
      });

      if (!uploadedFiles) {
        throw new Error(
          "UploadThing returned null or undefined. Check server logs for authentication errors.",
        );
      }

      if (uploadedFiles.length === 0) {
        throw new Error(
          "No files were uploaded - UploadThing returned empty array. Check file size and format restrictions.",
        );
      }

      console.log("✅ Upload successful:", uploadedFiles);

      const uploadedUrls = uploadedFiles.map((file) => {
        console.log("📎 Processing file:", file);
        return file.url;
      });
      console.log("🔗 Final URLs:", uploadedUrls);

      if (multiple) {
        const currentImages = normalizedValue as string[];
        const newImages = [...currentImages, ...uploadedUrls];
        console.log("💾 Updating images array:", {
          old: currentImages,
          new: newImages,
        });
        onChange(newImages);
      } else {
        console.log("💾 Updating single image:", uploadedUrls[0]);
        onChange(uploadedUrls[0]);
      }

      // Clear preview images after successful upload
      setPreviewImages([]);
      console.log("✅ Preview images cleared - Upload complete!");
    } catch (err) {
      console.error("❌ Upload error:", err);
      console.error("📋 Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
        previewImagesCount: previewImages.length,
        uploadType,
      });

      if (err instanceof Error && err.message.includes("No secret provided")) {
        setError(
          "UploadThing token not configured. Please check your .env.local file.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to upload images. Please try again.",
        );
      }
    } finally {
      setIsUploading(false);
      console.log("🏁 Upload process finished");
    }
  }, [
    previewImages,
    isUploading,
    isUploadingUT,
    multiple,
    normalizedValue,
    onChange,
    uploadType,
    startUpload,
  ]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 4 * 1024 * 1024, // 4MB
    multiple: multiple || maxImages > 1,
    disabled: disabled || isUploading,
  });

  return (
    <div className="space-y-6">
      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Uploaded Images
          </h4>
          <div
            className={`grid gap-4 ${multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}
          >
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <Image
                    src={imageUrl}
                    alt={`Uploaded image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (multiple) {
                      const currentImages = normalizedValue as string[];
                      const newImages = currentImages.filter(
                        (_, i) => i !== index,
                      );
                      onChange(newImages);
                    } else {
                      onChange("");
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-sm hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Images (before upload) */}
      {previewImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Images to Upload ({previewImages.length})
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPreviewImages([])}
                className="text-sm text-red-600 hover:text-red-800"
                disabled={isUploading}
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={uploadImages}
                disabled={isUploading || isUploadingUT}
                className="btn btn-primary text-sm px-4 py-2"
              >
                {isUploading || isUploadingUT
                  ? "Uploading..."
                  : `Upload ${previewImages.length} Image${previewImages.length > 1 ? "s" : ""}`}
              </button>
            </div>
          </div>

          <div
            className={`grid gap-4 ${multiple ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}
          >
            {previewImages.map((previewImage) => (
              <div key={previewImage.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-blue-200 bg-blue-50 relative">
                  <Image
                    src={previewImage.preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePreviewImage(previewImage.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-sm hover:bg-red-700 transition-colors"
                  disabled={isUploading}
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  Preview
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area - Only show if we can add more images */}
      {(!multiple && !normalizedValue && previewImages.length === 0) ||
        (multiple &&
          (normalizedValue as string[]).length + previewImages.length <
            maxImages && (
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"}
              ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-gray-400"}
            `}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <div className="text-gray-600">
                    <span className="font-semibold text-seville-orange">
                      {isDragActive
                        ? "Drop images here"
                        : "Click to select images"}
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF or WEBP (max 4MB)
                    {multiple && ` • Up to ${maxImages} images`}
                  </p>
                </div>
              </div>

              {/* Alternative: URL Input */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Or paste an image URL
                </p>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => {
                    if (
                      e.target.value?.match(
                        /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                      )
                    ) {
                      if (multiple) {
                        const currentImages = normalizedValue as string[];
                        onChange([...currentImages, e.target.value]);
                      } else {
                        onChange(e.target.value);
                      }
                    }
                  }}
                  className="input max-w-md mx-auto"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
