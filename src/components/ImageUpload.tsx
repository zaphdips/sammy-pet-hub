"use client";

/**
 * ImageUpload Component
 *
 * WHY: Centralised image uploader that handles the full Supabase Storage
 * upload flow — file selection, validation, upload, and returning the
 * public URL. Reused across all admin forms (pets, products, breeds).
 *
 * Props:
 * - bucket: Which Supabase Storage bucket to upload to
 * - onUpload: Callback with the public URL after a successful upload
 * - existingUrl: Optional existing image to preview
 */

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./ImageUpload.module.css";

type Props = {
  bucket: "pet-images" | "product-images" | "breed-images" | "content-images" | "promo-images";
  onUpload: (url: string) => void;
  existingUrl?: string;
  label?: string;
};

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ bucket, onUpload, existingUrl, label = "Photo" }: Props) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Revoke blob URLs when preview changes or component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type — allowlist only, never denylist
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, or WebP images are allowed.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    // Show preview immediately for responsive feel
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      // Generate a unique filename to avoid collisions in the bucket
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Get the public URL for storing in the database
      const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
      onUpload(data.publicUrl);
    } catch (err: any) {
      setError("Upload failed. Please try again.");
      console.error("[ImageUpload] Upload error:", err.message);
      setPreview(existingUrl ?? null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>

      <div
        className={`${styles.dropzone} ${uploading ? styles.uploading : ""}`}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <div className={styles.previewWrapper}>
            <Image src={preview} alt="Preview" fill className={styles.preview} />
            <div className={styles.overlay}>
              <span>{uploading ? "Uploading..." : "Click to change"}</span>
            </div>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.icon}>📷</span>
            <p>{uploading ? "Uploading..." : "Click to upload image"}</p>
            <small>JPG, PNG, or WebP — max {MAX_FILE_SIZE_MB}MB</small>
          </div>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        aria-label={`Upload ${label}`}
      />
    </div>
  );
}
