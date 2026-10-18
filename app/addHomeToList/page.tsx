import AddHomeForm from '@/components/form/AddHomeForm';

function AddHome() {
  return (
    <section className="py-8">
      <h1 className="text-2xl font-semibold mb-8 capitalize">add your home</h1>
      <div className="border p-4 sm:p-8 rounded-md">
        <AddHomeForm />
      </div>
    </section>
  );
}

export default AddHome;
