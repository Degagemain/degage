# Authentication

Authentication is implemented using [better-auth](https://www.better-auth.com/) with pre-built UI components from [@daveyplate/better-auth-ui](https://github.com/daveyplate/better-auth-ui).

## Environment Variables

| Variable              | Description                                                                                                                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ADMIN_EMAIL_DOMAINS` | Comma-separated list of email domains. Users whose **verified** email domain is in this list are automatically assigned the `admin` role (on sign-up if the email is already verified, e.g. OAuth, or when they verify their email). Example: `example.com,company.org`. |
| `RESEND_API_KEY`      | API key for [Resend](https://resend.com) used to send verification and password-reset emails. If unset, those emails are not sent (e.g. local dev).                                                                                                                      |
| `RESEND_FROM`         | Sender address for transactional emails. Default: `Neurotic <onboarding@resend.dev>`. Use your verified domain in production, e.g. `App <noreply@yourdomain.com>`.                                                                                                       |

## Email verification and password reset

Verification and password-reset emails are sent via [Resend](https://resend.com). Configure `RESEND_API_KEY` (and optionally `RESEND_FROM` for a custom sender).

- **Email verification**: Sent on sign-up (`sendOnSignUp`) and on sign-in when the user is not yet verified (`sendOnSignIn`). Login with email/password requires a verified email (`requireEmailVerification`). After the user clicks the verification link, they are signed in automatically (`autoSignInAfterVerification`).
- **Password reset**: Triggered from the forgot-password flow; the user receives a link to set a new password.

## Plugins

- **Admin** — Role-based access control and user management ([docs](https://www.better-auth.com/docs/plugins/admin))

## Supported Providers

- Email/password
- GitHub OAuth

## Routes

### Auth (`/app/auth/...`)

- `/app/auth/sign-in` — Login
- `/app/auth/sign-up` — Registration
- `/app/auth/forgot-password` — Password reset request
- `/app/auth/reset-password` — Password reset form

### Account (`/app/account/...`)

- `/app/account/settings` — Account settings
- `/app/account/profile` — Profile management

## Usage

### Check Session

```typescript
import { authClient } from '@/app/lib/auth';

const { data: session } = authClient.useSession();

if (session?.user) {
  // User is authenticated
}
```

### Protect a Route

```typescript
import { authClient } from '@/app/lib/auth';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && !session) {
    redirect('/app/auth/sign-in');
  }

  return <div>Protected content</div>;
}
```

## Roles

### Frontend: Check User Role

```typescript
import { useRole, useIsAdmin } from '@/app/lib/role';
import { Role } from '@/domain/role.model';

export default function Dashboard() {
  const { isAdmin, hasRole, isPending } = useRole();

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      {isAdmin && <AdminPanel />}
      {hasRole(Role.USER) && <UserContent />}
    </div>
  );
}

// Or use the convenience hook
function AdminButton() {
  const { isAdmin } = useIsAdmin();
  if (!isAdmin) return null;
  return <button>Admin Action</button>;
}
```

### Backend: Protect Actions

```typescript
import { auth } from '@/auth';
import { requireAdmin, isAdmin } from '@/domain/role.utils';

// In an API route or server action
export async function adminAction() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Throws if not admin
  requireAdmin(session?.user);

  // Or check without throwing
  if (!isAdmin(session?.user)) {
    return { error: 'Unauthorized' };
  }

  // Admin-only logic here
}
```

### Available Utilities

**Frontend (`@/app/lib/role`):**

- `useRole()` — Returns `{ role, isAdmin, isBanned, isPending, hasRole(), hasAnyRole() }`
- `useIsAdmin()` — Returns `{ isAdmin, isPending }`

**Backend (`@/domain/role.utils`):**

- `hasRole(user, role)` — Check if user has a specific role
- `isAdmin(user)` — Check if user is admin
- `hasAnyRole(user, roles)` — Check if user has any of the roles
- `requireRole(user, role)` — Throws if user doesn't have the role
- `requireAdmin(user)` — Throws if user isn't admin
