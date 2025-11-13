import { render, screen } from '@testing-library/react'
import Settings from '@/app/settings/page'
import { ThemeProvider } from '@/app/ThemeContext'
 
describe('Settings', () => {
  it('renders the settings tabs and controls', () => {
    render(
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    )
 
    expect(screen.getByRole('tab', { name: /General/i })).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })
})
