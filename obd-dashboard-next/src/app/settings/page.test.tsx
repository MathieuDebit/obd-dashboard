import { render, screen } from '@testing-library/react'
import Settings from '@/app/settings/page'
 
describe('Settings', () => {
  it('renders a heading', () => {
    render(<Settings />)
 
    const heading = screen.getByRole('heading', { level: 1 })
 
    expect(heading).toBeInTheDocument()
  })
})