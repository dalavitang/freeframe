'use client'

import * as React from 'react'
import {
  Bell,
  AtSign,
  UserCheck,
  MessageSquare,
  CheckCircle,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useNotificationStore } from '@/stores/notification-store'
import { usePageTitle } from '@/hooks/use-page-title'
import { useFormatters } from '@/hooks/use-formatters'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

const notificationIcons: Record<NotificationType, React.ElementType> = {
  mention: AtSign,
  assignment: UserCheck,
  due_soon: UserCheck,
  comment: MessageSquare,
  approval: CheckCircle,
}

type NotificationLabelKey =
  | 'mentionLabel'
  | 'assignmentLabel'
  | 'dueSoonLabel'
  | 'commentLabel'
  | 'approvalLabel'

const notificationLabelKeys: Record<NotificationType, NotificationLabelKey> = {
  mention: 'mentionLabel',
  assignment: 'assignmentLabel',
  due_soon: 'dueSoonLabel',
  comment: 'commentLabel',
  approval: 'approvalLabel',
}

function NotificationItem({ notification }: { notification: Notification }) {
  const t = useTranslations('notificationsPage')
  const { markAsRead } = useNotificationStore()
  const Icon = notificationIcons[notification.type]
  const { formatRelativeTime } = useFormatters()

  return (
    <button
      onClick={() => !notification.read && markAsRead(notification.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-bg-hover',
        !notification.read && 'bg-bg-secondary',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          notification.type === 'mention' && 'bg-accent-muted text-accent',
          notification.type === 'approval' && 'bg-status-success/15 text-status-success',
          notification.type === 'comment' && 'bg-bg-tertiary text-text-secondary',
          (notification.type === 'assignment' || notification.type === 'due_soon') &&
            'bg-status-warning/15 text-status-warning',
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <p className="text-sm text-text-primary">
          {t(notificationLabelKeys[notification.type])}
        </p>
        <p className="text-xs text-text-tertiary">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
      )}
    </button>
  )
}

export default function NotificationsPage() {
  const t = useTranslations('notificationsPage')
  const tl = useTranslations('layout')
  const tn = useTranslations('notifications')
  usePageTitle(tl('notifications'))
  const { notifications, isLoading, fetchNotifications, markAllRead, unreadCount } =
    useNotificationStore()

  React.useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">{tl('notifications')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-text-secondary mt-0.5">
              {t('unreadCount', { count: unreadCount })}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            {tn('markAllRead')}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-bg-secondary"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={tn('emptyTitle')}
          description={tn('emptyDescription')}
        />
      ) : (
        <div className="space-y-0.5">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  )
}