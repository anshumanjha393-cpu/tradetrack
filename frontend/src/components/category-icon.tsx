import {
  Briefcase,
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  TrendingUp,
  HeartPulse,
  Clapperboard,
  Plug,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/data'

const map: Record<Category, LucideIcon> = {
  Income: Briefcase,
  Housing: Home,
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Investments: TrendingUp,
  Health: HeartPulse,
  Entertainment: Clapperboard,
  Utilities: Plug,
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  const Icon = map[category] ?? Briefcase
  return <Icon className={className} strokeWidth={1.75} />
}
