import type {} from 'next-intl'

declare global {
  type IntlMessages = typeof import('../messages/en.json')
}

export {}
