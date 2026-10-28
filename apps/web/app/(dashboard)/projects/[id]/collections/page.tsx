"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Plus,
  ChevronRight,
  Filter,
  X,
  Trash2,
  Share2,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CollectionCard } from "@/components/projects/collection-card";
import { EmptyState } from "@/components/shared/empty-state";
import type {
  Collection,
  CollectionShare,
  Project,
  SharePermission,
} from "@/types";

// ─── Filter Rule Builder ───────────────────────────────────────────────────────

type FilterOperator =
  | "equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "in";

interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

function buildFilterJson(rules: FilterRule[]): Record<string, unknown> {
  if (rules.length === 0) return {};
  return {
    and: rules.map((r) => ({
      field: r.field,
      operator: r.operator,
      value:
        r.operator === "in" ? r.value.split(",").map((v) => v.trim()) : r.value,
    })),
  };
}

function FilterRuleRow({
  rule,
  onChange,
  onRemove,
}: {
  rule: FilterRule;
  onChange: (patch: Partial<FilterRule>) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("collectionsPage");
  const operators: { value: FilterOperator; label: string }[] = [
    { value: "equals", label: t("opEquals") },
    { value: "contains", label: t("opContains") },
    { value: "greater_than", label: t("opGreaterThan") },
    { value: "less_than", label: t("opLessThan") },
    { value: "in", label: t("opIn") },
  ];

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder={t("fieldNamePlaceholder")}
        value={rule.field}
        onChange={(e) => onChange({ field: e.target.value })}
        className="flex h-8 w-28 rounded-md border border-border bg-bg-secondary px-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus"
      />
      <select
        value={rule.operator}
        onChange={(e) =>
          onChange({ operator: e.target.value as FilterOperator })
        }
        className="flex h-8 rounded-md border border-border bg-bg-secondary px-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
      >
        {operators.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder={t("valuePlaceholder")}
        value={rule.value}
        onChange={(e) => onChange({ value: e.target.value })}
        className="flex h-8 flex-1 rounded-md border border-border bg-bg-secondary px-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus"
      />
      <button
        type="button"
        onClick={onRemove}
        className="text-text-tertiary hover:text-status-error transition-colors"
        aria-label={t("removeRule")}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Collection Share Dialog ───────────────────────────────────────────────────

interface CollectionShareDialogProps {
  collection: Collection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CollectionShareDialog({
  collection,
  open,
  onOpenChange,
}: CollectionShareDialogProps) {
  const t = useTranslations("collectionsPage");
  const tc = useTranslations("common");
  const ts = useTranslations("shareDialog");
  const ts2 = useTranslations("shareLinks");
  const locale = useLocale();
  const [permission, setPermission] = React.useState<SharePermission>("view");
  const [expiresAt, setExpiresAt] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const [shares, setShares] = React.useState<CollectionShare[]>([]);
  const [loadingShares, setLoadingShares] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoadingShares(true);
    api
      .get<{ shares: CollectionShare[] }>(
        `/collections/${collection.id}/shares`,
      )
      .then((res) => setShares(res.shares ?? []))
      .catch(() => setShares([]))
      .finally(() => setLoadingShares(false));
  }, [open, collection.id]);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setGeneratedUrl(null);
    try {
      const body: Record<string, unknown> = { permission };
      if (expiresAt) body.expires_at = new Date(expiresAt).toISOString();
      const res = await api.post<{ share: CollectionShare }>(
        `/collections/${collection.id}/share`,
        body,
      );
      const newShare = res.share;
      const url = `${window.location.origin}${withBasePath(`/share/collection/${newShare.token}`)}`;
      setGeneratedUrl(url);
      setShares((prev) => [...prev, newShare]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("createFailed"),
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] rounded-xl border border-border bg-bg-secondary p-6 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <Dialog.Close className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <Dialog.Title className="text-sm font-semibold text-text-primary">
            {t("shareTitle")}
          </Dialog.Title>
          <Dialog.Description className="mt-0.5 text-xs text-text-tertiary">
            {t("shareDescription", { name: collection.name })}
          </Dialog.Description>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  {ts("permission")}
                </label>
                <select
                  value={permission}
                  onChange={(e) =>
                    setPermission(e.target.value as SharePermission)
                  }
                  className="flex h-9 rounded-md border border-border bg-bg-tertiary px-3 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                >
                  <option value="view">{t("permissionView")}</option>
                  <option value="comment">{t("permissionComment")}</option>
                  <option value="approve">{t("permissionApprove")}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  {ts("expiryOptional")}
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="flex h-9 rounded-md border border-border bg-bg-tertiary px-3 text-sm text-text-primary focus:outline-none focus:border-border-focus"
                />
              </div>
            </div>

            {error && <p className="text-xs text-status-error">{error}</p>}

            <Button
              size="sm"
              onClick={handleGenerate}
              loading={generating}
              className="w-full"
            >
              <Share2 className="h-4 w-4" />
              {ts("generateLink")}
            </Button>

            {generatedUrl && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-bg-tertiary px-3 py-2">
                <span className="flex-1 truncate font-mono text-xs text-text-primary">
                  {generatedUrl}
                </span>
                <button
                  onClick={() => handleCopy(generatedUrl)}
                  className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors shrink-0"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-status-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? tc("copied") : tc("copy")}
                </button>
              </div>
            )}

            {/* Existing shares */}
            {(loadingShares || shares.length > 0) && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-text-secondary">
                  {ts("existingLinks")}
                </p>
                {loadingShares ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">
                      {tc("loading")}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {shares.map((share) => {
                      const url = `${typeof window !== "undefined" ? window.location.origin : ""}${withBasePath(`/share/collection/${share.token}`)}`;
                      return (
                        <div
                          key={share.id}
                          className="flex items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 py-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-text-primary capitalize">
                              {share.permission}
                            </span>
                            {share.expires_at && (
                              <span className="ml-2 text-text-tertiary">
                                {t("expires", {
                                  date: new Date(
                                    share.expires_at,
                                  ).toLocaleDateString(locale),
                                })}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleCopy(url)}
                            className="text-text-tertiary hover:text-text-primary transition-colors shrink-0"
                            title={ts2("copyLink")}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionsPage() {
  const t = useTranslations("collectionsPage");
  const tc = useTranslations("common");
  const tl = useTranslations("layout");
  const params = useParams();
  const projectId = params.id as string;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [rules, setRules] = React.useState<FilterRule[]>([]);

  // Collection share dialog state
  const [shareCollection, setShareCollection] =
    React.useState<Collection | null>(null);

  const { data: project } = useSWR<Project>(`/projects/${projectId}`, () =>
    api.get<Project>(`/projects/${projectId}`),
  );

  const {
    data: collections,
    isLoading,
    mutate,
  } = useSWR<Collection[]>(`/projects/${projectId}/collections`, () =>
    api.get<Collection[]>(`/projects/${projectId}/collections`),
  );

  const resetForm = () => {
    setName("");
    setDescription("");
    setRules([]);
    setFormError("");
  };

  const addRule = () => {
    setRules((prev) => [
      ...prev,
      { id: `${Date.now()}`, field: "", operator: "equals", value: "" },
    ]);
  };

  const updateRule = (id: string, patch: Partial<FilterRule>) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(t("nameRequired"));
      return;
    }

    setIsCreating(true);
    setFormError("");

    try {
      await api.post<Collection>(`/projects/${projectId}/collections`, {
        name: name.trim(),
        description: description.trim() || null,
        filter_rules: buildFilterJson(rules),
      });
      await mutate();
      setDialogOpen(false);
      resetForm();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : t("createFailed"),
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-tertiary">
        <Link
          href="/projects"
          className="hover:text-text-primary transition-colors"
        >
          {tl("projects")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/projects/${projectId}`}
          className="hover:text-text-primary transition-colors"
        >
          {project?.name ?? "..."}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-text-secondary">{t("title")}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {t("title")}
          </h1>
          {collections && (
            <p className="mt-0.5 text-sm text-text-secondary">
              {t("collectionCount", { count: collections.length })}
            </p>
          )}
        </div>

        <Dialog.Root
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <Dialog.Trigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              {t("newCollection")}
            </Button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] rounded-xl border border-border bg-bg-secondary p-6 shadow-xl overflow-y-auto max-h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
              <Dialog.Close className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary transition-colors">
                <X className="h-4 w-4" />
              </Dialog.Close>

              <Dialog.Title className="text-base font-semibold text-text-primary">
                {t("newCollectionTitle")}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-text-secondary">
                {t("newCollectionDescription")}
              </Dialog.Description>

              <form onSubmit={handleCreate} className="mt-5 space-y-4">
                <Input
                  label={t("collectionName")}
                  placeholder={t("collectionNamePlaceholder")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-secondary">
                    {t("description")}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t("descriptionPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="flex w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus"
                  />
                </div>

                {/* Filter rules */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-secondary">
                      {t("filterRules")}
                    </label>
                    <button
                      type="button"
                      onClick={addRule}
                      className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {t("addRule")}
                    </button>
                  </div>

                  {rules.length === 0 ? (
                    <p className="text-xs text-text-tertiary">
                      {t("noFilterRules")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {rules.map((rule) => (
                        <FilterRuleRow
                          key={rule.id}
                          rule={rule}
                          onChange={(patch) => updateRule(rule.id, patch)}
                          onRemove={() => removeRule(rule.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="text-sm text-status-error">{formError}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Dialog.Close asChild>
                    <Button type="button" variant="secondary" size="sm">
                      {tc("cancel")}
                    </Button>
                  </Dialog.Close>
                  <Button type="submit" size="sm" loading={isCreating}>
                    {t("createCollection")}
                  </Button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-bg-secondary"
            />
          ))}
        </div>
      ) : !collections || collections.length === 0 ? (
        <div className="rounded-lg border border-border bg-bg-secondary">
          <EmptyState
            icon={Filter}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={{
              label: t("newCollection"),
              onClick: () => setDialogOpen(true),
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.id} className="relative group/card">
              <CollectionCard collection={collection} />
              {/* Share button overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShareCollection(collection);
                }}
                className={cn(
                  "absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md border border-border bg-bg-secondary text-text-tertiary",
                  "opacity-0 group-hover/card:opacity-100 hover:text-text-primary hover:bg-bg-hover transition-all",
                )}
                title={t("shareButtonTitle")}
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Collection share dialog */}
      {shareCollection && (
        <CollectionShareDialog
          collection={shareCollection}
          open={!!shareCollection}
          onOpenChange={(open) => {
            if (!open) setShareCollection(null);
          }}
        />
      )}
    </div>
  );
}