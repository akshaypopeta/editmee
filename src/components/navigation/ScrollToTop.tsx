/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  threshold?: number;
  className?: string;
  id?: string;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  threshold = 280,
  className = '',
  id = 'global-scroll-to-top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = useCallback(() => {
    if (typeof window === 'undefined') return;
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
    setIsVisible(currentScroll > threshold);
  }, [threshold]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    checkScroll(); // Check on mount

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [checkScroll]);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 print:hidden transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}
      style={{
        marginBottom: 'env(safe-area-inset-bottom, 0px)',
        marginRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <button
        type="button"
        id={id}
        onClick={scrollToTop}
        aria-label="Scroll to top of page"
        title="Scroll to top"
        className="group flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 hover:border-red-500 shadow-xl hover:shadow-red-500/20 transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-red-500/50 active:scale-95"
      >
        <ArrowUp className="w-5 h-5 text-red-500 group-hover:text-red-400 group-hover:-translate-y-0.5 transition-transform duration-150" />
      </button>
    </div>
  );
};
