import useSWR from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface PokemonNews {
  id: string
  title: string
  date: string
  category: string
  description: string
  url: string
  imageUrl?: string
}

interface NewsResponse {
  success: boolean
  data: PokemonNews[]
  count: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function usePokemonNews() {
  const { data, error, isLoading } = useSWR<NewsResponse>(
    `${API_URL}/api/news`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 3600000, // Rafraîchir toutes les heures
      onError: (err) => {
        console.error('Erreur lors du chargement des actualités:', err)
      },
      onSuccess: (data) => {
        console.log('Actualités chargées:', data)
      }
    }
  )

  console.log('usePokemonNews - État:', { 
    isLoading, 
    hasError: !!error, 
    newsCount: data?.data?.length || 0,
    apiUrl: `${API_URL}/api/news`
  })

  return {
    news: data?.data || [],
    isLoading,
    error,
  }
}
