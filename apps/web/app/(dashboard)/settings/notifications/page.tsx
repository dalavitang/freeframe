"use client";

import * as React from "react";
import { Bell, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const commentNotificationIds = [
  "general_comments",
  "comment_replies",
  "mentions",
] as const;

const assetNotificationIds = [
  "other_uploads",
  "status_updates",
  "assigned_to_you",
] as const;

type NotificationTitleKey =
  | "generalComments"
  | "commentReplies"
  | "mentions"
  | "otherUploads"
  | "statusUpdates"
  | "assignedToYou";

type NotificationDescriptionKey =
  | "generalCommentsDesc"
  | "commentRepliesDesc"
  | "mentionsDesc"
  | "otherUploadsDesc"
  | "statusUpdatesDesc"
  | "assignedToYouDesc";

const titleKeys: Record<string, NotificationTitleKey> = {
  general_comments: "generalComments",
  comment_replies: "commentReplies",
  mentions: "mentions",
  other_uploads: "otherUploads",
  status_updates: "statusUpdates",
  assigned_to_you: "assignedToYou",
};

const descriptionKeys: Record<string, NotificationDescriptionKey> = {
  general_comments: "generalCommentsDesc",
  comment_replies: "commentRepliesDesc",
  mentions: "mentionsDesc",
  other_uploads: "otherUploadsDesc",
  status_updates: "statusUpdatesDesc",
  assigned_to_you: "assignedToYouDesc",
};

interface NotifPrefs {
  email_frequency: string;
  general_comments: string;
  comment_replies: string;
  mentions: string;
  other_uploads: string;
  status_updates: string;
  assigned_to_you: string;
  [key: string]: string;
}

const defaults: NotifPrefs = {
  email_frequency: "instant",
  general_comments: "all_on",
  comment_replies: "all_on",
  mentions: "all_on",
  other_uploads: "all_on",
  status_updates: "all_on",
  assigned_to_you: "all_on",
};

export default function NotificationsPage() {
  const t = useTranslations("notificationSettings");
  const tl = useTranslations("layout");
  const { user } = useAuthStore();
  const [prefs, setPrefs] = React.useState<NotifPrefs>(defaults);
  const [saving, setSaving] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  // Load from user preferences
  React.useEffect(() => {
    if (!user?.preferences) return;
    const notif = (user.preferences.notifications ?? {}) as Record<
      string,
      unknown
    >;
    const merged: NotifPrefs = { ...defaults };
    Object.entries(notif).forEach(([key, value]) => {
      if (typeof value === "string") {
        merged[key] = value;
      }
    });
    setPrefs(merged);
    setLoaded(true);
  }, [user?.preferences]);

  async function updatePref(key: string, value: string) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.patch("/auth/me/preferences", { notifications: updated });
    } catch {}
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted">
          <Bell className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-text-primary">
            {tl("notifications")}
          </h1>
          <p className="text-sm text-text-secondary">
            {t("subtitle")}
          </p>
        </div>
        {saving && (
          <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />
        )}
      </div>

      {/* Email Frequency */}
      <section className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-bg-secondary">
          <Bell className="h-5 w-5 text-text-secondary mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-text-primary">
              {t("emailFrequency")}
            </h3>
            <p className="text-xs text-text-tertiary mt-1">
              {t("emailFrequencyHint")}
            </p>
            <select
              value={prefs.email_frequency}
              onChange={(e) => updatePref("email_frequency", e.target.value)}
              className="mt-3 w-40 rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="instant">{t("frequencyInstant")}</option>
              <option value="15min">{t("frequency15min")}</option>
              <option value="hourly">{t("frequencyHourly")}</option>
              <option value="daily">{t("frequencyDaily")}</option>
              <option value="never">{t("frequencyNever")}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">{t("comments")}</h2>
        <div className="space-y-3">
          {commentNotificationIds.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-secondary"
            >
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t(titleKeys[id])}
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {t(descriptionKeys[id])}
                </p>
              </div>
              <select
                value={prefs[id] || "all_on"}
                onChange={(e) => updatePref(id, e.target.value)}
                className="rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all_on">{t("allOn")}</option>
                <option value="in_app">{t("inAppOnly")}</option>
                <option value="all_off">{t("allOff")}</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Assets Section */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">{t("assets")}</h2>
        <div className="space-y-3">
          {assetNotificationIds.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-secondary"
            >
              <div>
                <h3 className="text-sm font-medium text-text-primary">
                  {t(titleKeys[id])}
                </h3>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {t(descriptionKeys[id])}
                </p>
              </div>
              <select
                value={prefs[id] || "all_on"}
                onChange={(e) => updatePref(id, e.target.value)}
                className="rounded-md border border-border bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all_on">{t("allOn")}</option>
                <option value="in_app">{t("inAppOnly")}</option>
                <option value="all_off">{t("allOff")}</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      <div className="p-4 rounded-lg bg-bg-tertiary border border-border">
        <p className="text-xs text-text-secondary">
          {t("adminEmailsNote")}
        </p>
      </div>
    </div>
  );
}