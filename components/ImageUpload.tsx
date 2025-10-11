'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { UploadButton, UploadDropzone } from '@/lib/uploadthing';

/**
 * Image upload component with preview
 * Uses UploadThing for proper file handling
 */

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxImages?: number;
  uploadType?: 'eventImage' | 'profileImage';
}

type SingleImageHandler = (value: string) => void;
type MultipleImageHandler = (value: string[]) => void;
type ImageUploadOnChangeHandler = (value: string | string[]) => void;

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  multiple = false,
  maxImages = 10,
  uploadType = 'eventImage',
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null);

  // Normalize value to always be an array when in multiple mode
  const normalizedValue = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : value;

  const images = multiple ? normalizedValue as string[] : normalizedValue ? [normalizedValue as string] : [];

  const handleUploadComplete = useCallback((res: { url: string }[]) => {
    if (res && res.length > 0) {
      const newUrl = res[0].url;

      if (multiple) {
        // Multiple images mode - always return array
        const currentImages = normalizedValue as string[];
        if (currentImages.length < maxImages) {
          onChange([...currentImages, newUrl]);
        }
      } else {
        // Single image mode - return string
        onChange(newUrl);
      }
    }
  }, [onChange, multiple, normalizedValue, maxImages]);

  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload error:', error);
    setError('Failed to upload image. Please try again.');
  }, []);

  return (
    <div className="space-y-4">
      {/* Multiple Images Preview */}
      {images.length > 0 && (
        <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (multiple) {
                    const currentImages = normalizedValue as string[];
                    const newImages = currentImages.filter((_, i) => i !== index);
                    onChange(newImages);
                  } else {
                    onChange('');
                  }
                }}
                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full text-sm hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                disabled={disabled}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {(!multiple && !normalizedValue) || (multiple && (normalizedValue as string[]).length < maxImages) && (
        <div className="space-y-4">
          <UploadDropzone
            endpoint={uploadType}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            `}
            appearance={{
              button: "bg-seville-orange hover:bg-seville-orange/90 text-white",
              label: "text-gray-600",
              allowedContent: "text-xs text-gray-500"
            }}
            content={{
              button({ ready, isUploading }) {
                if (isUploading) return <div>Uploading...</div>;
                return ready ? (multiple ? 'Upload Images' : 'Upload Image') : 'Loading...';
              },
              allowedContent({ ready, fileTypes, isUploading }) {
                return ready ? (
                  <div className="space-y-2">
                    <div className="text-gray-600">
                      <span className="font-semibold text-seville-orange">
                        {multiple ? 'Click to upload images' : 'Click to upload'}
                      </span>{' '}
                      or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF or WEBP (max 4MB)
                      {multiple && ` • Up to ${maxImages} images`}
                    </p>
                  </div>
                ) : null;
              }
            }}
          />

          {/* Alternative: URL Input */}
          {(!normalizedValue || (multiple && (normalizedValue as string[]).length === 0)) && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Or paste an image URL</p>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                onChange={(e) => {
                  if (e.target.value && e.target.value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
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
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

