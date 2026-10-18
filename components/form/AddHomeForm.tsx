'use client';

import { useActionState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/form/Button';
import { addHomeToList, type AddHomeState } from '@/utils/actions';
import { categoryHouses } from '@/lib/categoryHouses';

const initialState: AddHomeState = {};

function AddHomeForm() {
  const [state, formAction] = useActionState(addHomeToList, initialState);

  return (
    <form action={formAction}>
      {state.error && (
        <p role="alert" className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 my-4">
        <div className="mb-2">
          <Label className="mb-2 capitalize" htmlFor="location">location</Label>
          <Input id="location" type="text" name="location" defaultValue={state.values?.location} required />
        </div>
        <div className="mb-2">
          <Label className="mb-2 capitalize" htmlFor="title">category</Label>
          <select
            id="title"
            name="title"
            // key forces a remount so the restored default is applied after React resets the form
            key={state.values?.title}
            defaultValue={state.values?.title}
            required
            className="w-full h-9 px-2 text-base md:text-sm border border-input bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {categoryHouses.map((item) => (
              <option key={item.id} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <Label className="mb-2 capitalize" htmlFor="description">description</Label>
          <Textarea id="description" name="description" defaultValue={state.values?.description} required />
        </div>
        <div className="mb-2">
          <Label className="mb-2 capitalize" htmlFor="price">price per night ($)</Label>
          <Input id="price" type="number" name="price" min={1} step={1} defaultValue={state.values?.price} required />
        </div>
        <div className="mb-2">
          <Label className="mb-2 capitalize" htmlFor="image">image</Label>
          <Input id="image" type="file" name="image" accept="image/*" required />
          <p className="mt-1 text-xs text-muted-foreground">Max 4 MB.</p>
        </div>
      </div>
      <SubmitButton text="add home" className="mt-8 airbnb-color" />
    </form>
  );
}

export default AddHomeForm;
