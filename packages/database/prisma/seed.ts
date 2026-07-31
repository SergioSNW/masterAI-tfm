import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const actors = [
  { name: 'Alice Anderson', email: 'alice.anderson@example.com', phone: '+1 (555) 101-0001', bio: 'Classically trained actress with 10+ years in theatre and film.' },
  { name: 'Benjamin Blake', email: 'benjamin.blake@example.com', phone: '+1 (555) 101-0002', bio: 'Character actor specializing in period dramas and voice work.' },
  { name: 'Camila Cortez', email: 'camila.cortez@example.com', phone: '+1 (555) 101-0003', bio: 'Award-winning dancer turned actress. Fluent in Spanish and English.' },
  { name: 'David Chen', email: 'david.chen@example.com', phone: '+1 (555) 101-0004', bio: 'Martial arts performer with stunt coordination experience.' },
  { name: 'Elena Fischer', email: 'elena.fischer@example.com', phone: '+1 (555) 101-0005', bio: 'German-born actress known for intense psychological roles.' },
  { name: 'Felix Gutierrez', email: 'felix.gutierrez@example.com', phone: '+1 (555) 101-0006', bio: 'Comedic actor and improviser. Regular at Upright Citizens Brigade.' },
  { name: 'Grace Huang', email: 'grace.huang@example.com', phone: '+1 (555) 101-0007', bio: 'Classical pianist and actress. Recent graduate of Juilliard.' },
  { name: 'Henry Irving', email: 'henry.irving@example.com', phone: '+1 (555) 101-0008', bio: 'Veteran stage actor with Shakespeare company credits.' },
  { name: 'Isabella Jensen', email: 'isabella.jensen@example.com', phone: '+1 (555) 101-0009', bio: 'Young rising star. Known for indie film festival circuit.' },
  { name: 'Jameson King', email: 'jameson.king@example.com', phone: '+1 (555) 101-0010', bio: 'Action and adventure genre specialist. Experienced in green screen work.' },
  { name: 'Katherine Lee', email: 'katherine.lee@example.com', phone: '+1 (555) 101-0011', bio: 'Voice actress for major animation studios. Also does ADR work.' },
  { name: 'Leonardo Martinez', email: 'leonardo.martinez@example.com', phone: '+1 (555) 101-0012', bio: 'Method actor who immerses fully in every role. Bilingual.' },
  { name: 'Mia Nakamura', email: 'mia.nakamura@example.com', phone: '+1 (555) 101-0013', bio: 'International film star. Speaks Japanese, English, and French.' },
  { name: 'Nathaniel Okafor', email: 'nathaniel.okafor@example.com', phone: '+1 (555) 101-0014', bio: 'Nigerian-British actor with extensive TV drama credits.' },
  { name: 'Olivia Patel', email: 'olivia.patel@example.com', phone: '+1 (555) 101-0015', bio: 'Commercial and print model transitioning to film acting.' },
  { name: 'Pablo Quintana', email: 'pablo.quintana@example.com', phone: '+1 (555) 101-0016', bio: 'Tango instructor and actor. Specializes in Latin-themed productions.' },
  { name: 'Quinn Roberts', email: 'quinn.roberts@example.com', phone: '+1 (555) 101-0017', bio: 'Non-binary performer advocating for inclusive casting.' },
  { name: 'Rachel Singh', email: 'rachel.singh@example.com', phone: '+1 (555) 101-0018', bio: 'Bollywood crossover actress. Trained in Kathak dance.' },
  { name: 'Samuel Thompson', email: 'samuel.thompson@example.com', phone: '+1 (555) 101-0019', bio: 'Deep baritone voice. Narrates audiobooks and documentaries.' },
  { name: 'Tatiana Uvarova', email: 'tatiana.uvarova@example.com', phone: '+1 (555) 101-0020', bio: 'Russian ballet dancer turned screen actress.' },
  { name: 'Ulysses Vance', email: 'ulysses.vance@example.com', phone: '+1 (555) 101-0021', bio: 'Shakespearean actor with a modern twist. Also a playwright.' },
  { name: 'Valentina Williams', email: 'valentina.williams@example.com', phone: '+1 (555) 101-0022', bio: 'Singer-actress with Broadway credits. Soprano range.' },
  { name: 'William Xu', email: 'william.xu@example.com', phone: '+1 (555) 101-0023', bio: 'Rising star in action-comedy. Background in gymnastics.' },
  { name: 'Ximena Ybarra', email: 'ximena.ybarra@example.com', phone: '+1 (555) 101-0024', bio: 'Indie film darling. Known for naturalistic acting style.' },
  { name: 'Yuki Tanaka', email: 'yuki.tanaka@example.com', phone: '+1 (555) 101-0025', bio: 'Anime voice actor and motion capture performer.' },
  { name: 'Zara Osei', email: 'zara.osei@example.com', phone: '+1 (555) 101-0026', bio: 'Ghanaian-British actress. Active in social justice documentaries.' },
  { name: 'Aaron Blackwood', email: 'aaron.blackwood@example.com', phone: '+1 (555) 101-0027', bio: 'Gothic horror specialist. Known for atmospheric monologues.' },
  { name: 'Bianca Rinaldi', email: 'bianca.rinaldi@example.com', phone: '+1 (555) 101-0028', bio: 'Italian cinema actress. Expresses powerfully through physicality.' },
]

