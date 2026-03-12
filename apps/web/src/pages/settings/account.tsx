import { UserProfile } from "@clerk/clerk-react";
import { SettingsLayout } from "./layout";

export const AccountSettings = () => {
  return (
    <SettingsLayout>
      <div className="flex justify-center">
        <UserProfile routing="path" path="/settings/account" />
      </div>
    </SettingsLayout>
  );
};
