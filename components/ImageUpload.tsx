'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

/**
 * Image upload component with preview
 * Supports drag & drop and file selection
 */

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Validate file size (4MB max)
      if (file.size > 4 * 1024 * 1024) {
        setError('File size must be less than 4MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }

      setError(null);
      setUploading(true);

      try {
        // Upload to Uploadthing
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/uploadthing', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        onChange(data.url);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  });

  return (
    <div className="space-y-4">
      {/* Preview */}
      {value && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
          <Image
            src={value}
            alt="Event image"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors duration-200
            ${isDragActive ? 'border-seville-orange bg-orange-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-seville-orange"></div>
              <p className="text-gray-600">Uploading...</p>
            </div>
          ) : isDragActive ? (
            <div>
              <p className="text-seville-orange font-semibold">
                Drop the image here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600">
                <span className="font-semibold text-seville-orange">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF or WEBP (max 4MB)
              </p>
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

      {/* Alternative: URL Input */}
      {!value && !uploading && (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Or paste an image URL</p>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            onChange={(e) => {
              if (e.target.value && e.target.value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                onChange(e.target.value);
              }
            }}
            className="input max-w-md mx-auto"
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

