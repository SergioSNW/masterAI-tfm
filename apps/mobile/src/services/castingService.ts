import type { CastingDTO } from './types'

const MOCK_CASTINGS: CastingDTO[] = [
  {
    id: '1',
    title: 'Lead Role — Feature Film',
    projectName: 'Eclipse',
    role: 'Lead Actor',
    deadline: 'Aug 15, 2026',
    status: 'open',
  },
  {
    id: '2',
    title: 'Supporting Role — TV Series',
    projectName: 'Nightfall',
    role: 'Supporting Actor',
    deadline: 'Aug 30, 2026',
    status: 'open',
  },
  {
    id: '3',
    title: 'Voice Over — Animation',
    projectName: 'Starlight',
    role: 'Voice Actor',
    deadline: 'Sep 1, 2026',
    status: 'open',
  },
]

export async function fetchOpenCastings(): Promise<CastingDTO[]> {
  // When API endpoints exist, replace with:
  // return get<CastingDTO[]>('/castings?status=open')
  return new Promise(resolve => {
    setTimeout(() => resolve([...MOCK_CASTINGS]), 600)
  })
}
