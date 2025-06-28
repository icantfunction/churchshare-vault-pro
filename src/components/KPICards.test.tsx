
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import KPICards from './KPICards'
import { useRealtimeKPIs } from '@/hooks/useRealtimeKPIs'
import { useAuth } from '@/contexts/AuthContext'

// Mock the hooks
vi.mock('@/hooks/useRealtimeKPIs', () => ({
  useRealtimeKPIs: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('KPICards', () => {
  const mockKPIData = {
    totalFiles: 25,
    totalSize: 1073741824, // 1GB in bytes
    recentFiles: 5,
    loading: false,
  }

  const mockRefreshKPIs = vi.fn()

  beforeEach(() => {
    vi.mocked(useRealtimeKPIs).mockReturnValue({
      kpiData: mockKPIData,
      refreshKPIs: mockRefreshKPIs,
    })
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'Member' },
    } as any)
  })

  it('renders KPI cards correctly for regular user', () => {
    render(<KPICards />)
    
    expect(screen.getByText('My Files')).toBeInTheDocument()
    expect(screen.getByText('My Storage Used')).toBeInTheDocument()
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('1 GB')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders different titles for admin users', () => {
    vi.mocked(useAuth).mockReturnValue({
      profile: { role: 'Admin' },
    } as any)

    render(<KPICards />)
    
    expect(screen.getByText('Total Files')).toBeInTheDocument()
    expect(screen.getByText('Organization Storage')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(useRealtimeKPIs).mockReturnValue({
      kpiData: { ...mockKPIData, loading: true },
      refreshKPIs: mockRefreshKPIs,
    })

    render(<KPICards />)
    
    expect(screen.getAllByText('...')).toHaveLength(3)
  })

  it('formats file sizes correctly', () => {
    vi.mocked(useRealtimeKPIs).mockReturnValue({
      kpiData: { ...mockKPIData, totalSize: 1024 }, // 1KB
      refreshKPIs: mockRefreshKPIs,
    })

    render(<KPICards />)
    
    expect(screen.getByText('1 KB')).toBeInTheDocument()
  })
})
