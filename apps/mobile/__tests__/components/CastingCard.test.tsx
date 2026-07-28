import { render, fireEvent } from '@testing-library/react-native'
import { CastingCard } from '../../src/components/CastingCard'
import type { CastingDTO } from '../../src/services/types'

const mockCasting: CastingDTO = {
  id: '1',
  title: 'Lead Role — Feature Film',
  projectName: 'Eclipse',
  role: 'Lead Actor',
  deadline: 'Aug 15, 2026',
  status: 'open',
  roundId: 'r1',
}

describe('CastingCard', () => {
  it('renders the casting title', () => {
    const { getByText } = render(<CastingCard casting={mockCasting} />)
    expect(getByText('Lead Role — Feature Film')).toBeTruthy()
  })

  it('renders the project name', () => {
    const { getByText } = render(<CastingCard casting={mockCasting} />)
    expect(getByText('Eclipse')).toBeTruthy()
  })

  it('renders role and deadline', () => {
    const { getByText } = render(<CastingCard casting={mockCasting} />)
    expect(getByText('Lead Actor')).toBeTruthy()
    expect(getByText('Closes Aug 15, 2026')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    const { getByText } = render(<CastingCard casting={mockCasting} onPress={onPress} />)
    fireEvent.press(getByText('Lead Role — Feature Film'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('renders without onPress', () => {
    const { getByText } = render(<CastingCard casting={mockCasting} />)
    expect(getByText('Eclipse')).toBeTruthy()
  })

  it('applies different gradient colors based on index', () => {
    const { rerender } = render(<CastingCard casting={mockCasting} index={0} />)
    rerender(<CastingCard casting={mockCasting} index={1} />)
    rerender(<CastingCard casting={mockCasting} index={2} />)
  })
})
