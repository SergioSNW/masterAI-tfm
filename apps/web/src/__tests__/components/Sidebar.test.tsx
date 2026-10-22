import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar, MenuButton } from '../../components/Sidebar'
import App from '../../App'

vi.mock('../../services/projectService', () => ({
  fetchDashboard: vi.fn().mockResolvedValue([]),
  createProject: vi.fn(),
}))

describe('Sidebar', () => {
  it('marks itself open and renders its children', () => {
    render(<Sidebar open onClose={() => {}}><button>Projects</button></Sidebar>)
    expect(screen.getByRole('complementary', { name: 'Main navigation' })).toHaveClass('open')
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('is not open when closed', () => {
    render(<Sidebar open={false} onClose={() => {}}>x</Sidebar>)
    expect(screen.getByLabelText('Main navigation')).not.toHaveClass('open')
  })

  it('closes from the X button, the backdrop and Escape', async () => {
    const onClose = vi.fn()
    render(<Sidebar open onClose={onClose}>x</Sidebar>)
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    await userEvent.click(screen.getByTestId('sidebar-backdrop'))
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('ignores Escape while closed', async () => {
    const onClose = vi.fn()
    render(<Sidebar open={false} onClose={onClose}>x</Sidebar>)
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('MenuButton', () => {
  it('exposes expanded state and triggers onClick', async () => {
    const onClick = vi.fn()
    render(<MenuButton open={false} onClick={onClick} />)
    const btn = screen.getByRole('button', { name: 'Open menu' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledOnce()
  })
})

describe('App shell menu', () => {
  it('opens from the hamburger and closes after navigating', async () => {
    render(<MemoryRouter initialEntries={['/actors']}><App /></MemoryRouter>)
    const sidebar = screen.getByLabelText('Main navigation')
    expect(sidebar).not.toHaveClass('open')

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(sidebar).toHaveClass('open')

    await userEvent.click(screen.getByRole('button', { name: /Docs/ }))
    expect(sidebar).not.toHaveClass('open')
  })

  it('closes after tapping the page you are already on', async () => {
    render(<MemoryRouter initialEntries={['/docs']}><App /></MemoryRouter>)
    const sidebar = screen.getByLabelText('Main navigation')
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.click(screen.getByRole('button', { name: /Docs/ }))
    expect(sidebar).not.toHaveClass('open')
  })

  it('closes with the X button', async () => {
    render(<MemoryRouter initialEntries={['/actors']}><App /></MemoryRouter>)
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getByLabelText('Main navigation')).not.toHaveClass('open')
  })
})
