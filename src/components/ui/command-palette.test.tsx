import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommandPalette } from '@/components/ui/command-palette';

describe('CommandPalette', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    render(<CommandPalette isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/type a command or search/i)).not.toBeInTheDocument();
  });

  it('renders command palette when isOpen is true', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText(/type a command or search/i)).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders action items', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.getByText('Invite Member')).toBeInTheDocument();
    expect(screen.getByText('Create Report')).toBeInTheDocument();
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('filters navigation items by search', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'overview' } });

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
  });

  it('filters action items by search', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'task' } });

    expect(screen.getByText('New Task')).toBeInTheDocument();
    expect(screen.queryByText('Invite Member')).not.toBeInTheDocument();
  });

  it('shows no results when filter matches nothing', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.change(input, { target: { value: 'nonexistent' } });

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const backdrop = screen.getByTestId('backdrop') || screen.getByRole('dialog')?.parentElement;
    // Click the overlay div
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
    if (overlay) {
      fireEvent.click(overlay);
    } else {
      // Find by the fact it's a div with onClick handler
      const divs = document.querySelectorAll('div[style*="background"]');
      divs.forEach(div => {
        if (div.classList.contains('fixed') && div.classList.contains('inset-0')) {
          fireEvent.click(div);
        }
      });
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders shortcuts for navigation items', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('⌘1')).toBeInTheDocument();
    expect(screen.getByText('⌘2')).toBeInTheDocument();
    expect(screen.getByText('⌘3')).toBeInTheDocument();
    expect(screen.getByText('⌘4')).toBeInTheDocument();
    expect(screen.getByText('⌘5')).toBeInTheDocument();
  });

  it('renders shortcuts for action items', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('⌘N')).toBeInTheDocument();
    expect(screen.getByText('⌘I')).toBeInTheDocument();
    expect(screen.getByText('⌘R')).toBeInTheDocument();
    expect(screen.getByText('⌘K')).toBeInTheDocument();
    expect(screen.getByText('⌘B')).toBeInTheDocument();
  });

  it('renders section headings', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('registers keydown listener on mount when open', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('removes keydown listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = render(<CommandPalette isOpen={true} onClose={mockOnClose} />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('calls onClose when ⌘K is pressed while open', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.keyDown(input, { key: 'k', metaKey: true });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Ctrl+K is pressed while open', () => {
    render(<CommandPalette isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText(/type a command or search/i);
    fireEvent.keyDown(input, { key: 'k', ctrlKey: true });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});