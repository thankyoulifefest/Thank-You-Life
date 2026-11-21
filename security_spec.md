# Security Specification — Thank You Life Fest 2026

## 1. Data Invariants
1. **PII Isolation**: `/registrations/{registrationId}` contains PII (`name`, `phone`, `email`, `notes`). Public visitors may **create** a new registration record, but **only verified administrators** (`isAdmin()`) may `get`, `list`, `update`, or `delete` registrations.
2. **Initial State Integrity on Public Create**: Any publicly submitted registration MUST start with `paymentStatus in ['pending', 'not_applicable']`, `checkInStatus == 'registered'`, `adminNotes == ''`, `verifiedBy == ''`, and `createdAt == request.time && updatedAt == request.time`. A public user cannot self-verify a donation (`paymentStatus: 'verified'`).
3. **Admin Privilege Hardening**: Only verified Google accounts (`request.auth.token.email_verified == true`) matching the bootstrapped organizer email (`thankyoulifefest@gmail.com`) or listed in `/admins/{request.auth.uid}` qualify as `isAdmin()`. Only `isBootstrappedAdmin()` can add or remove entries in `/admins/{adminUid}`.
4. **Immutable Audit Fields**: `createdAt` is immutable on update. All string fields enforce explicit `.size()` bounds; `registrationId` and `adminUid` enforce `^[a-zA-Z0-9_\-]+$` (`<= 128` chars).
5. **Non-PII Campaign Totals**: `/campaignSettings/{settingId}` stores only aggregate numeric counters (`goalVnd`, `offlineVerifiedVnd`, `offlineDonorCount`) with no PII, readable publicly and writable only by `isAdmin()`.

## 2. Dirty Dozen Attack Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated List PII**: `list /registrations` with `auth == null` → DENIED.
2. **Non-Admin Authenticated List PII**: `list /registrations` with verified user `random@gmail.com` → DENIED.
3. **Unverified Admin Email Spoof**: `list /registrations` with `email: 'thankyoulifefest@gmail.com', email_verified: false` → DENIED.
4. **Self-Verified Donation on Create**: `create /registrations/reg1` with `paymentStatus: 'verified'` → DENIED.
5. **Shadow Field Injection on Create**: `create /registrations/reg1` with extra key `isAdmin: true` → DENIED.
6. **Shadow Update Injection by Admin**: `update /registrations/reg1` with extra unknown key `hacked: 1` → DENIED.
7. **ID Poisoning**: `create /registrations/../../admins/evil` or 200-char ID → DENIED.
8. **Backdated Timestamp Spoofing**: `create /registrations/reg1` with `createdAt: Timestamp(2020-01-01)` instead of `request.time` → DENIED.
9. **Oversized Payload Denial-of-Wallet**: `create /registrations/reg1` with 10,000-char `notes` (> 1000 limit) → DENIED.
10. **Negative Donation Amount**: `create /registrations/reg1` with `contributionAmount: -500000` → DENIED.
11. **Privilege Escalation in `/admins`**: Non-bootstrapped user writing `/admins/{theirUid}` → DENIED.
12. **Public Tampering with Campaign Settings**: Non-admin updating `/campaignSettings/tylf2026` → DENIED.
