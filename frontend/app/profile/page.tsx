// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileArchive from "@/components/ProfileArchive";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import ProfileSubscription from "@/components/ProfileSubscription";
import { fetchCurrentUser } from "@/lib/auth";
import { mockSubscription, mockArchive } from "@/lib/mockProfile";
import type { ProfileUser } from "@/components/ProfileHeader";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser().then((authUser) => {
      if (cancelled) return;
      if (!authUser) {
        router.push("/login?redirect=/profile");
        return;
      }
      setUser({
        name: authUser.name,
        email: authUser.email,
        createdAt: authUser.createdAt,
        isLeftHanded: null, // TODO: поле ещё не хранится на backend
      });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !user) {
    return (
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <p className="text-sm text-content-muted">Загружаем профиль…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <ProfileHeader user={user} />

      <Tabs defaultValue="archive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="archive">Архив разборов</TabsTrigger>
          <TabsTrigger value="settings">Данные</TabsTrigger>
          <TabsTrigger value="subscription">Подписка</TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="mt-4">
          {/* TODO: архив пока на моках — подключается в блоке Compatibility/Report */}
          <ProfileArchive reports={mockArchive} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ProfileSettingsForm user={user} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-4">
          {/* TODO: подписка пока на моках — подключается в блоке Subscription */}
          <ProfileSubscription subscription={mockSubscription} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
