# Changelog

## [0.2.4] - 2026-06-16

### Features

- Add dispatch module with list view, multi-step create flow, and requisition assignment
- Add locations master data with CRUD and master navigation entry
- Add dispatch RBAC permissions and nav entry gated by `dispatch:read` / `dispatch:write`
- Track requisition fulfillment with `initialQuantity`, `fulfilledQuantity`, and `approvedDeliveryDate`

### Enhancements

- Move station city and state fields from localities to stations
- Simplify locality forms and tables to name and station only
- Extend requisition columns and form for fulfillment and delivery date fields
- Add `actionHref` support to master section headers for link-based actions
- Improve drawer and requisition layout overflow handling

### Database

- Add `Location`, `Dispatch`, `DispatchRequisition`, and `DispatchRequisitionSizeLine` models
- Add requisition fulfillment tracking and delivery date migrations

## [0.2.2] - 2026-06-14

### Features

- Add requisition approve and reject workflow with confirmation dialogs
- Add `approve` permission action to the RBAC catalog and role matrix
- Gate approve/reject UI and server actions by `requisition:approve` permission

### Enhancements

- Show requisition status badges with clearer labels (Pending, Approved, Rejected)
- Prevent self-approval except for the Managing Director role
- Seed Programme Manager and Accounts Settlements Manager with requisition approve grants

### Tests

- Add approve/reject server action tests
- Add authorization and role matrix tests for the approve permission

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
