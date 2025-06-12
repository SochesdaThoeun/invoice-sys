import { CustomerForm } from '../components/CustomerForm';

function EditCustomerPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="px-4 text-2xl font-bold lg:px-6">Edit Customer</h1>
          <div className="px-4 lg:px-6">
            <CustomerForm editMode={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

export { EditCustomerPage }; 