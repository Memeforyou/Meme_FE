import React from 'react';

export default function MemeItem({ meme, onClick }) {
  return (
    <div className="result-item" onClick={() => onClick(meme)}>
      <img
        src={meme.src}
        alt={meme.title}
        loading="lazy"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
}
