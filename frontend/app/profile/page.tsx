// app/profile/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileHeader from "@/components/ProfileHeader";
import ProfileArchive from "@/components/ProfileArchive";
import ProfileSettingsForm from "@/components/ProfileSettingsForm";
import ProfileSubscription from "@/components/ProfileSubscription";
import { mockUser, mockSubscription, mockArchive } from "@/lib/mockProfile";

export default function ProfilePage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <ProfileHeader user={mockUser} />

      <Tabs defaultValue="archive" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="archive">Архив разборов</TabsTrigger>
          <TabsTrigger value="settings">Данные</TabsTrigger>
          <TabsTrigger value="subscription">Подписка</TabsTrigger>
        </TabsList>

        <TabsContent value="archive" className="mt-4">
          <ProfileArchive reports={mockArchive} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <ProfileSettingsForm user={mockUser} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-4">
          <ProfileSubscription subscription={mockSubscription} />
        </TabsContent>
      </Tabs>
    </main>
  );
}