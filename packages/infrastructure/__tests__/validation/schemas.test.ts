import { describe, it, expect } from 'vitest'
import { CreateActorSchema } from '../../validation/actors'
import { CreateProjectSchema, CloseProjectSchema } from '../../validation/projects'
import { CreateCastingSchema, CloseCastingSchema } from '../../validation/castings'
import { CreateRoundSchema, OpenRoundSchema, CloseRoundSchema } from '../../validation/rounds'
import { SubmitVideoSchema, ReviewSubmissionSchema, ManualUploadSchema } from '../../validation/submissions'
import { CreateCommentSchema, ListCommentsSchema } from '../../validation/comments'
import { AddAttachmentSchema, ListAttachmentsSchema } from '../../validation/attachments'

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

describe('ManualUploadSchema', () => {
  it('accepts valid input', () => {
    const result = ManualUploadSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoData: 'base64string', fileName: 'video.mp4' })
    expect(result.success).toBe(true)
  })

  it('rejects empty videoData', () => {
    const result = ManualUploadSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoData: '', fileName: 'video.mp4' })
    expect(result.success).toBe(false)
  })

  it('rejects empty fileName', () => {
    const result = ManualUploadSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoData: 'data', fileName: '' })
    expect(result.success).toBe(false)
  })

  it('accepts optional notes', () => {
    const result = ManualUploadSchema.safeParse({ roundId: crypto.randomUUID(), actorId: crypto.randomUUID(), videoData: 'data', fileName: 'video.mp4', notes: 'Good take' })
    expect(result.success).toBe(true)
  })
})

describe('CloseProjectSchema', () => {
  it('accepts valid input', () => {
    const result = CloseProjectSchema.safeParse({ projectId: crypto.randomUUID(), directorId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid projectId', () => {
    const result = CloseProjectSchema.safeParse({ projectId: 'bad', directorId: crypto.randomUUID() })
    expect(result.success).toBe(false)
  })
})

describe('CloseCastingSchema', () => {
  it('accepts valid input', () => {
    const result = CloseCastingSchema.safeParse({ castingId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid', () => {
    const result = CloseCastingSchema.safeParse({ castingId: 'bad' })
    expect(result.success).toBe(false)
  })
})

describe('OpenRoundSchema', () => {
  it('accepts valid input', () => {
    const result = OpenRoundSchema.safeParse({ roundId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid', () => {
    const result = OpenRoundSchema.safeParse({ roundId: 'bad' })
    expect(result.success).toBe(false)
  })
})

describe('CloseRoundSchema', () => {
  it('accepts valid input', () => {
    const result = CloseRoundSchema.safeParse({ roundId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid', () => {
    const result = CloseRoundSchema.safeParse({ roundId: 'bad' })
    expect(result.success).toBe(false)
  })
})

describe('CreateCommentSchema', () => {
  it('accepts valid input', () => {
    const result = CreateCommentSchema.safeParse({ submissionId: crypto.randomUUID(), authorName: 'Director', content: 'Great take' })
    expect(result.success).toBe(true)
  })

  it('rejects empty authorName', () => {
    const result = CreateCommentSchema.safeParse({ submissionId: crypto.randomUUID(), authorName: '', content: 'Nice' })
    expect(result.success).toBe(false)
  })

  it('rejects empty content', () => {
    const result = CreateCommentSchema.safeParse({ submissionId: crypto.randomUUID(), authorName: 'Director', content: '' })
    expect(result.success).toBe(false)
  })
})

describe('ListCommentsSchema', () => {
  it('accepts valid input', () => {
    const result = ListCommentsSchema.safeParse({ submissionId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid', () => {
    const result = ListCommentsSchema.safeParse({ submissionId: 'bad' })
    expect(result.success).toBe(false)
  })
})

describe('AddAttachmentSchema', () => {
  it('accepts valid input', () => {
    const result = AddAttachmentSchema.safeParse({ roundId: crypto.randomUUID(), fileName: 'script.pdf', fileType: 'application/pdf', fileData: 'base64', fileSize: 50000 })
    expect(result.success).toBe(true)
  })

  it('rejects empty fileName', () => {
    const result = AddAttachmentSchema.safeParse({ roundId: crypto.randomUUID(), fileName: '', fileType: 'application/pdf', fileData: 'data', fileSize: 1000 })
    expect(result.success).toBe(false)
  })

  it('rejects non-positive fileSize', () => {
    const result = AddAttachmentSchema.safeParse({ roundId: crypto.randomUUID(), fileName: 'f.pdf', fileType: 'application/pdf', fileData: 'data', fileSize: 0 })
    expect(result.success).toBe(false)
  })
})

describe('ListAttachmentsSchema', () => {
  it('accepts valid input', () => {
    const result = ListAttachmentsSchema.safeParse({ roundId: crypto.randomUUID() })
    expect(result.success).toBe(true)
  })

  it('rejects invalid uuid', () => {
    const result = ListAttachmentsSchema.safeParse({ roundId: 'bad' })
    expect(result.success).toBe(false)
  })
})
