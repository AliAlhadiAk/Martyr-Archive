export interface SearchableItem {
  id: string
  name: string
  location?: string
  martyrdomDate?: string
  age?: number
  [key: string]: any
}

// Pure search function. Debounce should be applied by callers (e.g., input handlers)
export function searchItems(
  items: SearchableItem[],
  query: string,
  filters: { [key: string]: any } = {}
): SearchableItem[] {
  const searchQuery = query.toLowerCase().trim()

  return items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery) ||
      item.location?.toLowerCase().includes(searchQuery)

    const matchesDate =
      !filters.dateRange ||
      (item.martyrdomDate &&
        new Date(item.martyrdomDate) >= new Date(filters.dateRange.start) &&
        new Date(item.martyrdomDate) <= new Date(filters.dateRange.end))

    const matchesLocation =
      !filters.location ||
      item.location?.toLowerCase().includes(String(filters.location).toLowerCase())

    return matchesSearch && matchesDate && matchesLocation
  })
}