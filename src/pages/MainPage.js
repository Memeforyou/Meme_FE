import React, { useState, useEffect } from 'react';
import Slide from '../components/Slide';
import SearchBox from '../components/SearchBox';
import SharePopup from '../components/SharePopup';
import mockMemes from '../mockData';
import { useNavigate } from 'react-router-dom';
// using default SearchBox icon (Lusend)
import './MainPage.css';
import background from '../assets/background.png';

export default function MainPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const first5 = mockMemes.slice(0, 5);
  const [bgHeight, setBgHeight] = useState(null);

  useEffect(() => {
    let mounted = true;
    const img = new Image();
    img.src = background;
    const compute = () => {
      if (!img.naturalWidth) return;
      // scale image to fit viewport width if it's larger than viewport
      const scale = Math.min(1, window.innerWidth / img.naturalWidth);
      const imageHeight = img.naturalHeight * scale;
      // account for vertical padding inside header (.header-inner has 30px top + 30px bottom)
      const paddingV = 60;
      const totalHeight = imageHeight + paddingV;
      if (mounted) setBgHeight(totalHeight);
    };
    img.onload = () => {
      compute();
    };
    window.addEventListener('resize', compute);
    return () => {
      mounted = false;
      window.removeEventListener('resize', compute);
    };
  }, []);

  const handleSearch = (q) => {
    navigate(`/result?q=${encodeURIComponent(q || '')}`);
  };

  return (
    <div className="main-page">
      {/** use computed height so header can contain the full image vertically */}
      <header
        className="main-header"
        style={{
          backgroundImage: `url(${background})`,
          height: bgHeight ? `${Math.round(bgHeight)}px` : 'auto',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top'
        }}
      >
        <div className="header-inner">
          <h1 className="main-title">Meme for you</h1>
          {/* make main page search a bit shorter */}
            <SearchBox onSearch={handleSearch} width="720px" />
        </div>
      </header>

      <main className="main-content">
        <Slide title="추천된 밈" items={first5} onClick={(m) => setSelected(m)} />
        <Slide title="좋아요 많은 밈" items={first5} onClick={(m) => setSelected(m)} />
        <Slide title="공유 수 많은 밈" items={first5} onClick={(m) => setSelected(m)} />
      </main>

      {selected && <SharePopup meme={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
