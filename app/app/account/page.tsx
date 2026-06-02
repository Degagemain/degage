import { redirect } from 'next/navigation';

export default function AccountIndexPage() {
  redirect('/app/account/settings');
}