const demoDirector = {
  id: 'd1',
  email: 'director@masterai.demo',
  name: 'Demo Director',
  company: 'MasterAI Studio',
}

const demoActors = [
  { id: 'a1', name: 'Emma Richardson', email: 'emma.r@example.com', bio: 'Strong emotional range. Leading lady for period drama.' },
  { id: 'a2', name: 'James Whitfield', email: 'james.w@example.com', bio: 'Versatile character actor.' },
  { id: 'a3', name: 'Sophia Chen', email: 'sophia.c@example.com', bio: 'Good diction. Classically trained.' },
  { id: 'a4', name: 'Oliver Grant', email: 'oliver.g@example.com', bio: 'Young talent with fresh energy.' },
  { id: 'a5', name: 'Diana Moss', email: 'diana.m@example.com', bio: 'Stage and screen actress.' },
  { id: 'a6', name: 'Marcus Johnson', email: 'marcus.j@example.com', bio: 'Intense performance, very compelling.' },
  { id: 'a7', name: 'Lena Fischer', email: 'lena.f@example.com', bio: 'Rising star with a sharp presence.' },
]

interface DemoCasting {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: string
}

interface DemoRound {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: Date
  order: number
  status: string
}

interface DemoSubmission {
  id: string
  roundId: string
  actorId: string
  videoUrl?: string
  notes?: string
  status: string
  feedback?: string
  createdAt: Date
}

const demoProjects = [
  {
    id: 'p1',
    directorId: 'd1',
    title: 'The Crown — Season 3',
    description: 'Casting for new recurring characters and supporting roles for the upcoming season.',
    status: 'active',
  },
  {
    id: 'p2',
    directorId: 'd1',
    title: 'Breaking Bad — Season 2',
    description: 'Casting for new lab assistants and cartel contacts.',
    status: 'active',
  },
  {
    id: 'p3',
    directorId: 'd1',
    title: 'Stranger Things — Season 5',
    description: 'New characters for the final season. Multiple roles available.',
    status: 'draft',
  },
]

const demoCastings: DemoCasting[] = [
  { id: 'c1', projectId: 'p1', roleName: 'Lead Role — Lady Victoria', description: 'A sophisticated aristocrat navigating post-war British high society.', requirements: 'British accent, age 30-45, period drama experience', status: 'open' },
  { id: 'c2', projectId: 'p1', roleName: 'Supporting — Margaret', description: 'A sharp-tongued housekeeper with a hidden past.', requirements: 'Cockney accent a plus, age 40-60', status: 'open' },
  { id: 'c3', projectId: 'p2', roleName: 'Recurring — Chemist', description: 'A brilliant but unstable organic chemist.', requirements: 'Must be comfortable with intense scenes', status: 'open' },
]

