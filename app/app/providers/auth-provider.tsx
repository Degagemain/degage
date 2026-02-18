'use client';

import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { authClient } from '@/app/lib/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const t = useTranslations('auth');
  const socialProviders = {
    providers: process.env.NEXT_PUBLIC_BETTER_AUTH_SOCIAL_PROVIDERS?.split(',') || [],
  };

  // Map next-intl translations to Better Auth UI localization format
  const localization = {
    SIGN_IN: t('signIn'),
    SIGN_IN_DESCRIPTION: t('signInDescription'),
    SIGN_IN_ACTION: t('signInAction'),
    SIGN_UP: t('signUp'),
    SIGN_UP_DESCRIPTION: t('signUpDescription'),
    SIGN_UP_ACTION: t('signUpAction'),
    SIGN_UP_EMAIL: t('signUpEmail'),
    SIGN_OUT: t('signOut'),
    FORGOT_PASSWORD: t('forgotPassword'),
    FORGOT_PASSWORD_DESCRIPTION: t('forgotPasswordDescription'),
    FORGOT_PASSWORD_ACTION: t('forgotPasswordAction'),
    FORGOT_PASSWORD_EMAIL: t('forgotPasswordEmail'),
    FORGOT_PASSWORD_LINK: t('forgotPasswordLink'),
    RESET_PASSWORD: t('resetPassword'),
    RESET_PASSWORD_DESCRIPTION: t('resetPasswordDescription'),
    RESET_PASSWORD_ACTION: t('resetPasswordAction'),
    RESET_PASSWORD_SUCCESS: t('resetPasswordSuccess'),
    CHANGE_PASSWORD: t('changePassword'),
    CHANGE_PASSWORD_DESCRIPTION: t('changePasswordDescription'),
    CHANGE_PASSWORD_SUCCESS: t('changePasswordSuccess'),
    CHANGE_PASSWORD_INSTRUCTIONS: t('changePasswordInstructions'),
    EMAIL: t('email'),
    EMAIL_PLACEHOLDER: t('emailPlaceholder'),
    EMAIL_DESCRIPTION: t('emailDescription'),
    EMAIL_REQUIRED: t('emailRequired'),
    PASSWORD: t('password'),
    PASSWORD_PLACEHOLDER: t('passwordPlaceholder'),
    PASSWORD_REQUIRED: t('passwordRequired'),
    NEW_PASSWORD: t('newPassword'),
    NEW_PASSWORD_PLACEHOLDER: t('newPasswordPlaceholder'),
    NEW_PASSWORD_REQUIRED: t('newPasswordRequired'),
    CURRENT_PASSWORD: t('currentPassword'),
    CURRENT_PASSWORD_PLACEHOLDER: t('currentPasswordPlaceholder'),
    CONFIRM_PASSWORD: t('confirmPassword'),
    CONFIRM_PASSWORD_PLACEHOLDER: t('confirmPasswordPlaceholder'),
    CONFIRM_PASSWORD_REQUIRED: t('confirmPasswordRequired'),
    PASSWORDS_DO_NOT_MATCH: t('passwordsDoNotMatch'),
    NAME: t('name'),
    NAME_PLACEHOLDER: t('namePlaceholder'),
    NAME_DESCRIPTION: t('nameDescription'),
    REMEMBER_ME: t('rememberMe'),
    ALREADY_HAVE_AN_ACCOUNT: t('alreadyHaveAnAccount'),
    DONT_HAVE_AN_ACCOUNT: t('dontHaveAnAccount'),
    OR_CONTINUE_WITH: t('orContinueWith'),
    SIGN_IN_WITH: t('signInWith'),
    DELETE_ACCOUNT: t('deleteAccount'),
    DELETE_ACCOUNT_DESCRIPTION: t('deleteAccountDescription'),
    DELETE_ACCOUNT_SUCCESS: t('deleteAccountSuccess'),
    AVATAR: t('avatar'),
    AVATAR_DESCRIPTION: t('avatarDescription'),
    SETTINGS: t('settings'),
    SECURITY: t('security'),
    SESSIONS: t('sessions'),
    SESSIONS_DESCRIPTION: t('sessionsDescription'),
    CURRENT_SESSION: t('currentSession'),
    PROVIDERS: t('providers'),
    PROVIDERS_DESCRIPTION: t('providersDescription'),
    LINK: t('link'),
    UNLINK: t('unlink'),
    TWO_FACTOR: t('twoFactor'),
    TWO_FACTOR_DESCRIPTION: t('twoFactorDescription'),
    TWO_FACTOR_CARD_DESCRIPTION: t('twoFactorCardDescription'),
    ENABLE_TWO_FACTOR: t('enableTwoFactor'),
    DISABLE_TWO_FACTOR: t('disableTwoFactor'),
    MAGIC_LINK: t('magicLink'),
    MAGIC_LINK_DESCRIPTION: t('magicLinkDescription'),
    MAGIC_LINK_ACTION: t('magicLinkAction'),
    MAGIC_LINK_EMAIL: t('magicLinkEmail'),
    VERIFY_YOUR_EMAIL: t('verifyYourEmail'),
    VERIFY_YOUR_EMAIL_DESCRIPTION: t('verifyYourEmailDescription'),
    RESEND_VERIFICATION_EMAIL: t('resendVerificationEmail'),
    SAVE: t('save'),
    CANCEL: t('cancel'),
    DELETE: t('delete'),
    CONTINUE: t('continue'),
    GO_BACK: t('goBack'),
    UPDATED_SUCCESSFULLY: t('updatedSuccessfully'),
    INVALID_EMAIL_OR_PASSWORD: t('invalidEmailOrPassword'),
    USER_NOT_FOUND: t('userNotFound'),
    USER_ALREADY_EXISTS: t('userAlreadyExists'),
  };

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      basePath="/app/auth"
      account={{ basePath: '/app/account' }}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={Link}
      social={socialProviders}
      localization={localization}
    >
      {children}
    </AuthUIProvider>
  );
}
