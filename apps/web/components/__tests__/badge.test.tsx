import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithI18n } from '@/test/render-with-i18n'
import { Badge } from '../shared/badge'
import type { AssetStatus } from '@/types'

describe('Badge component', () => {
  const statuses: AssetStatus[] = ['draft', 'in_review', 'approved', 'rejected', 'archived']

  it.each(statuses)('renders %s status badge', (status) => {
    renderWithI18n(<Badge status={status} />)
    const badge = screen.getByText(/Draft|In Review|Approved|Rejected|Archived/)
    expect(badge).toBeInTheDocument()
  })

  it('renders "Draft" label for draft status', () => {
    renderWithI18n(<Badge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders "In Review" label for in_review status', () => {
    renderWithI18n(<Badge status="in_review" />)
    expect(screen.getByText('In Review')).toBeInTheDocument()
  })

  it('renders "Approved" label for approved status', () => {
    renderWithI18n(<Badge status="approved" />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('renders "Rejected" label for rejected status', () => {
    renderWithI18n(<Badge status="rejected" />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders "Archived" label for archived status', () => {
    renderWithI18n(<Badge status="archived" />)
    expect(screen.getByText('Archived')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    renderWithI18n(<Badge status="draft" className="my-custom-class" />)
    const badge = screen.getByText('Draft')
    expect(badge.className).toContain('my-custom-class')
  })
})
