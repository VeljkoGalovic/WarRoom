import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card', () => {
  it('renders card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default card classes', () => {
    render(<Card>Test</Card>);
    const card = screen.getByText('Test').closest('[data-testid]') || screen.getByText('Test').parentElement?.closest('div');
    // Use container to find the card div
    const container = screen.getByText('Test').parentElement?.parentElement;
    const cardDiv = container?.querySelector('div[class*="rounded-lg"]');
    expect(cardDiv).toHaveClass('rounded-lg');
    expect(cardDiv).toHaveClass('border');
    expect(cardDiv).toHaveClass('bg-card');
    expect(cardDiv).toHaveClass('text-card-foreground');
    expect(cardDiv).toHaveClass('shadow-sm');
  });

  it('renders CardHeader', () => {
    render(
      <Card>
        <CardHeader>Header content</CardHeader>
      </Card>
    );
    expect(screen.getByText('Header content')).toBeInTheDocument();
    const header = screen.getByText('Header content').closest('div[class*="flex"]');
    expect(header).toHaveClass('flex');
    expect(header).toHaveClass('flex-col');
    expect(header).toHaveClass('space-y-1.5');
    expect(header).toHaveClass('p-6');
  });

  it('renders CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>
    );
    const title = screen.getByText('Card Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('leading-none');
    expect(title).toHaveClass('tracking-tight');
  });

  it('renders CardDescription', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
      </Card>
    );
    const desc = screen.getByText('Card description text');
    expect(desc).toBeInTheDocument();
    expect(desc.tagName).toBe('P');
    expect(desc).toHaveClass('text-sm');
    expect(desc).toHaveClass('text-muted-foreground');
  });

  it('renders CardContent', () => {
    render(
      <Card>
        <CardContent>Card content body</CardContent>
      </Card>
    );
    expect(screen.getByText('Card content body')).toBeInTheDocument();
    const content = screen.getByText('Card content body').closest('div[class*="p-6"]');
    expect(content).toHaveClass('p-6');
    expect(content).toHaveClass('pt-0');
  });

  it('renders CardFooter', () => {
    render(
      <Card>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    );
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
    const footer = screen.getByText('Footer actions').closest('div[class*="flex"]');
    expect(footer).toHaveClass('flex');
    expect(footer).toHaveClass('items-center');
    expect(footer).toHaveClass('p-6');
    expect(footer).toHaveClass('pt-0');
  });

  it('composes all card parts together', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Main content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-card-class">Test</Card>);
    const container = screen.getByText('Test').parentElement?.parentElement;
    const cardDiv = container?.querySelector('div[class*="rounded-lg"]');
    expect(cardDiv).toHaveClass('custom-card-class');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Test</Card>);
    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});