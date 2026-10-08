// Shapes passed from server components to client components. Kept small on
// purpose: everything here is serialised into the page's HTML.

export interface ImageData {
  src: string
  srcSet?: string
  width: number
  height: number
}

export interface ProjectCardData {
  slug: string
  title: string
  summary: string
  tags: string[]
  badge?: 'Freelance' | 'Pro-bono' | 'SLATE'
  thumb?: ImageData
}

/** A card on the Work page, with what the filters and sorts need. */
export interface WorkItem extends ProjectCardData {
  date: string
  effort: number
}

export interface FeaturedProject {
  slug: string
  title: string
  dateLabel: string
  tags: string[]
  summary: string
  favicon: string
  hero?: ImageData
  sections: { heading: string; body: string }[]
}

export interface ArticleCardData {
  slug: string
  title: string
  summary: string
  date: string
  dateLabel: string
  publication?: string
  coverText: string
  image?: ImageData
  imageAlt: string
  /** Photo behind the cover text and gradient, used when there's no image. */
  coverImage?: ImageData
  /** CSS object-position for coverImage, e.g. "right center". */
  coverPosition?: string
}