const demoRounds: DemoRound[] = [
  { id: 'r1', castingId: 'c1', name: 'Self-Tape Submission', description: 'Submit a 2-minute monologue in character', deadline: new Date('2026-08-15T23:59:59Z'), order: 0, status: 'open' },
  { id: 'r2', castingId: 'c1', name: 'Callback — In-Person', description: 'Live audition with the director', deadline: new Date('2026-09-01T23:59:59Z'), order: 1, status: 'pending' },
  { id: 'r3', castingId: 'c2', name: 'Self-Tape Submission', description: 'Submit a 90-second scene', deadline: new Date('2026-08-20T23:59:59Z'), order: 0, status: 'open' },
  { id: 'r4', castingId: 'c3', name: 'Video Submission', description: 'Submit a cold read of provided script', deadline: new Date('2026-08-10T23:59:59Z'), order: 0, status: 'open' },
]

const demoSubmissions: DemoSubmission[] = [
  { id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: '#', notes: 'Strong emotional range', status: 'shortlisted', feedback: 'Excellent presence. Moving to callbacks.', createdAt: new Date('2026-07-10T00:00:00Z') },
  { id: 's2', roundId: 'r1', actorId: 'a2', videoUrl: '#', status: 'pending', createdAt: new Date('2026-07-11T00:00:00Z') },
  { id: 's3', roundId: 'r1', actorId: 'a3', videoUrl: '#', notes: 'Good diction but needs more depth', status: 'reviewed', createdAt: new Date('2026-07-09T00:00:00Z') },
  { id: 's4', roundId: 'r1', actorId: 'a4', videoUrl: '#', status: 'pending', createdAt: new Date('2026-07-12T00:00:00Z') },
  { id: 's5', roundId: 'r3', actorId: 'a5', videoUrl: '#', status: 'pending', createdAt: new Date('2026-07-11T00:00:00Z') },
  { id: 's6', roundId: 'r4', actorId: 'a6', videoUrl: '#', notes: 'Intense performance, very compelling', status: 'shortlisted', feedback: 'Great intensity. Moving to next round.', createdAt: new Date('2026-07-08T00:00:00Z') },
  { id: 's7', roundId: 'r4', actorId: 'a7', videoUrl: '#', status: 'pending', createdAt: new Date('2026-07-12T00:00:00Z') },
]

async function main() {
  const seedActors = actors.map(a => ({
    ...a,
    profilePictureUrl: `https://i.pravatar.cc/300?u=${encodeURIComponent(a.email)}`,
  }))

  for (const actor of seedActors) {
    await prisma.actor.upsert({
      where: { email: actor.email },
      update: actor,
      create: actor,
    })
  }

  await prisma.director.upsert({
    where: { id: demoDirector.id },
    update: demoDirector,
    create: demoDirector,
  })

  for (const actor of demoActors) {
    await prisma.actor.upsert({
      where: { id: actor.id },
      update: actor,
      create: actor,
    })
  }

  for (const project of demoProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    })
  }

  for (const casting of demoCastings) {
    await prisma.casting.upsert({
      where: { id: casting.id },
      update: casting,
      create: casting,
    })
  }

  for (const round of demoRounds) {
    await prisma.round.upsert({
      where: { id: round.id },
      update: round,
      create: round,
    })
  }

  for (const submission of demoSubmissions) {
    await prisma.submission.upsert({
      where: { id: submission.id },
      update: submission,
      create: submission,
    })
  }

  const actorCount = await prisma.actor.count()
  const projectCount = await prisma.project.count()
  const castingCount = await prisma.casting.count()
  const roundCount = await prisma.round.count()
  const submissionCount = await prisma.submission.count()
  console.log(`Seeded ${actorCount} actors, ${projectCount} projects, ${castingCount} castings, ${roundCount} rounds, ${submissionCount} submissions`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
