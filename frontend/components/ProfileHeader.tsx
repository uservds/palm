// components/ProfileHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Общий тип для реального пользователя (/api/auth/me) и настроек профиля.
// isLeftHanded пока не хранится на backend — только локальное состояние формы.
export type ProfileUser = {
  name: string;
  email: string;
  createdAt: string;
  avatarUrl?: string;
  isLeftHanded: boolean | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileHeader({ user }: { user: ProfileUser }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-content-border bg-surface p-6">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.avatarUrl} alt={user.name} />
        <AvatarFallback className="bg-accent-soft text-primary font-medium">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 className="text-xl font-semibold text-content-main">{user.name}</h1>
        <p className="text-sm text-content-muted">{user.email}</p>
        <p className="mt-1 text-xs text-content-muted">
          На Палмис AI с {formatDate(user.createdAt)}
        </p>
      </div>
    </div>
  );
}
