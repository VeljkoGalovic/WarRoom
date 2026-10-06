import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar');
  });

  it('handles tailwind merge conflicts', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('handles arrays and objects', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('merges complex tailwind classes', () => {
    expect(cn('bg-red-500 text-white', 'hover:bg-red-600')).toBe(
      'bg-red-500 text-white hover:bg-red-600'
    );
    expect(cn('p-2 m-4', 'p-4')).toBe('m-4 p-4');
  });
});