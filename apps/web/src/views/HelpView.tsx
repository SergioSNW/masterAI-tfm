export function HelpView() {
  return (
    <div className="animate-in">
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Director Guide</h1>
          <p>How to manage castings, review submissions, and collaborate with actors</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>

        {/* ── Getting Started ── */}
        <HelpSection title="Getting Started">
          <p>The director dashboard is your control centre for managing casting projects. From here you can create projects, define casting roles, set up submission rounds, and review actor submissions.</p>
          <div className="glass" style={{ padding: 16, borderRadius: 'var(--radius-md)', marginTop: 12 }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Key concepts</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}>
              <li><strong>Project</strong> — A production (e.g. "The Crown — Season 3"). Contains multiple castings.</li>
              <li><strong>Casting</strong> — A specific role you're hiring for (e.g. "Lead Role — Lady Victoria").</li>
              <li><strong>Round</strong> — A stage of the casting process (e.g. "Self-Tape Submission", "Callback").</li>
              <li><strong>Submission</strong> — An actor's video submission for a round.</li>
            </ul>
          </div>
        </HelpSection>

        {/* ── Projects ── */}
        <HelpSection title="Managing Projects">
          <p>Projects are the top-level container for your casting workflow.</p>
          <FeatureList items={[
            ['Creating a project', 'Click "+ New Project" in the Projects view. Enter a title and optional description. Projects are created in "active" status by default.'],
            ['Viewing project details', 'Click any project card to see its castings. The detail view shows all roles being cast and the number of rounds per casting.'],
            ['Project statuses', <span key="ps"><strong>Draft</strong> — still being set up. <strong>Active</strong> — accepting submissions. <strong>Closed</strong> — casting is complete.</span>],
          ]} />
        </HelpSection>

        {/* ── Casting Roles ── */}
        <HelpSection title="Defining Casting Roles">
          <p>A casting represents a specific role you need to fill. Each casting sits under a project and contains one or more rounds.</p>
          <FeatureList items={[
            ['Creating a casting', 'From the project detail view, click "+ New Casting". Provide the role name, description, and any requirements (e.g. "British accent, age 30-45").'],
            ['Requirements field', `Use this to communicate what you're looking for. Actors will see this when they view the casting.`],
            ['Casting status', <span key="cs"><strong>Open</strong> — actors can submit. <strong>Closed</strong> — no longer accepting. <strong>Cancelled</strong> — role has been cut.</span>],
          ]} />
        </HelpSection>

        {/* ── Rounds ── */}
        <HelpSection title="Setting Up Rounds">
          <p>Rounds structure your casting process into stages. Each round can have its own deadline and set of submissions.</p>
          <FeatureList items={[
            ['Creating a round', 'From the casting detail view, click "+ New Round". Set a name, description, and deadline. Rounds are ordered (0, 1, 2...).'],
            ['Round statuses', <span key="rs"><strong>Pending</strong> — not yet open for submissions. <strong>Open</strong> — accepting submissions. <strong>Closed</strong> — submissions locked.</span>],
            ['Opening a round', `Change a round from "pending" to "open" when you're ready to receive submissions. Only open rounds accept uploads.`],
          ]} />
        </HelpSection>

        {/* ── Reviewing ── */}
        <HelpSection title="Reviewing Submissions">
          <p>The review workflow is the core of the director experience. Every submission can be reviewed, shortlisted, or rejected with optional feedback.</p>
          <FeatureList items={[
            ['Viewing submissions', 'Navigate to a round to see all submissions in a list. Click any submission card to open the review modal.'],
            ['Playing videos', 'The review modal shows a video player for uploaded submissions. If the video is mock data, a placeholder is shown.'],
            ['Giving feedback', 'Type your feedback in the text area. This is saved when you Shortlist, Mark Reviewed, or Reject.'],
            ['Shortlisting', 'Marks the submission with a green badge. Shortlisted actors are moved to the next round.'],
            ['Marking as reviewed', `A neutral review status. Use this when you've watched the submission but haven't decided yet.`],
            ['Rejecting', 'Marks the submission with a red badge. The actor will see the rejection status and any feedback you provided.'],
            ['Stats bar', 'The stats bar at the top shows counts for Total, Pending, Shortlisted, Reviewed, and Rejected — updated in real time as you review.'],
            ['Internal comments', 'Use the Comments section in the review modal to leave internal notes visible to your team. Comments persist alongside the submission and are loaded each time you open the modal.'],
          ]} />
        </HelpSection>

        {/* ── Actors ── */}
        <HelpSection title="Managing Actors">
          <p>The Actors view lets you browse, search, and register actors in the system.</p>
          <FeatureList items={[
            ['Registering an actor', 'Click "+ New Actor" and fill in the form (name and email required). The actor is added to the system and can be selected in upload forms.'],
            ['Searching actors', 'Use the search bar to filter by name or email. Results update as you type.'],
            ['Actor profiles', 'Each actor card shows their name, email, phone number, and join date. Click for more details (coming soon).'],
          ]} />
        </HelpSection>

        {/* ── Uploads ── */}
        <HelpSection title="Uploading Videos">
          <p>When a round is open, you can manually upload video submissions on behalf of actors.</p>
          <FeatureList items={[
            ['Upload flow', 'Open a round and click "+ Upload Video". Select an actor from the dropdown, choose a video file (.mp4, .mov, .webm), and add optional notes.'],
            ['File size limit', 'The system enforces a 5MB limit for uploads. Files are encoded as Base64 and stored in the database.'],
            ['Video preview', 'After upload, the video can be played directly in the review modal.'],
          ]} />
        </HelpSection>

        {/* ── Attachments ── */}
        <HelpSection title="Round Attachments">
          <p>Attach scripts, contracts, or reference materials to any round. Actors can view and download these files from the mobile app.</p>
          <FeatureList items={[
            ['Adding an attachment', 'Open a round and click "+ Upload File" in the Attachments section. Select a PDF, image, or text file. The 10MB limit applies.'],
            ['Supported formats', 'PDF documents, PNG/JPEG images, and plain text files are supported. Files are stored as Base64 in the database.'],
            ['Downloading', 'Each attachment has a Download button. Click it to save the file locally. Actors see an "Open" button in their app.'],
          ]} />
        </HelpSection>

        {/* ── Settings ── */}
        <HelpSection title="Profile Settings">
          <p>The Settings page lets you update your director profile information.</p>
          <FeatureList items={[
            ['Editing your name', 'Change your display name in the Settings form. It updates immediately in the topbar.'],
            ['Editing your email', 'Update your email address. Changes are saved locally and persist across sessions.'],
          ]} />
        </HelpSection>

      </div>
    </div>
  )
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card glass" style={{ padding: 28, borderRadius: 'var(--radius-lg)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, letterSpacing: -0.3 }}>{title}</h2>
      {children}
    </div>
  )
}

function FeatureList({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {items.map(([title, desc]) => (
        <div key={title} className="glass" style={{
          padding: '14px 16px', borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
        </div>
      ))}
    </div>
  )
}
