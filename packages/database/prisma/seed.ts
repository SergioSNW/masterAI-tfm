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

  const count = await prisma.actor.count()
  console.log(`Seeded ${count} actors`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
