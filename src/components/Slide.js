import React, { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Slide({ title, items, onClick, loading = false }) {
  const viewportRef = useRef(null);

  const scroll = (dir = 'right') => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  return (
    <div className="slide-section">
      <h3
        className="slide-title"
        style={{
          textAlign: 'left',
          marginLeft: 110,
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 18,
          color: '#838383'
        }}
      >
        {title}
      </h3>
      <div className="slide-body">
        <button className="slide-arrow left" onClick={() => scroll('left')} aria-label="scroll left"><FiChevronLeft size={32} /></button>
        <div className="slide-viewport" ref={viewportRef}>
          <div className="slide-row">
            {loading ? (
              // 로딩 중일 때 스켈레톤 UI 표시
              [...Array(5)].map((_, i) => (
                <div key={i} className="slide-item">
                  <div className="slide-skeleton"></div>
                </div>
              ))
            ) : (
              items.map((m) => (
                <div key={m.id} className="slide-item" onClick={() => onClick(m)}>
                  <img src={m.src} alt={m.title} />
                </div>
              ))
            )}
          </div>
        </div>
        <button className="slide-arrow right" onClick={() => scroll('right')} aria-label="scroll right"><FiChevronRight size={32} /></button>
      </div>
    </div>
  );
}
