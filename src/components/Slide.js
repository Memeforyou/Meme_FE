import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Slide({ title, items, onClick }) {
  const viewportRef = useRef(null);

  const scroll = (dir = 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="slide-section">
      <h3>{title}</h3>
      <div className="slide-body">
  <button className="slide-arrow left" onClick={() => scroll('left')} aria-label="scroll left"><FiChevronLeft size={32} /></button>
        <div className="slide-viewport" ref={viewportRef}>
          <div className="slide-row">
            {items.map((m) => (
              <div key={m.id} className="slide-item" onClick={() => onClick(m)}>
                <img src={m.src} alt={m.title} />
                <div className="slide-caption">{m.title}</div>
              </div>
            ))}
          </div>
        </div>
  <button className="slide-arrow right" onClick={() => scroll('right')} aria-label="scroll right"><FiChevronRight size={32} /></button>
      </div>
    </div>
  );
}
