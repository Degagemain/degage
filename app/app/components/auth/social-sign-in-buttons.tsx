'use client';

import { GithubSignInButton } from '@/app/components/auth/github-sign-in-button';
import { GoogleSignInButton } from '@/app/components/auth/google-sign-in-button';
import { isGithubAuthEnabled, isGoogleAuthEnabled } from '@/app/components/auth/lib/auth-features';

type SocialSignInButtonsProps = {
  callbackURL: string;
  disabled?: boolean;
};

export function SocialSignInButtons({ callbackURL, disabled }: SocialSignInButtonsProps) {
  const showGithub = isGithubAuthEnabled();
  const showGoogle = isGoogleAuthEnabled();

  if (!showGithub && !showGoogle) return null;

  return (
    <div className="flex flex-col gap-2">
      {showGoogle ? <GoogleSignInButton callbackURL={callbackURL} disabled={disabled} /> : null}
      {showGithub ? <GithubSignInButton callbackURL={callbackURL} disabled={disabled} /> : null}
    </div>
  );
}
