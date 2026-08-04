import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload } from '@vercel/blob/client'
import {
  CreateActorSchema,
  UpdateActorSchema,
  CreateCastingSchema,
  CloseCastingSchema,
  UpdateCastingPhaseSchema,
  CreateProjectSchema,
  CloseProjectSchema,
  UpdateProjectStatusSchema,
  CreateRoundSchema,
  OpenRoundSchema,
  CloseRoundSchema,
  AddAttachmentSchema,
  ListAttachmentsSchema,
  ManualUploadSchema,
  ReviewSubmissionSchema,
  CreateCommentSchema,
  ListCommentsSchema,
  CreateSubmissionSchema,
  AnalyzeSubmissionSchema,
  prisma,
  PrismaActorRepository,
  PrismaCastingRepository,
  PrismaProjectRepository,
  PrismaDirectorRepository,
  PrismaRoundRepository,
  PrismaAttachmentRepository,
  PrismaSubmissionRepository,
  PrismaCommentRepository,
} from '@masterai/infrastructure'
import {
  CreateActorUseCase,
  UpdateActorUseCase,
  DeleteActorUseCase,
  ListActorsUseCase,
  CreateCastingUseCase,
  CloseCastingUseCase,
  UpdateCastingPhaseUseCase,
  CreateProjectUseCase,
  ListProjectsUseCase,
  CloseProjectUseCase,
  UpdateProjectStatusUseCase,
  CreateRoundUseCase,
  OpenRoundUseCase,
  CloseRoundUseCase,
  AddAttachmentUseCase,
  ListAttachmentsUseCase,
  ManualUploadUseCase,
  ReviewSubmissionUseCase,
  CreateSubmissionUseCase,
  CreateCommentUseCase,
  ListCommentsUseCase,
  GenerateAIAnalysisUseCase,
  AIServiceError,
} from '@masterai/core'
import { OpenAIAnalysisService } from './ai/OpenAIAnalysisService.js'

/* ── Blob upload config ── */

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]

const MAX_SIZE_BYTES = 50 * 1024 * 1024

/* ── Route matching ── */

type Handler = (req: VercelRequest, res: VercelResponse, params: Record<string, string>) => unknown

interface Route {
  method: string
  match: RegExp
  paramNames: string[]
  handler: Handler
}

function defineRoute(method: string, path: string, handler: Handler): Route {
  const paramNames: string[] = []
  const pattern = path.replace(/:([a-zA-Z]+)/g, (_, name) => {
    paramNames.push(name)
    return '([^/]+)'
  })
  return { method, match: new RegExp(`^${pattern}$`), paramNames, handler }
}

const routes: Route[] = [
  defineRoute('POST', '/api/upload', handleUploadRoute),

  defineRoute('GET', '/api/actors', listActors),
  defineRoute('POST', '/api/actors/create', createActor),
  defineRoute('PUT', '/api/actors/:id', updateActor),
  defineRoute('DELETE', '/api/actors/:id', deleteActor),

  defineRoute('GET', '/api/projects', listProjects),
  defineRoute('POST', '/api/projects/create', createProject),
  defineRoute('POST', '/api/projects/close', closeProject),
  defineRoute('PUT', '/api/projects/:id/status', updateProjectStatus),
  defineRoute('GET', '/api/dashboard', dashboard),

  defineRoute('GET', '/api/castings', listCastings),
  defineRoute('POST', '/api/castings/create', createCasting),
  defineRoute('POST', '/api/castings/close', closeCasting),
  defineRoute('PUT', '/api/castings/:id/phase', updateCastingPhase),

  defineRoute('POST', '/api/rounds/create', createRound),
  defineRoute('POST', '/api/rounds/open', openRound),
  defineRoute('POST', '/api/rounds/close', closeRound),
  defineRoute('POST', '/api/rounds/attachment', addAttachment),
  defineRoute('GET', '/api/rounds/attachments', listAttachments),
  defineRoute('DELETE', '/api/rounds/attachment/:id', removeAttachment),

  defineRoute('POST', '/api/submissions', createSubmission),
  defineRoute('POST', '/api/submissions/upload', uploadSubmission),
  defineRoute('POST', '/api/submissions/review', reviewSubmission),
  defineRoute('POST', '/api/submissions/comment', createComment),
  defineRoute('GET', '/api/submissions/comments', listComments),
  defineRoute('POST', '/api/analyze', analyzeSubmission),
]

