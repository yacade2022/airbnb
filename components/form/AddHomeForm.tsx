'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CircleAlert, ImagePlus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/form/Button';
import { addHomeToList, type AddHomeField, type AddHomeState } from '@/utils/actions';
import { categoryHouses } from '@/lib/categoryHouses';
import { MAX_DESCRIPTION_LENGTH, MAX_IMAGE_SIZE, MAX_LOCATION_LENGTH } from '@/lib/listingRules';
import { cn } from '@/lib/utils';

const initialState: AddHomeState = {};

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

function AddHomeForm() {
  const [state, formAction] = useActionState(addHomeToList, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [preview, setPreview] = useState<{ url: string; name: string; size: number } | null>(null);
  const [imageError, setImageError] = useState<string>();

  // After each submission: move focus to the field with the error, and sync local UI with the
  // form, which React resets once the action finishes (that also clears the chosen file)
  useEffect(() => {
    setDescriptionLength(state.values?.description.length ?? 0);
    setPreview(null);
    setImageError(undefined);
    if (state.field) {
      const field = formRef.current?.elements.namedItem(state.field);
      if (field instanceof HTMLElement) field.focus();
    }
  }, [state]);

  // Free the object URL when the preview changes or the form unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    let message = '';
    if (file && !file.type.startsWith('image/')) message = 'The chosen file must be an image.';
    else if (file && file.size > MAX_IMAGE_SIZE) message = `This image is ${formatSize(file.size)}. Please choose one that is 4 MB or smaller.`;
    // Blocks submission with the browser's own message until a valid file is chosen
    input.setCustomValidity(message);
    setImageError(message || undefined);
    setPreview(file && !message ? { url: URL.createObjectURL(file), name: file.name, size: file.size } : null);
  };

  const fieldError = (field: AddHomeField) => (state.field === field ? state.error : undefined);
  const invalidProps = (field: AddHomeField, message = fieldError(field)) =>
    message ? { 'aria-invalid': true, 'aria-describedby': `${field}-error` } : {};

  const imageMessage = imageError ?? fieldError('image');
  // Errors not tied to one field (e.g. the upload failed) are shown above the form
  const formError = state.error && !state.field ? state.error : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {formError && (
        <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            {formError} <span className="text-foreground">Your details were kept; please choose your photo again.</span>
          </p>
        </div>
      )}
      {/* Screen readers hear field errors when they appear; the field itself also gets focus */}
      <p className="sr-only" aria-live="assertive">{state.field ? state.error : ''}</p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label className="mb-2" htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            name="location"
            defaultValue={state.values?.location}
            placeholder="e.g. Lisbon, Portugal"
            autoComplete="off"
            maxLength={MAX_LOCATION_LENGTH}
            required
            className="h-11"
            {...invalidProps('location')}
          />
          <FieldError id="location-error" message={fieldError('location')} />
        </div>

        <div>
          <Label className="mb-2" htmlFor="title">Category</Label>
          <select
            id="title"
            name="title"
            // key forces a remount so the restored default is applied after React resets the form
            key={state.values?.title}
            defaultValue={state.values?.title ?? ''}
            required
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
            {...invalidProps('title')}
          >
            <option value="" disabled>Choose a category</option>
            {categoryHouses.map((item) => (
              <option key={item.id} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
          <FieldError id="title-error" message={fieldError('title')} />
        </div>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <Label htmlFor="description">Description</Label>
            <span className="text-xs text-muted-foreground" aria-hidden>
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <Textarea
            id="description"
            name="description"
            defaultValue={state.values?.description}
            placeholder="What makes your place special? Mention rooms, beds, and what's nearby."
            rows={5}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(event) => setDescriptionLength(event.currentTarget.value.length)}
            required
            className="min-h-32"
            {...invalidProps('description')}
          />
          <FieldError id="description-error" message={fieldError('description')} />
        </div>

        <div>
          <Label className="mb-2" htmlFor="price">Price per night (USD)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>$</span>
            <Input
              id="price"
              type="number"
              name="price"
              inputMode="numeric"
              min={1}
              step={1}
              placeholder="120"
              defaultValue={state.values?.price}
              required
              className="h-11 pl-7"
              {...invalidProps('price')}
            />
          </div>
          <FieldError id="price-error" message={fieldError('price')} />
        </div>

        <div className="md:col-span-2">
          <span className="mb-2 block text-sm font-medium" id="image-label">Photo</span>
          {/* The real input is visually hidden but still focusable; the label below is the drop zone */}
          <input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            required
            onChange={handleImageChange}
            className="peer sr-only"
            aria-labelledby="image-label image-hint"
            {...invalidProps('image', imageMessage)}
          />
          <label
            htmlFor="image"
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors hover:border-foreground/40 hover:bg-muted/50',
              'peer-focus-visible:border-ring peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50',
              imageMessage && 'border-destructive/60',
              preview && 'p-3'
            )}
          >
            {preview ? (
              <span className="flex w-full flex-col items-center gap-3 sm:flex-row sm:text-left">
                <span className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
                  {/* Local blob preview, nothing to optimise */}
                  <Image src={preview.url} alt="Preview of the chosen photo" fill unoptimized className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{preview.name}</span>
                  <span className="block text-xs text-muted-foreground">{formatSize(preview.size)}</span>
                  <span className="mt-2 block text-sm font-medium underline underline-offset-4">Choose a different photo</span>
                </span>
              </span>
            ) : (
              <>
                <ImagePlus className="size-8 text-muted-foreground" aria-hidden />
                <span className="text-sm font-medium">Choose a photo</span>
              </>
            )}
            <span id="image-hint" className={cn('text-xs text-muted-foreground', preview && 'sr-only')}>
              JPG, PNG, WebP or AVIF, up to 4 MB.
            </span>
          </label>
          <FieldError id="image-error" message={imageMessage} />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
        <Button asChild variant="ghost" className="h-11 px-5">
          <Link href="/">Cancel</Link>
        </Button>
        <SubmitButton text="Publish listing" variant="brand" className="h-11 w-full sm:w-auto" />
      </div>
    </form>
  );
}

export default AddHomeForm;
