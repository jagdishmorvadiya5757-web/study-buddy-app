

# Full App Health Check — Findings & Fix Plan

I went through your app end-to-end (web preview, RLS rules, Auth flow, analytics tracking, Android build config). Here is the complete picture and what should be fixed.

## What is working well

- **Web app loads and runs** — no runtime errors, no console errors.
- **Google sign-in works** on the Lovable preview (your session token shows you are logged in via Google as `jagdishmorvadiya5757@gmail.com`, role = `admin`).
- **Database queries succeed**: branches, resources, ad settings, user roles all return 200.
- **Routing & SPA fallback** are correctly configured for Lovable, GitHub Pages, and Capacitor.
- **Android build config** is aligned with JDK 17 (`capacitor.build.gradle` → `VERSION_17`, AdMob pinned to `6.2.0`).
- **Auth screen** correctly hides Google button on non-Lovable hosts (GitHub Pages).

## Issues found

### 1. Analytics 401 errors before login (minor, but noisy)
Network logs show two failing requests on every fresh visit:
- `POST /user_sessions` → 401 RLS violation (anonymous user)
- `POST /app_installs` → 401 RLS violation (anonymous user)

**Cause**: `useSessionTracking` and `useInstallTracking` run inside `App.tsx` for *all* visitors, including unauthenticated ones. RLS policies require an authenticated user.

**Fix**: Skip the insert when `user` is null in `useSessionTracking`, and only run `useInstallTracking` after a user session exists (or relax the RLS to allow anon inserts if you want to track pre-login visits — not recommended).

### 2. Google OAuth button hidden on Android APK
`isLovableHost` checks for `lovable.app` / `localhost` only. Inside the Capacitor APK the host is `localhost` for the WebView, so it should work — but on a physical install the scheme is `https://localhost` or `capacitor://localhost`. Need to also allow `Capacitor.isNativePlatform()` as a valid host so the Google button appears in the Android app.

### 3. Google OAuth deep-link return into the Android app
Even if the button appears in the APK, the OAuth redirect returns to a browser tab, not back into the app. For native, it needs the Capacitor Browser/AppLauncher plugin and a deep-link intent filter (`com.vgec.studybuddy://callback`) registered in `AndroidManifest.xml` plus in the Supabase auth redirect URLs.

### 4. Stale `bun.lock` mention from prior turn
No code change needed — already aligned.

## Plan of changes

1. **`src/hooks/useSessionTracking.ts`**
   - In `useSessionTracking`: only call `startSession` when `user?.id` exists.
   - In `useInstallTracking`: bail out early when the user is not signed in (or until first authenticated session); track only once authenticated.

2. **`src/pages/Auth.tsx`**
   - Replace `isLovableHost` check with `isLovableHost || Capacitor.isNativePlatform()` so Google sign-in button shows in the Android APK.

3. **(Optional, deeper) Native Google OAuth deep link**
   - Add `<intent-filter>` for scheme `com.vgec.studybuddy` in `AndroidManifest.xml`.
   - In `handleGoogleSignIn`, when on native, set `redirect_uri` to `com.vgec.studybuddy://auth/callback` and add it to the Supabase Auth allowed redirect URLs.
   - I will implement this only if you confirm — it requires you to also add the redirect URL in Lovable Cloud → Auth settings.

4. **No DB migrations needed** — the RLS policies are correct; the bug is the client calling them while unauthenticated.

## Android APK build status (recap, no changes needed)
- JDK 17 ✅
- AdMob plugin pinned to `6.2.0` ✅
- `capacitor.build.gradle` → `VERSION_17` ✅
- Build flow: `npm run build` → `npx cap sync android` → `npx cap open android` → Build → Build APK(s).

## Confirm before I implement

Reply with which of these to do:
- **A**: Fix items 1 + 2 only (stop the 401 noise + show Google button in APK). Quick, safe.
- **B**: A + item 3 (full native Google OAuth deep-link wiring; requires you to add the redirect URL in Cloud Auth settings).
- **C**: Just A, plus build a fresh debug APK guide tailored to your machine.

