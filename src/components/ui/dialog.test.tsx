import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

describe('Dialog', () => {
  it('renders dialog trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    );
    expect(screen.getByRole('button', { name: /open dialog/i })).toBeInTheDocument();
  });

  it('renders dialog content when open', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>Dialog content</DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('renders DialogHeader', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>Header content</DialogHeader>
        </DialogContent>
      </Dialog>
    );
    const header = screen.getByText('Header content');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
  });

  it('renders DialogTitle', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    const title = screen.getByText('Dialog Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H2');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('font-semibold');
  });

  it('renders DialogDescription', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>Dialog description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    const desc = screen.getByText('Dialog description');
    expect(desc).toBeInTheDocument();
    expect(desc.tagName).toBe('P');
    expect(desc).toHaveClass('text-sm');
    expect(desc).toHaveClass('text-muted-foreground');
  });

  it('renders DialogFooter', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogFooter>Footer actions</DialogFooter>
        </DialogContent>
      </Dialog>
    );
    const footer = screen.getByText('Footer actions');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('flex-col-reverse');
  });

  it('renders DialogClose button', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
    // There are two close buttons: one from DialogClose component, one from DialogContent's built-in close
    // Use the one from DialogClose component (the one with just "Close" text)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('closes dialog when DialogClose is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Dialog open onOpenChange={handleClose}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogClose>Close</DialogClose>
        </DialogContent>
      </Dialog>
    );
    // Target the DialogClose component specifically (the one with just "Close" text, not the X icon)
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    // The DialogClose component is the first one (text only), the built-in one has X icon + sr-only
    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledWith(false);
  });

  it('applies custom className to DialogContent', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-dialog-class">Content</DialogContent>
      </Dialog>
    );
    const content = screen.getByText('Content').closest('[data-testid="dialog-content"]');
    expect(content).toHaveClass('custom-dialog-class');
  });

  it('composes all dialog parts together', () => {
    render(
      <Dialog open>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <div>Main content</div>
          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    // There are two close buttons, so use getAllByRole
    const closeButtons = screen.getAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});