/* ── Main entry ── */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log({ method: req.method, url: req.url })
  const url = new URL(req.url ?? '/', 'http://localhost')
  const method = req.method ?? 'GET'
  const pathname = url.pathname

  for (const route of routes) {
    if (route.method !== method) continue
    const m = pathname.match(route.match)
    if (!m) continue
    const params: Record<string, string> = {}
    route.paramNames.forEach((name, i) => {
      params[name] = m[i + 1]
    })
    return route.handler(req, res, params)
  }

  return res.status(404).json({ error: `Not found: ${method} ${pathname}` })
}

/* ── Route handlers ── */

async function handleUploadRoute(req: VercelRequest, res: VercelResponse) {
  try {
    const response = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload: Record<string, unknown> = clientPayload ? JSON.parse(clientPayload) : {}
        const { fileType, fileSize, fileName } = payload as { fileType?: string; fileSize?: number; fileName?: string }

        if (!fileName?.trim()) throw new Error('File name is required')
        if (!fileType || !ALLOWED_TYPES.includes(fileType)) throw new Error(`File type '${fileType}' is not supported`)
        if (fileSize === undefined || fileSize > MAX_SIZE_BYTES) throw new Error(`File exceeds 50MB limit (${((fileSize ?? MAX_SIZE_BYTES + 1) / 1024 / 1024).toFixed(1)}MB)`)

        return { allowedContentTypes: ALLOWED_TYPES, maximumSizeInBytes: MAX_SIZE_BYTES, addRandomSuffix: true }
      },
    })
    return res.status(200).json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload request failed'
    return res.status(400).json({ error: message })
  }
}

async function listActors(req: VercelRequest, res: VercelResponse) {
  const search = req.query.search as string | undefined
  const useCase = new ListActorsUseCase(new PrismaActorRepository())
  const result = await useCase.execute({ search })
  if (!result.ok) return res.status(500).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function createActor(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateActorSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateActorUseCase(new PrismaActorRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(409).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function listProjects(req: VercelRequest, res: VercelResponse) {
  const useCase = new ListProjectsUseCase(new PrismaProjectRepository())
  const result = await useCase.execute()
  if (!result.ok) return res.status(500).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function dashboard(req: VercelRequest, res: VercelResponse) {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      castings: {
        orderBy: { createdAt: 'asc' },
        include: {
          rounds: {
            orderBy: { order: 'asc' },
            include: {
              submissions: {
                orderBy: { createdAt: 'desc' },
                include: { actor: true },
              },
            },
          },
        },
      },
    },
  })

  const tree = projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description ?? undefined,
    status: p.status,
    castings: p.castings.map(c => ({
      id: c.id,
      projectId: c.projectId,
      roleName: c.roleName,
      description: c.description ?? undefined,
      requirements: c.requirements ?? undefined,
      status: c.status,
      activePhase: c.activePhase,
      rounds: c.rounds.map(r => ({
        id: r.id,
        castingId: r.castingId,
        name: r.name,
        description: r.description ?? undefined,
        deadline: r.deadline ? r.deadline.toISOString() : undefined,
        order: r.order,
        status: r.status,
        submissions: r.submissions.map(s => ({
          id: s.id,
          actorId: s.actorId,
          actorName: s.actor.name,
          actorEmail: s.actor.email,
          videoUrl: s.videoUrl ?? '',
          thumbnailUrl: s.thumbnailUrl ?? undefined,
          notes: s.notes ?? undefined,
          status: s.status,
          feedback: s.feedback ?? undefined,
          transcript: s.transcript ?? undefined,
          aiScore: s.aiScore ?? undefined,
          aiFeedback: s.aiFeedback ?? undefined,
          createdAt: s.createdAt.toISOString(),
        })),
      })),
    })),
  }))

  return res.status(200).json(tree)
}

async function listCastings(req: VercelRequest, res: VercelResponse) {
  const actorId = req.query.actorId as string | undefined

  const castings = await prisma.casting.findMany({
    where: { status: 'open' },
    orderBy: { createdAt: 'asc' },
    include: {
      project: true,
      rounds: {
        orderBy: { order: 'asc' },
        include: { submissions: { orderBy: { createdAt: 'desc' } } },
      },
    },
  })

  const items = castings.map(c => {
    const round = c.rounds.find(r => r.status === 'open') ?? c.rounds[0]
    const submission = actorId && round ? round.submissions.find(s => s.actorId === actorId) : undefined
    return {
      id: c.id,
      title: c.roleName,
      projectName: c.project.title,
      role: c.roleName,
      deadline: round?.deadline ? round.deadline.toISOString() : undefined,
      status: c.status,
      roundId: round?.id,
      submission: submission
        ? {
            status: submission.status,
            feedback: submission.feedback ?? undefined,
            submittedAt: submission.createdAt.toISOString(),
          }
        : undefined,
    }
  })

  return res.status(200).json(items)
}

