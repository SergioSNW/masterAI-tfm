import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radii, spacing } from '../src/theme/colors'
import { GlassCard } from '../src/components/GlassCard'
import { GlassButton } from '../src/components/GlassButton'

interface FaqItem {
  q: string
  a: string
}

const SECTIONS: Array<{ title: string; items: FaqItem[] }> = [
  {
    title: 'Getting Started',
    items: [
      { q: 'What is MasterAI?', a: 'MasterAI is a casting platform that connects actors with casting directors. You can browse open casting roles, submit video auditions, and track your submissions — all from this app.' },
      { q: 'How do I find casting opportunities?', a: 'Your dashboard shows all open castings you can apply to. Tap any casting card to view the details, including the role description, project name, and submission deadline.' },
    ],
  },
  {
    title: 'Submissions',
    items: [
      { q: 'How do I submit an audition?', a: 'Tap a casting card to open the detail screen. If you haven\'t submitted yet, you\'ll see a "Not Submitted" message. A future update will add the video upload feature — for now, directors can upload on your behalf.' },
      { q: 'What happens after I submit?', a: 'Your submission enters "Pending Review" status. The director will watch your video and either shortlist you, mark it as reviewed, or reject it. You\'ll see the status update here in the app.' },
    ],
  },
  {
    title: 'Submission Statuses',
    items: [
      { q: 'What does "Pending" mean?', a: 'Your submission has been received and is waiting for the director to review it. No action needed on your end.' },
      { q: 'What does "Shortlisted" mean?', a: 'Great news! The director liked your submission and has shortlisted you. This typically means you\'ll be called for the next round (e.g. an in-person callback).' },
      { q: 'What does "Reviewed" mean?', a: 'The director has watched your submission. This is a neutral status — they\'ve seen it but haven\'t made a final decision yet.' },
      { q: 'What does "Rejected" mean?', a: 'Unfortunately the director has decided not to move forward with your submission for this role. Don\'t be discouraged — keep trying for other castings! Any feedback from the director will be shown on your submission detail screen.' },
    ],
  },
  {
    title: 'Feedback',
    items: [
      { q: 'How do I see director feedback?', a: 'Open the casting detail screen. If the director has left feedback, it will appear in the "Feedback" section under "Your Submission".' },
      { q: 'Can I reply to feedback?', a: 'Not yet. A future update will add the ability to reply to director feedback and have a conversation thread.' },
    ],
  },
  {
    title: 'Profile',
    items: [
      { q: 'How do I update my profile?', a: 'Tap your avatar or name in the dashboard header to open your profile sheet. You can edit your name, email, phone, location, and agent information.' },
      { q: 'Are my changes saved?', a: 'Profile changes are saved to the system and will persist across sessions.' },
    ],
  },
]

export default function ActorGuide() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassButton title="← Back" onPress={() => router.back()} variant="ghost" style={{ alignSelf: 'flex-start', marginBottom: spacing.md }} />

        <Text style={styles.title}>Actor Guide</Text>
        <Text style={styles.subtitle}>How to use the MasterAI casting platform</Text>

        {SECTIONS.map(section => (
          <GlassCard key={section.title} style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <FaqRow key={item.q} item={item} isLast={i === section.items.length - 1} />
            ))}
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

function FaqRow({ item, isLast }: { item: FaqItem; isLast: boolean }) {
  return (
    <View style={[faqStyles.row, isLast && faqStyles.last]}>
      <Text style={faqStyles.question}>{item.q}</Text>
      <Text style={faqStyles.answer}>{item.a}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent['1'],
    marginBottom: spacing.sm,
  },
})

const faqStyles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  last: {
    borderBottomWidth: 0,
  },
  question: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  answer: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
})
