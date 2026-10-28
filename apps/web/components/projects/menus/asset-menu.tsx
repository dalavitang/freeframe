'use client'

import * as React from 'react'
import { Download, Link as LinkIcon, Pencil, Share2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { copyToClipboard } from '@/lib/utils'
import { withBasePath } from '@/lib/base-path'
import { DownloadSubmenu } from '@/components/shared/download-menu'
import { MenuAction, MenuSeparator } from '@/components/shared/item-menu'
import type { Asset, DownloadOption } from '@/types'

export interface AssetMenuHandlers {
  onShare?: () => void
  /** `rendition` is a DownloadOption id; left out, the server picks. */
  onDownload?: (rendition?: string) => void
  /** With this, Download opens a submenu of what the asset can be downloaded as. */
  loadDownloadOptions?: () => Promise<DownloadOption[] | null>
  onRename?: () => void
  onDelete?: () => void
}

/**
 * An asset's menu, for its ⋯ button and its right-click alike. As with the
 * folder menu, an entry is shown only when its action is: Copy Asset URL
 * always, the rest when the page passes a handler.
 */
export function AssetMenuItems({
  asset,
  onShare,
  onDownload,
  loadDownloadOptions,
  onRename,
  onDelete,
}: AssetMenuHandlers & { asset: Pick<Asset, 'id' | 'project_id'> }) {
  const t = useTranslations('assetCard')
  const tc = useTranslations('common')
  return (
    <>
      {onShare && (
        <>
          <MenuAction icon={Share2} onSelect={onShare}>
            {t('createShareLink')}
          </MenuAction>
          <MenuSeparator />
        </>
      )}
      {onDownload &&
        (loadDownloadOptions ? (
          <DownloadSubmenu load={loadDownloadOptions} onPick={onDownload} />
        ) : (
          <MenuAction icon={Download} onSelect={() => onDownload()} immediate>
            {t('download')}
          </MenuAction>
        ))}
      <MenuAction
        icon={LinkIcon}
        immediate
        onSelect={() => {
          void copyToClipboard(
            `${window.location.origin}${withBasePath(`/projects/${asset.project_id}/assets/${asset.id}`)}`,
          )
        }}
      >
        {t('copyAssetUrl')}
      </MenuAction>
      {(onRename || onDelete) && <MenuSeparator />}
      {onRename && (
        <MenuAction icon={Pencil} onSelect={onRename}>
          {tc('rename')}
        </MenuAction>
      )}
      {onDelete && (
        <MenuAction icon={Trash2} onSelect={onDelete} danger>
          {tc('delete')}
        </MenuAction>
      )}
    </>
  )
}
