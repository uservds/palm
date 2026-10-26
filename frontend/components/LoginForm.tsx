// components/LoginForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { registerUser, loginUser } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Заполните email и пароль");
      return;
    }
    if (mode === "register" && !name) {
      setError("Укажите имя");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await registerUser({ email, password, name });
      } else {
        await loginUser({ email, password });
      }
      router.push("/profile");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось выполнить запрос. Попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-content-border bg-surface p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-content-main">
        {mode === "login" ? "Вход" : "Регистрация"}
      </h1>
      <p className="mt-1 text-sm text-content-muted">
        {mode === "login"
          ? "Войдите, чтобы увидеть свои разборы"
          : "Создайте аккаунт за 30 секунд"}
      </p>

      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as "login" | "register");
          setError(null);
        }}
        className="mt-5"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Вход</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-0" />
        <TabsContent value="register" className="mt-0" />
      </Tabs>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-content-main">Имя</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Анна"
              autoComplete="name"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-content-main">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-content-main">Пароль</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading
            ? "Подождите…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-content-border" />
        <span className="text-xs text-content-muted">или</span>
        <div className="h-px flex-1 bg-content-border" />
      </div>

      <GoogleAuthButton />

      <p className="mt-4 text-center text-xs text-content-muted">
        Продолжая, вы соглашаетесь с{" "}
        <a href="/privacy" className="underline hover:text-content-main">
          условиями использования
        </a>
      </p>
    </div>
  );
}
