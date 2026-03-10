interface TokenCache {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()

  if (tokenCache && tokenCache.expiresAt - 60_000 > now) {
    return tokenCache.accessToken
  }

  const res = await fetch(
    `${process.env.AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AMADEUS_CLIENT_ID!,
        client_secret: process.env.AMADEUS_CLIENT_SECRET!,
      }),
      cache: 'no-store',
    }
  )

  if (!res.ok) throw new Error(`Amadeus token error: ${res.status}`)

  const data = await res.json()
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return tokenCache.accessToken
}

export async function amadeusGet(
  path: string,
  params: Record<string, string>
): Promise<unknown> {
  const token = await getAccessToken()
  const url = new URL(`${process.env.AMADEUS_BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Amadeus API ${res.status}: ${err}`)
  }

  return res.json()
}
