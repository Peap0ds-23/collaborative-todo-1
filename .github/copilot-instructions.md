# Copilot / AI Agent Instructions ✅

Purpose: Short, actionable guidance for AI coding agents to be productive in this Next.js + Supabase todo app.

## Big picture
- This is a Next.js 14 app using the App Router (app/). UI is split into server components by default; client components are explicitly declared using `"use client"`.
- Auth and persistence use Supabase (anon key + client/server helpers in `utils/supabase`). Middleware syncs sessions via Supabase server client.

## Key files & entry points (quick reference)
- app/page.tsx — root page; redirects to `/signin` if no user (example: `createClient()` + `supabase.auth.getUser()` + `redirect()`).
- utils/supabase/{client.ts,server.ts,middleware.ts} — canonical wrappers for browser/server Supabase clients and cookie handling.
- middleware.ts — calls `updateSession(request)` and keeps Supabase session cookies fresh (see matcher pattern).
- actions/ — host server actions grouped by domain (`auth`, `todos`). Actions use Next.js Server Actions with `"use server"`.
- components/todos/* — example of server component fetching `todos` from Supabase and rendering client controls.

## Repository conventions & patterns
- Server vs Client
  - Server components (default) fetch data directly via `utils/supabase/server.ts` (e.g., `const supabase = createClient(); const { data } = await supabase.from('todos').select('*')`).
  - Client components must be marked with `"use client"` and should call server actions (exported from `actions/`) for mutations.
- Server Actions
  - Put mutation logic in `actions/<domain>/` files and annotate with `"use server"` at top of the file (see `actions/todos/actions.tsx`).
  - Use `revalidatePath("/")` after data mutations to update cached server-rendered pages.
- Auth
  - Use `createClient()` (server version) then `await supabase.auth.getUser()` to check the current user inside server components or actions.
  - Sign-up / sign-in / sign-out follow `actions/auth/actions.ts` examples. OTP confirmation is handled in `app/api/auth/confirm/route.ts`.
- Cookies & Session
  - Middleware (`middleware.ts`) invokes `utils/supabase/middleware.ts::updateSession` which uses the request cookie store and sets response cookies when Supabase refreshes sessions. Don’t remove this unless you understand Next middleware cookie semantics.

## Dev / build / test workflows
- Start dev server: `npm run dev` (also works with `yarn pnpm bun dev`).
- Build: `npm run build`; start production server: `npm run start`.
- Lint: `npm run lint` (no test scripts are present in repo).
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - These are used both by server and browser client helpers in `utils/supabase`.

## Integration & external dependencies
- Supabase (packages: `@supabase/ssr`, `@supabase/supabase-js`) — used for auth and Postgres operations on `todos` table.
- Tailwind + small component libraries (Radix UI). UI components live under `components/ui/`.

## When you change data-models or flows
- Update `actions/*` to encapsulate mutation logic. Always call `revalidatePath()` for pages that rely on server rendering cache.
- If changing auth/session behavior, update `utils/supabase/middleware.ts` and `middleware.ts` matcher pattern accordingly.

## Examples (copy/paste patterns)
- Server guard (redirect when no user):
```ts
const supabase = createClient();
const { data, error } = await supabase.auth.getUser();
if (error || !data?.user) redirect('/signin');
```

- Mutation action pattern (add todo):
```ts
export async function addTodo(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('todos').insert([{ user_id: user?.id, task: formData.get('task') }]);
  revalidatePath('/');
}
```

## Do NOT assume / common pitfalls
- Do not expect a service-role key in env; this project uses the anon key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Middleware cookie operations are sensitive: `request.cookies.set` can throw when called from server components — follow the patterns in `utils/supabase/server.ts` and `utils/supabase/middleware.ts`.
- There are no tests; be explicit when adding them and document new scripts in `package.json`.

---

If anything is unclear or you want more detail in any section (examples, more files referenced, or a short troubleshooting checklist for common Supabase/Next issues), tell me which area and I’ll iterate. 🔧