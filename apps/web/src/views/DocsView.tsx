export function DocsView() {
  return (
    <div className="animate-in">
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Documentation</h1>
          <p>Architecture, tech stack, data model, and API reference</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>

        {/* ── Architecture ── */}
        <Section title="Architecture Overview">
          <p>MasterAI uses a strict <strong>Clean Architecture</strong> pattern with four isolated layers. Dependencies point inward — the core has no knowledge of frameworks, databases, or APIs.</p>
          <LayerDiagram />
          <p>The frontend is split into two apps sharing a single monorepo: a <strong>React/Vite SPA</strong> for casting directors and an <strong>Expo (React Native)</strong> app for actors. Both communicate with the same set of <strong>Vercel Serverless Functions</strong> that sit in front of a <strong>Prisma</strong>-managed PostgreSQL database on <strong>Neon.tech</strong>.</p>
        </Section>

        {/* ── Tech Stack ── */}
        <Section title="Tech Stack">
          <TwoCol>
            <TechCard icon="⚛️" title="Frontend (Director)" items={['React 19 + Vite', 'TypeScript strict', 'Hash-based SPA routing', 'visionOS glass design']} />
            <TechCard icon="📱" title="Frontend (Actor)" items={['Expo SDK 52', 'React Native + expo-router', 'Same glass design system', 'Compiles to web + native']} />
            <TechCard icon="⚡" title="Backend" items={['Vercel Serverless Functions', '11 API endpoints (REST)', 'Zod validation on all inputs', '10s max duration']} />
            <TechCard icon="🗄️" title="Data" items={['Neon.tech PostgreSQL', 'Prisma ORM (6 models)', 'Base64 video in bytea columns', 'Connection pooling via pgBouncer']} />
            <TechCard icon="🔧" title="Infrastructure" items={['npm workspaces monorepo', '7 packages across 4 layers', 'n8n for workflow orchestration', 'Vercel + GitHub CI']} />
          </TwoCol>
        </Section>

        {/* ── Data Model ── */}
        <Section title="Data Model">
          <p style={{ marginBottom: 16 }}>Six models form the core schema. The relationship chain is: <strong>Director → Project → Casting → Round → Submission ↔ Actor</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ERDTable name="Director" fields={['id (UUID, PK)', 'email (unique)', 'name', 'company?', 'phone?', 'timestamps']} color="#6366f1" />
            <ERDArrow />
            <ERDTable name="Project" fields={['id (UUID, PK)', 'directorId (FK → Director)', 'title', 'description?', 'status (draft|active|closed)', 'timestamps']} color="#a855f7" />
            <ERDArrow />
            <ERDTable name="Casting" fields={['id (UUID, PK)', 'projectId (FK → Project)', 'roleName', 'description?', 'requirements?', 'status (open|closed|cancelled)', 'timestamps']} color="#ec4899" />
            <ERDArrow />
            <ERDTable name="Round" fields={['id (UUID, PK)', 'castingId (FK → Casting)', 'name', 'description?', 'deadline?', 'order (int)', 'status (pending|open|closed)', 'timestamps']} color="#22c55e" />
            <ERDArrow />
            <ERDTable name="Submission" fields={['id (UUID, PK)', 'roundId (FK → Round)', 'actorId (FK → Actor)', 'videoUrl (bytea as Base64)', 'thumbnailUrl?', 'notes?', 'status (pending|reviewed|shortlisted|rejected)', 'feedback?', 'timestamps']} color="#eab308" />
            <ERDArrow style={{ opacity: 0.3 }} />
            <ERDTable name="Actor" fields={['id (UUID, PK)', 'email (unique)', 'name', 'profilePictureUrl?', 'phone?', 'timestamps']} color="#6366f1" />
          </div>
        </Section>

        {/* ── API Reference ── */}
        <Section title="API Reference">
          <p style={{ marginBottom: 16 }}>All endpoints are Vercel serverless functions at <code style={codeStyle}>/api/*</code>. Every write endpoint validates input with Zod and returns a <code style={codeStyle}>Result{'<'}T{'>'}</code> discriminated union.</p>
          <Endpoint method="GET" path="/api/actors" desc="List all actors. Optional ?search= query for name/email filter." />
          <Endpoint method="POST" path="/api/actors/create" desc="Create a new actor. Validates unique email." body='{ "name": string, "email": string, "phone"?: string }' />
          <Endpoint method="POST" path="/api/projects/create" desc="Create a project. directorId must reference an existing director." />
          <Endpoint method="POST" path="/api/projects/close" desc="Close a project. Validates ownership." />
          <Endpoint method="POST" path="/api/castings/create" desc="Create a casting. The referenced project must be active." />
          <Endpoint method="POST" path="/api/castings/close" desc="Close an open casting." />
          <Endpoint method="POST" path="/api/rounds/create" desc="Create a round under an open casting." />
          <Endpoint method="POST" path="/api/rounds/open" desc="Open a pending round." />
          <Endpoint method="POST" path="/api/rounds/close" desc="Close an open round." />
          <Endpoint method="POST" path="/api/submissions/upload" desc="Manual video upload. Base64, max 5MB, .mp4/.mov/.webm only." />
          <Endpoint method="POST" path="/api/submissions/review" desc="Review a submission. Status can be reviewed, shortlisted, or rejected." />
        </Section>

        {/* ── Clean Architecture ── */}
        <Section title="Clean Architecture Layers">
          <TwoCol>
            <TechCard icon="📦" title="Core (packages/core)" items={['Entity interfaces (6 types)', 'Use case classes (12)', 'Repository interfaces (6)', 'Result<T> discriminated union', 'Zero external dependencies']} />
            <TechCard icon="🔌" title="Infrastructure (packages/infrastructure)" items={['Prisma schema & client', 'Prisma repo implementations', 'Zod validation schemas', 'Depends on Core only']} />
            <TechCard icon="🌐" title="API (api/)" items={['11 Vercel serverless functions', 'Zod → Use Case → Response', 'No Express, no routing lib', '10s timeout, stateless']} />
            <TechCard icon="🖥️" title="Web App (apps/web)" items={['React 19 + Vite SPA', 'Hash routing (no react-router)', 'visionOS glass design system', '5 views + 2 modals']} />
          </TwoCol>
        </Section>

      </div>
    </div>
  )
}

/* ── sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card glass" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, letterSpacing: -0.3 }}>{title}</h2>
      {children}
    </div>
  )
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
      {children}
    </div>
  )
}

function TechCard({ icon, title, items }: { icon: string; title: string; items: string[] }) {
  return (
    <div className="glass" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</h4>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => (
          <li key={item} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 0 }}>· {item}</li>
        ))}
      </ul>
    </div>
  )
}

function LayerDiagram() {
  const layers = [
    { name: 'UI (React/Expo)', color: '#6366f1', detail: 'SPA + mobile app' },
    { name: 'API (Vercel Functions)', color: '#a855f7', detail: 'REST endpoints' },
    { name: 'Use Cases', color: '#ec4899', detail: 'Business logic' },
    { name: 'Entities', color: '#22c55e', detail: 'Domain types' },
    { name: 'Infrastructure', color: '#eab308', detail: 'DB + validation' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, margin: '16px 0 20px' }}>
      {layers.map((layer, i) => (
        <div key={layer.name} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 16px', borderRadius: 'var(--radius-sm)',
          background: `${layer.color}15`, border: `1px solid ${layer.color}30`,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: layer.color, flexShrink: 0 }} />
          <div style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{layer.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{layer.detail}</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>L{layers.length - i}</div>
        </div>
      ))}
    </div>
  )
}

function ERDTable({ name, fields, color }: { name: string; fields: string[]; color: string }) {
  return (
    <div style={{
      padding: '12px 16px', borderRadius: 'var(--radius-sm)',
      background: `${color}10`, border: `1px solid ${color}25`,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color, marginBottom: 6 }}>{name}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {fields.map(f => (
          <div key={f} style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 8 }}>{f}</div>
        ))}
      </div>
    </div>
  )
}

function ERDArrow({ style }: { style?: React.CSSProperties }) {
  return <div style={{ textAlign: 'center', fontSize: 16, color: 'var(--text-tertiary)', lineHeight: '12px', ...style }}>↓</div>
}

const codeStyle: React.CSSProperties = {
  fontFamily: 'monospace', fontSize: 12,
  background: 'var(--glass-bg)', padding: '2px 6px', borderRadius: 4,
  color: 'var(--accent-2)',
}

function Endpoint({ method, path, desc, body }: { method: string; path: string; desc: string; body?: string }) {
  return (
    <div className="glass" style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 8,
    }}>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
        background: method === 'GET' ? '#22c55e20' : '#6366f120',
        color: method === 'GET' ? '#22c55e' : '#6366f1',
        flexShrink: 0, fontFamily: 'monospace',
      }}>{method}</span>
      <div style={{ flex: 1 }}>
        <code style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{path}</code>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>
        {body && <pre style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, fontFamily: 'monospace' }}>{body}</pre>}
      </div>
    </div>
  )
}
