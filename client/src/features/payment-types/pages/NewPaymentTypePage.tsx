import { PaymentTypeForm } from '../components/PaymentTypeForm';

function NewPaymentTypePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="px-4 text-2xl font-bold lg:px-6">Add New Payment Type</h1>
          <div className="px-4 lg:px-6">
            <PaymentTypeForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export { NewPaymentTypePage }; 