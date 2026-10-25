// components/GoogleAuthButton.tsx
"use client";

import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.76-2.11-6.7-4.94H1.3v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.31a7.2 7.2 0 0 1 0-4.62v-3.1H1.3a12 12 0 0 0 0 10.82l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.3 6.59l4 3.1C6.24 6.86 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function GoogleAuthButton() {
  function handleGoogleAuth() {
    // TODO (Приоритет 4): редирект на /api/auth/google
    console.log("Google OAuth — заглушка, подключится в Приоритете 4");
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2"
      onClick={handleGoogleAuth}
    >
      <GoogleIcon />
      Продолжить с Google
    </Button>
  );
}