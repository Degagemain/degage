import { PublicShell } from '@/app/components/public/public-shell';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
