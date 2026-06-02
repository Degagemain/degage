import { PublicPage } from '@/app/components/public/public-shell';
import { AccountSettingsPage } from '@/app/components/account/account-settings-page';

export default function AccountSettingsRoute() {
  return (
    <PublicPage narrow>
      <AccountSettingsPage />
    </PublicPage>
  );
}
