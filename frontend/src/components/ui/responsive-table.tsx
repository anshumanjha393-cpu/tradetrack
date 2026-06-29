import { ReactNode } from 'react'

interface ResponsiveTableProps {
  children: ReactNode
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  return <>{children}</>
}

interface ResponsiveTableHeadProps {
  children: ReactNode
  className?: string
}

export function ResponsiveTableHead({ children, className = '' }: ResponsiveTableHeadProps) {
  return (
    <thead className={className}>
      {children}
    </thead>
  )
}

interface ResponsiveTableBodyProps {
  children: ReactNode
}

export function ResponsiveTableBody({ children }: ResponsiveTableBodyProps) {
  return <tbody>{children}</tbody>
}

interface MobileCardProps {
  children: ReactNode
  className?: string
}

export function MobileCard({ children, className = '' }: MobileCardProps) {
  return (
    <div className={`block border-t border-border p-4 sm:hidden ${className}`}>
      {children}
    </div>
  )
}

interface DesktopRowProps {
  children: ReactNode
  className?: string
}

export function DesktopRow({ children, className = '' }: DesktopRowProps) {
  return (
    <tr className={`hidden border-t border-border transition-colors hover:bg-secondary/40 sm:table-row ${className}`}>
      {children}
    </tr>
  )
}

interface ResponsiveCardContainerProps {
  children: ReactNode
}

export function ResponsiveCardContainer({ children }: ResponsiveCardContainerProps) {
  return (
    <div className="block sm:hidden">
      {children}
    </div>
  )
}
