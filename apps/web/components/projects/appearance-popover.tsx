'use client'

import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { useTranslations } from 'next-intl'
import {
  LayoutGrid, List, RectangleHorizontal, Square, RectangleVertical,
  SlidersHorizontal,
} from 'lucide-react'
import {
  SegmentRow,
  SelectRow,
  ToggleRow as BaseToggleRow,
} from '@/components/ui/setting-controls'
import {
  useViewStore,
  type ViewLayout, type CardSize, type AspectRatio,
  type ThumbnailScale, type TitleLines,
} from '@/stores/view-store'

// ─── Rows ───────────────────────────────────────────────────────────────────
// The controls live in components/ui/setting-controls, shared with a share
// link's Appearance block. This popover's frame is always dark, hence `overlay`.

export function ToggleRow(props: Omit<React.ComponentProps<typeof BaseToggleRow>, 'tone'>) {
  return <BaseToggleRow {...props} tone="overlay" />
}

export function LayoutRow({ value, onChange }: { value: ViewLayout; onChange: (v: ViewLayout) => void }) {
  const t = useTranslations('appearance')
  return (
    <SegmentRow<ViewLayout>
      label={t('layout')}
      tone="overlay"
      options={[
        { value: 'grid', icon: <LayoutGrid className="h-3.5 w-3.5" />, ariaLabel: t('grid') },
        { value: 'list', icon: <List className="h-3.5 w-3.5" />, ariaLabel: t('list') },
      ]}
      value={value}
      onChange={onChange}
    />
  )
}

export function CardSizeRow({ value, onChange }: { value: CardSize; onChange: (v: CardSize) => void }) {
  const t = useTranslations('appearance')
  return (
    <SegmentRow<CardSize>
      label={t('cardSize')}
      tone="overlay"
      options={[
        { value: 'S', label: 'S' },
        { value: 'M', label: 'M' },
        { value: 'L', label: 'L' },
      ]}
      value={value}
      onChange={onChange}
    />
  )
}

// ─── Popover frame ──────────────────────────────────────────────────────────

export function AppearancePopoverFrame({ children }: { children: React.ReactNode }) {
  const t = useTranslations('appearance')
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          {t('title')}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={6}
          className="z-50 w-72 rounded-xl border border-white/10 bg-[#1a1a1f] shadow-2xl p-4 space-y-4
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Main popover ───────────────────────────────────────────────────────────

export function AppearancePopover() {
  const t = useTranslations('appearance')
  const {
    layout, setLayout,
    cardSize, setCardSize,
    aspectRatio, setAspectRatio,
    thumbnailScale, setThumbnailScale,
    showCardInfo, setShowCardInfo,
    titleLines, setTitleLines,
    flattenFolders, setFlattenFolders,
    showFileSize, setShowFileSize,
    showUploader, setShowUploader,
  } = useViewStore()

  return (
    <AppearancePopoverFrame>
      <LayoutRow value={layout} onChange={setLayout} />

      {/* Card Size — only in grid mode */}
      {layout === 'grid' && <CardSizeRow value={cardSize} onChange={setCardSize} />}

      {/* Aspect Ratio — only in grid mode */}
      {layout === 'grid' && (
        <SegmentRow<AspectRatio>
          label={t('aspectRatio')}
          tone="overlay"
          options={[
            { value: 'landscape', icon: <RectangleHorizontal className="h-3.5 w-3.5" />, ariaLabel: t('landscape') },
            { value: 'square', icon: <Square className="h-3.5 w-3.5" />, ariaLabel: t('square') },
            { value: 'portrait', icon: <RectangleVertical className="h-3.5 w-3.5" />, ariaLabel: t('portrait') },
          ]}
          value={aspectRatio}
          onChange={setAspectRatio}
        />
      )}

      {/* Thumbnail Scale — only in grid mode */}
      {layout === 'grid' && (
        <SegmentRow<ThumbnailScale>
          label={t('thumbnailScale')}
          tone="overlay"
          options={[
            { value: 'fit', label: t('fit') },
            { value: 'fill', label: t('fill') },
          ]}
          value={thumbnailScale}
          onChange={setThumbnailScale}
        />
      )}

      {/* Show Card Info */}
      <ToggleRow label={t('showCardInfo')} checked={showCardInfo} onCheckedChange={setShowCardInfo} />

      {/* Titles */}
      {showCardInfo && (
        <SelectRow<TitleLines>
          label={t('titles')}
          tone="overlay"
          value={titleLines}
          options={[
            { value: '1', label: t('oneLine') },
            { value: '2', label: t('twoLines') },
            { value: '3', label: t('threeLines') },
          ]}
          onChange={setTitleLines}
        />
      )}

      {/* Flatten Folders */}
      <ToggleRow label={t('flattenFolders')} checked={flattenFolders} onCheckedChange={setFlattenFolders} />

      {/* Fields section */}
      <div className="pt-1 border-t border-white/10">
        <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5">{t('fields')}</p>
        <div className="space-y-3">
          <ToggleRow label={t('fileSize')} checked={showFileSize} onCheckedChange={setShowFileSize} />
          <ToggleRow label={t('uploadedBy')} checked={showUploader} onCheckedChange={setShowUploader} />
        </div>
      </div>
    </AppearancePopoverFrame>
  )
}
