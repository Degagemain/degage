type AuthErrorTranslator = (key: string) => string;

function errorCodeToCamelCase(errorCode: string): string {
  return errorCode.toLowerCase().replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

export function getAuthErrorMessage(error: unknown, t: AuthErrorTranslator): string {
  if (typeof error === 'string') {
    const translated = t(error);
    if (translated !== error) return translated;
  }

  const err = error as { error?: { code?: string; message?: string }; message?: string };
  const code = err?.error?.code;
  if (code) {
    const camel = errorCodeToCamelCase(code);
    const translated = t(camel);
    if (translated !== camel) return translated;
  }

  const message = err?.error?.message ?? err?.message;
  if (message) {
    const lower = message.toLowerCase();
    if (lower.includes('invalid') && (lower.includes('password') || lower.includes('email'))) {
      return t('invalidEmailOrPassword');
    }
    if (lower.includes('already exists') || lower.includes('user already')) {
      return t('userAlreadyExists');
    }
    if (lower.includes('not found')) {
      return t('userNotFound');
    }
    if (lower.includes('verify') && lower.includes('email')) {
      return t('verifyYourEmailDescription');
    }
    return message;
  }

  return t('requestFailed');
}

export function getAuthErrorCode(error: unknown): string {
  const err = error as { error?: { code?: string }; message?: string };
  if (err?.error?.code) return err.error.code;

  const message = err?.error?.message ?? err?.message;
  if (!message) return 'unknown';

  const lower = message.toLowerCase();
  if (lower.includes('invalid') && (lower.includes('password') || lower.includes('email'))) {
    return 'invalid_credentials';
  }
  if (lower.includes('already exists') || lower.includes('user already')) {
    return 'user_already_exists';
  }
  if (lower.includes('not found')) {
    return 'user_not_found';
  }
  if (lower.includes('verify') && lower.includes('email')) {
    return 'email_not_verified';
  }

  return 'unknown';
}
