// components/ProfileSettingsForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProfileUser } from "@/components/ProfileHeader";

export default function ProfileSettingsForm({ user }: { user: ProfileUser }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isLeftHanded, setIsLeftHanded] = useState<boolean | null>(user.isLeftHanded);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    // TODO (блок Profile/Auth, отдельно от Payment): PATCH /api/profile —
    // сейчас нет ни эндпоинта, ни поля isLeftHanded в Prisma-схеме User.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-content-border bg-surface p-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-content-main">Имя</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-content-main">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-content-main">
          Ведущая рука
        </label>
        <p className="text-xs text-content-muted">
          Понадобится для точного определения активной/пассивной руки при сканировании.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isLeftHanded === false ? "default" : "outline"}
            onClick={() => setIsLeftHanded(false)}
          >
            Правша
          </Button>
          <Button
            type="button"
            variant={isLeftHanded === true ? "default" : "outline"}
            onClick={() => setIsLeftHanded(true)}
          >
            Левша
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave}>Сохранить</Button>
        {saved && <span className="text-sm text-accent-DEFAULT">Сохранено ✓</span>}
      </div>
    </div>
  );
}
