import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarCardSkeleton, CarCardHorizontalSkeleton, CarDetailSkeleton } from '../LoadingSkeleton';

describe('LoadingSkeleton Components', () => {
  describe('CarCardSkeleton', () => {
    it('renders skeleton for vertical card', () => {
      const { container } = render(<CarCardSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('renders multiple skeletons', () => {
      const { container } = render(
        <>
          <CarCardSkeleton />
          <CarCardSkeleton />
          <CarCardSkeleton />
        </>
      );
      
      const cards = container.querySelectorAll('.card');
      expect(cards.length).toBe(3);
    });
  });

  describe('CarCardHorizontalSkeleton', () => {
    it('renders skeleton for horizontal card', () => {
      const { container } = render(<CarCardHorizontalSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
      expect(container.querySelector('.card')).toBeInTheDocument();
    });

    it('has horizontal layout', () => {
      const { container } = render(<CarCardHorizontalSkeleton />);
      
      const card = container.querySelector('.card');
      expect(card.className).toMatch(/flex/);
    });
  });

  describe('CarDetailSkeleton', () => {
    it('renders skeleton for car detail page', () => {
      const { container } = render(<CarDetailSkeleton />);
      
      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders multiple skeleton sections', () => {
      const { container } = render(<CarDetailSkeleton />);
      
      const skeletonDivs = container.querySelectorAll('.bg-gray-300');
      expect(skeletonDivs.length).toBeGreaterThan(3);
    });
  });
});
