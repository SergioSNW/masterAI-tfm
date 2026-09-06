import { get, post, ApiError } from '../../src/services/api'

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown>; text?: () => Promise<string> }) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Map([['content-type', 'application/json']]) as unknown as Headers,
    json: async () => ({}),
    text: async () => '',
    ...response,
  }) as unknown as typeof fetch
}

describe('mobile api client', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('get() issues a GET request against the deployed API by default', async () => {
    mockFetch({ json: async () => [{ id: 'a1' }] })

    const result = await get<{ id: string }[]>('/actors')

    expect(fetch).toHaveBeenCalledWith(
      'https://master-ai-tfm.vercel.app/api/actors',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual([{ id: 'a1' }])
  })

  it('post() sends a JSON body with method POST', async () => {
    mockFetch({ json: async () => ({ id: 's1' }) })

    await post('/submissions', { castingId: 'c1' })

    expect(fetch).toHaveBeenCalledWith(
      'https://master-ai-tfm.vercel.app/api/submissions',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ castingId: 'c1' }) }),
    )
  })

  it('throws an ApiError with the response status when the request fails', async () => {
    mockFetch({
      ok: false,
      status: 404,
      headers: new Map([['content-type', 'application/json']]) as unknown as Headers,
      text: async () => 'Not found: GET /api/actors/missing',
    })

    await expect(get('/actors/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })

  it('throws an ApiError when the response is not JSON', async () => {
    mockFetch({
      ok: true,
      headers: new Map([['content-type', 'text/html']]) as unknown as Headers,
      text: async () => '<html>Vercel error page</html>',
    })

    await expect(get('/actors')).rejects.toBeInstanceOf(ApiError)
  })
})
