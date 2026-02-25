import { UserProfile } from "@clerk/clerk-react";
import { SettingsLayout } from "./layout";

export const AccountSettings = () => {
  return (
    <SettingsLayout
      title="Settings"
      description="Manage your account details and preferences."
    >
      <div className="flex justify-center">
        <UserProfile routing="path" path="/settings/account" />
      </div>
    </SettingsLayout>
  );
};
