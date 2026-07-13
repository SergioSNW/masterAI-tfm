export interface Actor {
  id: string
  name: string
  email: string
  avatarColor: string
}

export interface Submission {
  id: string
  actorId: string
  actorName: string
  actorEmail: string
  avatarColor: string
  videoUrl: string
  thumbnailUrl?: string
  notes?: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  feedback?: string
  createdAt: string
}

export interface Round {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: string
  order: number
  status: 'pending' | 'open' | 'closed'
  submissions: Submission[]
}

export interface Casting {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: 'open' | 'closed' | 'cancelled'
  rounds: Round[]
}

export interface Project {
  id: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'closed'
  castings: Casting[]
}

export const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'The Crown — Season 3',
    description: 'Casting for new recurring characters and supporting roles for the upcoming season.',
    status: 'active',
    castings: [
      {
        id: 'c1',
        projectId: 'p1',
        roleName: 'Lead Role — Lady Victoria',
        description: 'A sophisticated aristocrat navigating post-war British high society.',
        requirements: 'British accent, age 30-45, period drama experience',
        status: 'open',
        rounds: [
          {
            id: 'r1',
            castingId: 'c1',
            name: 'Self-Tape Submission',
            description: 'Submit a 2-minute monologue in character',
            deadline: '2026-08-15T23:59:59Z',
            order: 0,
            status: 'open',
            submissions: [
              { id: 's1', actorId: 'a1', actorName: 'Emma Richardson', actorEmail: 'emma.r@example.com', avatarColor: '#6366f1', videoUrl: '#', notes: 'Strong emotional range', status: 'shortlisted', feedback: 'Excellent presence. Moving to callbacks.', createdAt: '2026-07-10' },
              { id: 's2', actorId: 'a2', actorName: 'James Whitfield', actorEmail: 'james.w@example.com', avatarColor: '#a855f7', videoUrl: '#', notes: null, status: 'pending', createdAt: '2026-07-11' },
              { id: 's3', actorId: 'a3', actorName: 'Sophia Chen', actorEmail: 'sophia.c@example.com', avatarColor: '#ec4899', videoUrl: '#', notes: 'Good diction but needs more depth', status: 'reviewed', createdAt: '2026-07-09' },
              { id: 's4', actorId: 'a4', actorName: 'Oliver Grant', actorEmail: 'oliver.g@example.com', avatarColor: '#22c55e', videoUrl: '#', notes: null, status: 'pending', createdAt: '2026-07-12' },
            ],
          },
          {
            id: 'r2',
            castingId: 'c1',
            name: 'Callback — In-Person',
            description: 'Live audition with the director',
            deadline: '2026-09-01T23:59:59Z',
            order: 1,
            status: 'pending',
            submissions: [],
          },
        ],
      },
      {
        id: 'c2',
        projectId: 'p1',
        roleName: 'Supporting — Margaret',
        description: 'A sharp-tongued housekeeper with a hidden past.',
        requirements: 'Cockney accent a plus, age 40-60',
        status: 'open',
        rounds: [
          {
            id: 'r3',
            castingId: 'c2',
            name: 'Self-Tape Submission',
            description: 'Submit a 90-second scene',
            deadline: '2026-08-20T23:59:59Z',
            order: 0,
            status: 'open',
            submissions: [
              { id: 's5', actorId: 'a5', actorName: 'Diana Moss', actorEmail: 'diana.m@example.com', avatarColor: '#eab308', videoUrl: '#', notes: null, status: 'pending', createdAt: '2026-07-11' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'p2',
    title: 'Breaking Bad — Season 2',
    description: 'Casting for new lab assistants and cartel contacts.',
    status: 'active',
    castings: [
      {
        id: 'c3',
        projectId: 'p2',
        roleName: 'Recurring — Chemist',
        description: 'A brilliant but unstable organic chemist.',
        requirements: 'Must be comfortable with intense scenes',
        status: 'open',
        rounds: [
          {
            id: 'r4',
            castingId: 'c3',
            name: 'Video Submission',
            description: 'Submit a cold read of provided script',
            deadline: '2026-08-10T23:59:59Z',
            order: 0,
            status: 'open',
            submissions: [
              { id: 's6', actorId: 'a6', actorName: 'Marcus Johnson', actorEmail: 'marcus.j@example.com', avatarColor: '#6366f1', videoUrl: '#', notes: 'Intense performance, very compelling', status: 'shortlisted', feedback: 'Great intensity. Moving to next round.', createdAt: '2026-07-08' },
              { id: 's7', actorId: 'a7', actorName: 'Lena Fischer', actorEmail: 'lena.f@example.com', avatarColor: '#a855f7', videoUrl: '#', notes: null, status: 'pending', createdAt: '2026-07-12' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'p3',
    title: 'Stranger Things — Season 5',
    description: 'New characters for the final season. Multiple roles available.',
    status: 'draft',
    castings: [],
  },
]
