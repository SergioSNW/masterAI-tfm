import { useState } from 'react'
import {
  View, Text, TextInput, StyleSheet,
  TouchableOpacity, Modal, ScrollView,
} from 'react-native'
import { colors, radii, spacing } from '../theme/colors'
import { GlassButton } from './GlassButton'

interface Props {
  visible: boolean
  onClose: () => void
}

function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

interface Field {
  key: string
  label: string
  placeholder?: string
}

const FIELDS: Field[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone', placeholder: '+1 555 123 456' },
  { key: 'location', label: 'Location', placeholder: 'Los Angeles, CA' },
  { key: 'agent', label: 'Agent', placeholder: 'Not represented' },
]

export function ProfileSheet({ visible, onClose }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({
    name: 'Alex Rivera',
    email: 'alex@example.com',
    phone: '+1 555 123 456',
    location: 'Los Angeles, CA',
    agent: '',
  })

  function startEditing() {
    setEditing(true)
  }

  function save() {
    setEditing(false)
  }

  function cancel() {
    setDraft({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '+1 555 123 456',
      location: 'Los Angeles, CA',
      agent: draft.agent,
    })
    setEditing(false)
  }

  function setValue(key: string, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarInitials}>{initials(draft.name || 'Alex Rivera')}</Text>
            </View>
          </View>

          <ScrollView style={styles.fields} contentContainerStyle={styles.fieldsContent}>
            {FIELDS.map(field => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                {editing ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={draft[field.key]}
                    onChangeText={v => setValue(field.key, v)}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="none"
                  />
                ) : (
                  <Text style={[styles.fieldValue, !draft[field.key] && styles.fieldEmpty]}>
                    {draft[field.key] || field.placeholder || '—'}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            {editing ? (
              <View style={styles.footerRow}>
                <View style={styles.footerHalf}>
                  <GlassButton title="Cancel" onPress={cancel} variant="ghost" />
                </View>
                <View style={styles.footerHalf}>
                  <GlassButton title="Save" onPress={save} variant="primary" />
                </View>
              </View>
            ) : (
              <GlassButton title="Edit Profile" onPress={startEditing} variant="primary" />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'rgba(20,20,30,0.95)',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderBottomWidth: 0,
    padding: spacing.xl,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.text.secondary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accent['1'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  fields: {
    flexGrow: 0,
  },
  fieldsContent: {
    gap: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    width: 80,
    flexShrink: 0,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
  },
  fieldEmpty: {
    color: colors.text.tertiary,
    fontWeight: '400',
  },
  fieldInput: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.glass.bg,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  footer: {
    marginTop: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerHalf: {
    flex: 1,
  },
})
