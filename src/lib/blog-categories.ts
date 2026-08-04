import { FolderOpen, Scale, TrendingUp, Percent, Compass, FileText } from "lucide-react";

// Иконка и вариант mesh-градиента для обложки карточки блога — по категории
// поста. FileText — запасной вариант для категорий, которых пока нет в списке.
export const BLOG_CATEGORY_ICONS: Record<
  string,
  { icon: typeof FileText; variant: number }
> = {
  "Кейсы сделок": { icon: FolderOpen, variant: 0 },
  "Юридические вопросы и риски": { icon: Scale, variant: 1 },
  "Рынок недвижимости": { icon: TrendingUp, variant: 2 },
  Ипотека: { icon: Percent, variant: 3 },
  "Гид покупателя/продавца": { icon: Compass, variant: 4 },
};

export function getBlogCategoryIcon(category: string) {
  return BLOG_CATEGORY_ICONS[category] ?? { icon: FileText, variant: 0 };
}
