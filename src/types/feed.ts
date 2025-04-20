export interface Feed {
  id: string
  url: string
  title: string
  description?: string
  lastFetched?: Date
  isActive: boolean
} 