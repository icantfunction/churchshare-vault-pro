
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from './SignInForm'
import { useToast } from '@/hooks/use-toast'

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}))

describe('SignInForm', () => {
  const mockProps = {
    email: '',
    password: '',
    setEmail: vi.fn(),
    setPassword: vi.fn(),
    loading: false,
    setLoading: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<SignInForm {...mockProps} />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<SignInForm {...mockProps} />)
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<SignInForm {...mockProps} email="invalid-email" />)
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  })

  it('calls setEmail when email input changes', async () => {
    const user = userEvent.setup()
    render(<SignInForm {...mockProps} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    expect(mockProps.setEmail).toHaveBeenCalledWith('test@example.com')
  })

  it('shows loading state correctly', () => {
    render(<SignInForm {...mockProps} loading={true} />)
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
