import { render, fireEvent } from '@testing-library/react-native'
import { AvatarChip } from '../../src/components/AvatarChip'

describe('AvatarChip', () => {
  it('renders the name text', () => {
    const { getByText } = render(<AvatarChip name="Alex Rivera" onPress={() => {}} />)
    expect(getByText('Alex Rivera')).toBeTruthy()
  })

  it('displays correct initials', () => {
    const { getByText } = render(<AvatarChip name="Alex Rivera" onPress={() => {}} />)
    expect(getByText('AR')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    const { getByText } = render(<AvatarChip name="Alex Rivera" onPress={onPress} />)
    fireEvent.press(getByText('Alex Rivera'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('hides name and chevron in compact mode', () => {
    const { queryByText } = render(<AvatarChip name="Alex Rivera" onPress={() => {}} compact />)
    expect(queryByText('Alex Rivera')).toBeNull()
    expect(queryByText('›')).toBeNull()
  })

  it('still shows initials in compact mode', () => {
    const { getByText } = render(<AvatarChip name="Alex Rivera" onPress={() => {}} compact />)
    expect(getByText('AR')).toBeTruthy()
  })

  it('handles single-word names', () => {
    const { getByText } = render(<AvatarChip name="Madonna" onPress={() => {}} />)
    expect(getByText('M')).toBeTruthy()
  })

  it('handles names with more than two parts', () => {
    const { getByText } = render(<AvatarChip name="Jean Luc Picard" onPress={() => {}} />)
    expect(getByText('JL')).toBeTruthy()
  })
})
