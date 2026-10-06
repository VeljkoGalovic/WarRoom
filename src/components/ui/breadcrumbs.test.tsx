import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import * as nextNavigation from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('Breadcrumbs', () => {
  const mockUsePathname = vi.mocked(nextNavigation.usePathname);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home link for root dashboard path', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Breadcrumbs />);

    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/dashboard');
  });

  it('renders breadcrumb for single segment - last item is current page (not a link)', () => {
    mockUsePathname.mockReturnValue('/dashboard/resources');

    render(<Breadcrumbs />);

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    const resourcesText = screen.getByText('Resources');
    expect(resourcesText).toBeInTheDocument();
    expect(resourcesText.tagName).toBe('SPAN');
    expect(resourcesText).toHaveAttribute('aria-current', 'page');
    // Should not be a link
    expect(screen.queryByRole('link', { name: /resources/i })).not.toBeInTheDocument();
  });

  it('renders breadcrumb for nested path', () => {
    mockUsePathname.mockReturnValue('/dashboard/team/members');

    render(<Breadcrumbs />);

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    const teamLink = screen.getByRole('link', { name: /team/i });
    expect(teamLink).toBeInTheDocument();
    expect(teamLink).toHaveAttribute('href', '/dashboard/team');
    expect(screen.getByText('Members')).toBeInTheDocument();
    expect(screen.getByText('Members')).toHaveAttribute('aria-current', 'page');
  });

  it('formats labels correctly (capitalizes words) - last item is current page', () => {
    mockUsePathname.mockReturnValue('/dashboard/api-keys');

    render(<Breadcrumbs />);

    const apiKeysText = screen.getByText('Api Keys');
    expect(apiKeysText).toBeInTheDocument();
    expect(apiKeysText.tagName).toBe('SPAN');
    expect(apiKeysText).toHaveAttribute('aria-current', 'page');
  });

  it('formats labels with hyphens correctly - last item is current page', () => {
    mockUsePathname.mockReturnValue('/dashboard/new-task');

    render(<Breadcrumbs />);

    const newTaskText = screen.getByText('New Task');
    expect(newTaskText).toBeInTheDocument();
    expect(newTaskText.tagName).toBe('SPAN');
    expect(newTaskText).toHaveAttribute('aria-current', 'page');
  });

  it('shows chevron separators between items', () => {
    mockUsePathname.mockReturnValue('/dashboard/team/members');

    render(<Breadcrumbs />);

    // Find chevrons by the icon component
    const chevrons = document.querySelectorAll('[data-testid="icon-chevron-right"]');
    // There should be 2 chevrons (Home > Team, Team > Members)
    expect(chevrons.length).toBeGreaterThanOrEqual(2);
  });

  it('marks last item as current page with aria-current', () => {
    mockUsePathname.mockReturnValue('/dashboard/settings');

    render(<Breadcrumbs />);

    const currentPage = screen.getByText('Settings');
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('applies truncate class to last item when there are multiple items', () => {
    mockUsePathname.mockReturnValue('/dashboard/very-long-path-segment');

    render(<Breadcrumbs />);

    const lastItem = screen.getByText('Very Long Path Segment');
    expect(lastItem).toHaveClass('truncate');
    expect(lastItem).toHaveClass('max-w-[200px]');
  });

  it('does not apply truncate to single item', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Breadcrumbs />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).not.toHaveClass('truncate');
  });

  it('home link has Home icon', () => {
    mockUsePathname.mockReturnValue('/dashboard');

    render(<Breadcrumbs />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    const svg = homeLink.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders ordered list with role list', () => {
    mockUsePathname.mockReturnValue('/dashboard/team/members');

    render(<Breadcrumbs />);

    const ol = screen.getByRole('list');
    expect(ol).toBeInTheDocument();
  });

  it('links have correct hover styles', () => {
    mockUsePathname.mockReturnValue('/dashboard/resources');

    render(<Breadcrumbs />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveClass('hover:text-foreground');
    // The last item (Resources) is not a link, it's a span
    const resourcesText = screen.getByText('Resources');
    expect(resourcesText.tagName).toBe('SPAN');
  });

  it('current page is not a link', () => {
    mockUsePathname.mockReturnValue('/dashboard/reports');

    render(<Breadcrumbs />);

    const reportsText = screen.getByText('Reports');
    expect(reportsText.tagName).toBe('SPAN');
    expect(reportsText).not.toHaveAttribute('href');
  });
});