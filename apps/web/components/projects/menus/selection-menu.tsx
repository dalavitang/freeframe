'use client'

import * as React from 'react'
import { Download, FolderInput, Share2, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { MenuAction, MenuLabel, MenuSeparator } from '@/components/shared/item-menu'

export interface SelectionActions {
  onShare?: () => void
  onDownload?: () => void
  onMove?: () => void
  onDelete?: () => void
}

/**
 * Right-click on an item inside a selection of several: the selection bar's
 * actions, for everything selected rather than the one item under the pointer.
 */
export function SelectionMenuItems({ count, onShare, onDownload, onMove, onDelete }: SelectionActions & { count: number }) {
  const t = useTranslations('projects')
  const tc = useTranslations('common')
  return (
    <>
      <MenuLabel>{t('selectedMenuCount', { count })}</MenuLabel>
      {onShare && (
        <MenuAction icon={Share2} onSelect={onShare}>
          {t('createShareLink')}
        </MenuAction>
      )}
      {onDownload && (
        <MenuAction icon={Download} onSelect={onDownload}>
          {tc('download')}
        </MenuAction>
      )}
      {onMove && (
        <MenuAction icon={FolderInput} onSelect={onMove}>
          {t('moveToEllipsis')}
        </MenuAction>
      )}
      {onDelete && (
        <>
          <MenuSeparator />
          <MenuAction icon={Trash2} onSelect={onDelete} danger>
            {tc('delete')}
          </MenuAction>
        </>
      )}
    </>
  )
}
