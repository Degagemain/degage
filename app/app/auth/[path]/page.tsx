import { AuthPathView } from '@/app/components/auth/auth-path-view';
import { authStaticParams } from '@/app/components/auth/auth-view-paths';

export const dynamicParams = false;

export function generateStaticParams() {
  return authStaticParams();
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;
  return <AuthPathView path={path} />;
}
