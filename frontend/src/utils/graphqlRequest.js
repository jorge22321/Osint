import { GRAPHQL_URL } from '@/config/api'

export async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('ciso_token')
  if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables })
  })
  const result = await response.json()
  if (!response.ok || result.errors?.length) throw new Error(result.errors?.[0]?.message || 'No se pudo conectar con el servidor.')
  return result.data
}
