import React, { useRef, useEffect } from 'react';

export default function MemeItem({ meme, onClick, onImageLoad }) {
  const imgRef = useRef(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      // Handle already loaded images (cached)
      if (img.complete && img.naturalHeight !== 0) {
        onImageLoad && onImageLoad(img);
      }
    }
  }, [meme.src, onImageLoad]);

  return (
    <div className="result-item" onClick={() => onClick(meme)}>
      {/* let CSS control width; keep aspect ratio with height:auto */}
      <img
        ref={imgRef}
        src={meme.src}
        alt={meme.title}
        style={{ width: '100%', height: 'auto' }}
        onLoad={(e) => onImageLoad && onImageLoad(e.target)}
      />
    </div>
  );
}
