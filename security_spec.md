# Firestore Security Specification — 云上梵境

## 1. Data Invariants
1. **PII Isolation**: User profile documents (`/users/{userId}`) contain user email and personal practice records; only the owning user (`request.auth.uid == userId`) or the verified owner admin (`9362056x@gmail.com`) may read or write them.
2. **No Self-Assigned Admin**: During profile creation, a regular user cannot set `role: "admin"` unless their verified token matches the bootstrapped owner email (`9362056x@gmail.com`) or an existing `/admins/{uid}` document. Regular users cannot change `role`, `uid`, or `createdAt` on update.
3. **Email Verification Gate**: All authenticated write operations require `request.auth.token.email_verified == true`.
4. **Master Gate on Subcollections**: `/users/{userId}/chantingLogs/{logId}` requires the parent `/users/{userId}` document to exist and restricts access to the owning `userId` or admin.
5. **Public Content Isolation**: `/parks`, `/buildings`, `/scriptures`, and `/gatherings` are publicly readable (`get`, `list`), while all mutations (`create`, `update`, `delete`) are strictly restricted to the verified admin.
6. **Strict Schema & Size Bounds**: Every string, array, and ID is validated for type, length, allowed keys (`hasAll` + `hasOnly`), and server timestamps (`request.time`).

## 2. "Dirty Dozen" Attack Payloads (All Must Return `PERMISSION_DENIED`)
1. Unauthenticated read on `/users/u1`
2. Authenticated user `u2` reading `/users/u1` (cross-user PII read)
3. Authenticated user `u1` creating `/users/u1` with `role: "admin"` (privilege escalation)
4. Authenticated user `u1` updating `/users/u1` to set `role: "admin"` (shadow role mutation)
5. Authenticated user `u1` updating `/users/u1` with an extra shadow field `isVip: true`
6. Authenticated user `u1` with `email_verified: false` writing `/users/u1`
7. Authenticated user `u1` creating `/users/u1` with `uid: "u2"` (identity spoofing)
8. Authenticated user `u1` creating `/users/u1/chantingLogs/l1` when `/users/u1` does not exist (orphaned subcollection)
9. Authenticated user `u1` creating `/users/u1` with `joinedGatherings` array > 20 items (DoW array poisoning)
10. Non-admin user creating a document in `/buildings/evil-hall`
11. Non-admin user updating `/scriptures/heart`
12. Any user creating `/users/invalid$id` (ID poisoning)