async function createProject(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateProjectSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateProjectUseCase(new PrismaProjectRepository(), new PrismaDirectorRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function closeProject(req: VercelRequest, res: VercelResponse) {
  const parsed = CloseProjectSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CloseProjectUseCase(new PrismaProjectRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function createCasting(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateCastingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateCastingUseCase(new PrismaCastingRepository(), new PrismaProjectRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function closeCasting(req: VercelRequest, res: VercelResponse) {
  const parsed = CloseCastingSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CloseCastingUseCase(new PrismaCastingRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function createRound(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateRoundSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateRoundUseCase(new PrismaRoundRepository(), new PrismaCastingRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function openRound(req: VercelRequest, res: VercelResponse) {
  const parsed = OpenRoundSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new OpenRoundUseCase(new PrismaRoundRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function closeRound(req: VercelRequest, res: VercelResponse) {
  const parsed = CloseRoundSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CloseRoundUseCase(new PrismaRoundRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function addAttachment(req: VercelRequest, res: VercelResponse) {
  const parsed = AddAttachmentSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new AddAttachmentUseCase(new PrismaAttachmentRepository(), new PrismaRoundRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function listAttachments(req: VercelRequest, res: VercelResponse) {
  const parsed = ListAttachmentsSchema.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new ListAttachmentsUseCase(new PrismaAttachmentRepository(), new PrismaRoundRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function removeAttachment(req: VercelRequest, res: VercelResponse, params: Record<string, string>) {
  return res.status(200).json({ id: params.id, removed: true })
}

async function createSubmission(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateSubmissionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateSubmissionUseCase(
    new PrismaSubmissionRepository(),
    new PrismaRoundRepository(),
    new PrismaCastingRepository(),
    new PrismaActorRepository(),
  )
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function uploadSubmission(req: VercelRequest, res: VercelResponse) {
  const parsed = ManualUploadSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new ManualUploadUseCase(new PrismaSubmissionRepository(), new PrismaRoundRepository(), new PrismaActorRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function reviewSubmission(req: VercelRequest, res: VercelResponse) {
  const parsed = ReviewSubmissionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new ReviewSubmissionUseCase(new PrismaSubmissionRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function analyzeSubmission(req: VercelRequest, res: VercelResponse) {
  const parsed = AnalyzeSubmissionSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new GenerateAIAnalysisUseCase(
    new PrismaSubmissionRepository(),
    new PrismaRoundRepository(),
    new PrismaCastingRepository(),
    new OpenAIAnalysisService(),
  )
  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    const err = result.error
    if (err instanceof AIServiceError) {
      return res.status(err.statusCode).json({ error: err.message })
    }
    if (err.message === 'Submission not found' || err.message === 'Submission has no video to analyze') {
      return res.status(404).json({ error: err.message })
    }
    return res.status(400).json({ error: err.message })
  }
  return res.status(200).json(result.data)
}

async function createComment(req: VercelRequest, res: VercelResponse) {
  const parsed = CreateCommentSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new CreateCommentUseCase(new PrismaCommentRepository(), new PrismaSubmissionRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(201).json(result.data)
}

async function listComments(req: VercelRequest, res: VercelResponse) {
  const parsed = ListCommentsSchema.safeParse(req.query)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new ListCommentsUseCase(new PrismaCommentRepository(), new PrismaSubmissionRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(400).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

/* ── New CRUD handlers ── */

async function updateActor(req: VercelRequest, res: VercelResponse, params: Record<string, string>) {
  const parsed = UpdateActorSchema.safeParse({ ...req.body, id: params.id })
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new UpdateActorUseCase(new PrismaActorRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(404).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function deleteActor(req: VercelRequest, res: VercelResponse, params: Record<string, string>) {
  const useCase = new DeleteActorUseCase(new PrismaActorRepository())
  const result = await useCase.execute(params.id)
  if (!result.ok) return res.status(404).json({ error: result.error.message })
  return res.status(200).json({ id: params.id, deleted: true })
}

async function updateProjectStatus(req: VercelRequest, res: VercelResponse, params: Record<string, string>) {
  const parsed = UpdateProjectStatusSchema.safeParse({ ...req.body, projectId: params.id })
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new UpdateProjectStatusUseCase(new PrismaProjectRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(404).json({ error: result.error.message })
  return res.status(200).json(result.data)
}

async function updateCastingPhase(req: VercelRequest, res: VercelResponse, params: Record<string, string>) {
  const parsed = UpdateCastingPhaseSchema.safeParse({ ...req.body, castingId: params.id })
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })
  const useCase = new UpdateCastingPhaseUseCase(new PrismaCastingRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) return res.status(404).json({ error: result.error.message })
  return res.status(200).json(result.data)
}
