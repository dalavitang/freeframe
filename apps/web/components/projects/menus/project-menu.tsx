'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Link as LinkIcon, Settings, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { copyToClipboard } from '@/lib/utils'
import { withBasePath } from '@/lib/base-path'
import { MenuAction, MenuLabel, MenuSeparator } from '@/components/shared/item-menu'
import type { Project } from '@/types'

/**
 * A project's menu, for the card's ⋯ button and right-click on a card or a
 * list row. Owners only: everyone else gets null, and keeps the browser's menu.
 * The card is a link, and this menu replaces the browser's, so it carries the
 * two link entries people use there.
 *
 * Settings and Delete both open the project's settings page; deleting happens
 * on its Danger tab, behind a typed confirmation.
 */
export function useProjectMenu(project: Project, { isOwner }: { isOwner?: boolean }) {
  const t = useTranslations('projects')
  const router = useRouter()
  const canManage = isOwner || project.role === 'owner'
  const settingsPath = `/projects/${project.id}/settings`

  const projectUrl = () => `${window.location.origin}${withBasePath(`/projects/${project.id}`)}`

  const items = canManage ? (
    <>
      <MenuLabel>{t('project')}</MenuLabel>
      <MenuAction icon={ExternalLink} onSelect={() => window.open(projectUrl(), '_blank')} immediate>
        {t('openInNewTab')}
      </MenuAction>
      <MenuAction icon={LinkIcon} onSelect={() => { void copyToClipboard(projectUrl()) }} immediate>
        {t('copyLink')}
      </MenuAction>
      <MenuSeparator />
      <MenuAction icon={Settings} onSelect={() => router.push(settingsPath)}>
        {t('settingsTitle')}
      </MenuAction>
      <MenuSeparator />
      <MenuAction icon={Trash2} onSelect={() => router.push(`${settingsPath}?tab=danger`)} danger>
        {t('deleteProject')}
      </MenuAction>
    </>
  ) : null

  return { items }
}
