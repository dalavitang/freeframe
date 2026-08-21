'use client'

import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { AlertCircle, Loader2, CheckCircle2, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { useReviewStore } from '@/stores/review-store'
import type { AssetVersion, AssetVersionStatus } from '@/types'

export const versionStatusConfig: Record<
  AssetVersionStatus,
  { labelKey: AssetVersionStatus; className: string; icon: React.ReactNode }
> = {
  uploading: {
    labelKey: 'uploading',
    className: 'text-status-info',
    icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
  },
  processing: {
    labelKey: 'processing',
    className: 'text-status-warning',
    icon: <Loader2 className="h-2.5 w-2.5 animate-spin" />,
  },
  ready: {
    labelKey: 'ready',
    className: 'text-status-success',
    icon: <CheckCircle2 className="h-2.5 w-2.5" />,
  },
  failed: {
    labelKey: 'failed',
    className: 'text-status-error',
    icon: <AlertCircle className="h-2.5 w-2.5" />,
  },
}

export function useVersionStatusLabels(): Record<AssetVersionStatus, string> {
  const t = useTranslations('versionSwitcher')
  return {
    uploading: t('status.uploading'),
    processing: t('status.processing'),
    ready: t('status.ready'),
    failed: t('status.failed'),
  }
}

interface VersionSwitcherProps {
  versions: AssetVersion[]
  className?: string
}

export function VersionSwitcher({ versions, className }: VersionSwitcherProps) {
  const t = useTranslations('versionSwitcher')
  const statusLabels = useVersionStatusLabels()
  const currentVersion = useReviewStore((s) => s.currentVersion)
  const setCurrentVersion = useReviewStore((s) => s.setCurrentVersion)

  const sorted = React.useMemo(
    () => [...versions].sort((a, b) => a.version_number - b.version_number),
    [versions],
  )

  if (sorted.length === 0) return null

  // Surface an in-flight new version (uploading/transcoding) on the always-visible
  // trigger — otherwise its status is only visible after opening the dropdown (#118).
  const latest = sorted[sorted.length - 1]
  const latestStatus = latest?.processing_status
  const inFlightCfg =
    latestStatus === 'uploading' || latestStatus === 'processing'
      ? versionStatusConfig[latestStatus]
      : null

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="text-xs text-text-tertiary shrink-0">{t('version')}</span>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors outline-none">
            <span>v{currentVersion?.version_number ?? latest.version_number}</span>
            {inFlightCfg && (
              <span
                data-testid="version-status-indicator"
                className="inline-flex items-center gap-1 text-[11px] text-white/90"
                title={t('statusTitle', { version: `v${latest.version_number}`, status: statusLabels[inFlightCfg.labelKey] })}
              >
                {inFlightCfg.icon}
                {statusLabels[inFlightCfg.labelKey]}
              </span>
            )}
            {sorted.length > 1 && <ChevronDown className="h-3 w-3 opacity-70" />}
          </button>
        </DropdownMenu.Trigger>
        {sorted.length > 1 && (
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-[100] min-w-[160px] rounded-xl border border-border bg-bg-elevated shadow-2xl py-1.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              {sorted.map((version) => {
                const isActive = currentVersion?.id === version.id
                const statusCfg = versionStatusConfig[version.processing_status]
                const isDisabled =
                  version.processing_status === 'uploading' ||
                  version.processing_status === 'processing'
                return (
                  <DropdownMenu.Item
                    key={version.id}
                    disabled={isDisabled}
                    onSelect={() => setCurrentVersion(version)}
                    className={cn(
                      'flex items-center justify-between gap-3 mx-1 px-2.5 py-2 rounded-lg text-sm cursor-pointer outline-none transition-colors',
                      isActive
                        ? 'bg-accent/10 text-accent font-medium'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                      isDisabled && 'opacity-50 cursor-not-allowed',
                    )}
                  >
                    <span>v{version.version_number}</span>
                    <span
                      className={cn('inline-flex items-center gap-1 text-[11px]', statusCfg.className)}
                      title={statusLabels[statusCfg.labelKey]}
                    >
                      {statusCfg.icon}
                      {statusLabels[statusCfg.labelKey]}
                    </span>
                  </DropdownMenu.Item>
                )
              })}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        )}
      </DropdownMenu.Root>
    </div>
  )
}
