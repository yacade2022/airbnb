'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { ImagePlus } from 'lucide-react';
import { FieldError } from '@/components/form/FieldError';
import { MAX_IMAGE_SIZE } from '@/lib/listingRules';
import type { GalleryField } from '@/utils/actions';
import { cn } from '@/lib/utils';

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

type GalleryPhotoFieldProps = {
  name: GalleryField;
  // Shown in the label, e.g. "Photo 2"
  label: string;
  // The slot's saved photo, when editing
  current?: string;
  // Error from the server for this slot
  serverError?: string;
};

// One optional extra photo. When editing, the saved photo stays unless a new one is chosen or
// "Remove" is ticked; the parent remounts this after each submission to reset it
function GalleryPhotoField({ name, label, current, serverError }: GalleryPhotoFieldProps) {
  const hintId = useId();
  const [preview, setPreview] = useState<{ url: string; name: string; size: number } | null>(null);
  const [error, setError] = useState<string>();
  const [removed, setRemoved] = useState(false);

  // Free the object URL when the preview changes or the field unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    let message = '';
    if (file && !file.type.startsWith('image/')) message = 'The chosen file must be an image.';
    else if (file && file.size > MAX_IMAGE_SIZE) message = `This image is ${formatSize(file.size)}. Please choose one that is 4 MB or smaller.`;
    // Blocks submission with the browser's own message until a valid file is chosen
    input.setCustomValidity(message);
    setError(message || undefined);
    setPreview(file && !message ? { url: URL.createObjectURL(file), name: file.name, size: file.size } : null);
    if (file && !message) setRemoved(false);
  };

  const message = error ?? serverError;
  const shown = preview?.url ?? (removed ? undefined : current);

  return (
    <div>
      <input
        id={name}
        type="file"
        name={name}
        accept="image/*"
        onChange={handleChange}
        className="peer sr-only"
        aria-label={`${label}, optional`}
        aria-describedby={message ? `${name}-error ${hintId}` : hintId}
        {...(message && { 'aria-invalid': true })}
      />
      <label
        htmlFor={name}
        className={cn(
          'group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed text-center transition-colors hover:border-foreground/40 hover:bg-muted/50',
          'peer-focus-visible:border-ring peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50',
          shown && 'border-solid',
          message && 'border-destructive/60'
        )}
      >
        {shown ? (
          <>
            {/* A local blob preview has nothing to optimise */}
            <Image
              src={shown}
              alt={preview ? `Preview of the chosen ${label.toLowerCase()}` : `Current ${label.toLowerCase()}`}
              fill
              unoptimized={Boolean(preview)}
              sizes="(min-width: 768px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="absolute inset-x-2 bottom-2 truncate rounded-full bg-background/95 px-3 py-1 text-xs font-medium shadow-sm">
              {preview ? `${preview.name} · ${formatSize(preview.size)}` : `Replace ${label.toLowerCase()}`}
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-7 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">Add {label.toLowerCase()}</span>
          </>
        )}
      </label>
      <p id={hintId} className="sr-only">
        JPG, PNG, WebP or AVIF, up to 4 MB.{current && ' Leave empty to keep the current photo.'}
      </p>
      {current && !preview && (
        <label className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            name={`remove-${name}`}
            checked={removed}
            onChange={(event) => setRemoved(event.currentTarget.checked)}
            className="size-4 accent-brand"
          />
          Remove this photo
        </label>
      )}
      <FieldError id={`${name}-error`} message={message} />
    </div>
  );
}

export default GalleryPhotoField;
