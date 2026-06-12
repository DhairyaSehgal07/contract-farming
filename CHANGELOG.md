# Changelog

## [0.2.1] - 2026-06-12

### Features

- Add RBAC permissions section with role matrix, users, and sessions tabs
- Add user management: create, edit, delete, impersonate, ban, and role controls
- Add session revoke and clear-history actions for managing director admins
- Add permission-gated user management UI via `sessionCanManageUsers`

### Enhancements

- Migrate permissions users, sessions, and role matrix to shared `DataTable`
- Add optional `showPagination` prop to `DataTable`
- Pass request headers on sign-in for correct session creation

### Tests

- Add session server action tests
- Update sign-in action tests to assert headers are forwarded

## [0.2.0] - 2026-06-10

### Features

- Add TanStack Query with SSR-safe `getQueryClient()` and `AppProviders` wrapper
- Add shared `DataTable` component built on TanStack Table
- Add Zustand and TanStack Table dependencies for upcoming feature work
- Add Cursor rules for Next.js 16, project stack, shadcn/ui, TanStack Query/Form/Table, and Zustand

### Enhancements

- Refine app topbar layout and heading typography

## [0.1.0] - 2026-06-03

### Features

- Initial stable release with Better Auth, dashboard shell, and Prisma setup
