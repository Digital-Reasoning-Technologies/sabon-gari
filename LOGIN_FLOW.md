# Login Flow: Username/Password to Dashboard

This document describes how the Kudan landing page handles login (email + password) and redirects the user to the dashboard.

---

## 1. Form Input: Email + Password (not username)

The login form collects **email** and **password**. There is no separate "username" field; the form uses **email** as the identifier (see `app/(dashboard)/login/page.tsx`).

---

## 2. Login Is Handled by a Server Action (not the API route)

When the user submits the form:

- The form’s `action` is the **server action** `loginAction` from `./actions.ts`.
- The page does **not** call `POST /api/auth/login`. That API route exists for other use (e.g. API clients).

So the logic that validates credentials and sends the user to the dashboard lives in the **server action**.

---

## 3. Server Action Logic (`app/(dashboard)/login/actions.ts`)

Flow:

1. **Read form data**  
   - `email` (trimmed, lowercased), `password`, and optional `next` (redirect path).

2. **Validate**  
   - Return error state if email or password is missing.

3. **Database + auth**  
   - Connect to DB, find user by `email`.  
   - If no user → return `{ ok: false, message: 'Invalid email or password' }`.  
   - Verify password with `verifyPassword(password, user.passwordHash)`; if it fails → same error.  
   - If role is not `admin` or `superadmin` → return `{ ok: false, message: 'Access denied' }`.

4. **Session cookie**  
   - Build JWT with `signToken({ sub: user._id, role: user.role })`.  
   - Set httpOnly cookie `kudan_token` with that token (path `/`, secure in production, etc.).

5. **Redirect to dashboard**  
   - Compute redirect path: use `next` **only if** it starts with `/admin`, otherwise use `/admin`.  
   - Append `?login=success` to that path.  
   - Call Next.js **`redirect(redirectPath)`**.

So **navigation to the dashboard is done by a server-side redirect**: the server action sets the cookie and then returns a redirect response; the browser follows it and lands on `/admin` (or the allowed `next` path).

---

## 4. How the Redirect Path Is Chosen

- **On the page**  
  - `nextPath = searchParams.get('next') || '/admin'`.  
  - A hidden input in the form sends this: `<input type="hidden" name="next" value={nextPath} />`.

- **In the action**  
  - `redirectPath = (nextPath && nextPath.startsWith('/admin')) ? nextPath : '/admin'`, then `?login=success` is appended.  
  - So the user is always sent to `/admin` or another path under `/admin`; any other `next` is ignored and replaced with `/admin`.

---

## 5. Summary Table

| Step | What happens |
|------|------------------------------|
| Input | User enters **email** and **password** (and optionally `?next=...` in the URL). |
| Submit | Form posts to the **server action** `loginAction`. |
| Validation | Action checks email/password present, finds user by email, verifies password, checks role. |
| Session | On success, JWT is stored in httpOnly cookie `kudan_token`. |
| Navigate | Server calls **`redirect(redirectPath)`** (e.g. `/admin?login=success`). Browser follows that response and lands on the dashboard. |

---

## 6. Relevant Files

- **Login page:** `app/(dashboard)/login/page.tsx` — form, client checks (e.g. already logged in), toast for errors.
- **Login action:** `app/(dashboard)/login/actions.ts` — validation, DB, password check, cookie, redirect.
- **Auth API (optional):** `app/api/auth/login/route.ts` — JSON login for API clients; not used by the login page.

The **navigation to the dashboard** is: validate in the server action → set the auth cookie → call **`redirect(...)`** to `/admin` (or a safe `next` path). The client does not call `router.push` after login; the server sends a redirect and the browser follows it.
