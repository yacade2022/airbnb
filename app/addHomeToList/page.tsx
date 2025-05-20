import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/form/Button';
import { addHomeToList } from '@/utils/actions';
import { categoryHouses } from '@/lib/categoryHouses';

function AddHome() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">add your home</h1>
      <div className="border p-8 rounded-md">
        <form action={addHomeToList}>
          <div className="grid gap-4 md:grid-cols-2 my-4">
            <div className="mb-2">
              <Label className="mb-2 capitalize" htmlFor="location">location</Label>
              <Input id="location" type="text" name="location" />
            </div>
            <div className="mb-2">
              <Label className="mb-2 capitalize" htmlFor="title">title</Label>
              <select 
                id="title" 
                name="title" 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <Textarea id="description" name="description" />
            </div>
            <div className="mb-2">
              <Label className="mb-2 capitalize" htmlFor="price">price ($)</Label>
              <Input id="price" type="number" name="price" min={0} required />
            </div>
            <div className="mb-2">
              <Label className="mb-2 capitalize" htmlFor="image">Image</Label>
              <Input id="image" type="file" name="image" />
            </div>
          </div>
          <SubmitButton text="add home" className="mt-8 airbnb-color" />
        </form>
      </div>
    </section>
  );
}

export default AddHome;