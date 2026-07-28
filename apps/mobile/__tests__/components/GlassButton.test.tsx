import { render, fireEvent } from '@testing-library/react-native'
import { GlassButton } from '../../src/components/GlassButton'

describe('GlassButton', () => {
  it('renders the title text', () => {
    const { getByText } = render(<GlassButton title="Submit" onPress={() => {}} />)
    expect(getByText('Submit')).toBeTruthy()
  })

  it('calls onPress when tapped', () => {
    const onPress = jest.fn()
    const { getByText } = render(<GlassButton title="Click Me" onPress={onPress} />)
    fireEvent.press(getByText('Click Me'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn()
    const { getByText } = render(<GlassButton title="Disabled" onPress={onPress} disabled />)
    fireEvent.press(getByText('Disabled'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
