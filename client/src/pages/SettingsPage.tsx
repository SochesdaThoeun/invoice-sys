import { UserProfileForm } from '../features/settings/components/UserProfileForm';

function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-start flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="px-4 text-2xl font-bold lg:px-6">Settings</h1>
          <div className="px-4 lg:px-6  flex flex-start justify-start">
          <UserProfileForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export { SettingsPage }