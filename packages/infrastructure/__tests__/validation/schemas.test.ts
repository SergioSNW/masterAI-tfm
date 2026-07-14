import { describe, it, expect } from 'vitest'
import { CreateActorSchema } from '../../validation/actors'
import { CreateProjectSchema } from '../../validation/projects'
import { CreateCastingSchema } from '../../validation/castings'
import { CreateRoundSchema } from '../../validation/rounds'
import { SubmitVideoSchema, ReviewSubmissionSchema } from '../../validation/submissions'

describe('CreateActorSchema', () => {
  it('accepts valid input', () => {
    const result = CreateActorSchema.safeParse({ email: 'a@b.com', name: 'Test' })
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const result = CreateActorSchema.safeParse({ name: 'Test' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = CreateActorSchema.safeParse({ email: 'notanemail', name: 'Test' })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields', () => {
    const result = CreateActorSchema.safeParse({ email: 'a@b.com', name: 'Test', phone: '+44 123', profilePictureUrl: 'https://pic.com/img.jpg' })
    expect(result.success).toBe(true)
  })
})

describe('CreateProjectSchema', () => {
  it('accepts valid input', () => {
    const result = CreateProjectSchema.safeParse({ directorId: crypto.randomUUID(), title: 'New Project' })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = CreateProjectSchema.safeParse({ directorId: crypto.randomUUID(), title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid uuid', () => {
    const result = CreateProjectSchema.safeParse({ directorId: 'not-a-uuid', title: 'Project' })
    expect(result.success).toBe(false)
  })
})

describe('CreateCastingSchema', () => {
  it('accepts valid input', () => {
    const result = CreateCastingSchema.safeParse({ projectId: crypto.randomUUID(), roleName: 'Lead Role' })
    expect(result.success).toBe(true)
  })
})

describe('CreateRoundSchema', () => {
  it('accepts valid input', () => {
    const result = CreateRoundSchema.safeParse({ castingId: crypto.randomUUID(), name: 'Self-Tape', order: 0 })
    expect(result.success).toBe(true)
  })

  it('parses deadline string into Date', () => {
    const result = CreateRoundSchema.safeParse({ castingId: crypto.randomUUID(), name: 'Round', order: 1, deadline: '2026-08-15T23:59:59Z' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.deadline).toBeInstanceOf(Date)
    }
  })
})

describe('SubmitVideoSchema', () => {
  it('accepts valid input', () => {
    const result = SubmitVideoSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoUrl: 'https://storage.com/video.mp4' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid video URL', () => {
    const result = SubmitVideoSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})

describe('ReviewSubmissionSchema', () => {
  it('accepts valid shortlisted status', () => {
    const result = ReviewSubmissionSchema.safeParse({ submissionId: crypto.randomUUID(), status: 'shortlisted', feedback: 'Great' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = ReviewSubmissionSchema.safeParse({ submissionId: crypto.randomUUID(), status: 'unknown' })
    expect(result.success).toBe(false)
  })
})
