import React, { useState, useEffect } from 'react';
import Slide from '../components/Slide';
import SearchBox from '../components/SearchBox';
import SharePopup from '../components/SharePopup';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import background from '../assets/background.png';
import memeforyouIcon from '../assets/memeforyou_icon.png';

const API_BASE_URL = 'https://memeforyou-server-production.up.railway.app';

export default function MainPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [popularMemes, setPopularMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Fetch popular memes from API
  useEffect(() => {
    const fetchPopularMemes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/image/popular`, {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Popular Memes API Response:', data); // 디버깅용
        
        // Transform API response to match app's data structure
        const transformedMemes = data.map(item => ({
          id: item.image_id,
          name: `meme-${item.image_id}`,
          src: item.cloud_url,
          title: item.caption,
          likes: item.like_cnt,
          shares: 0,
          width: item.width,
          height: item.height,
          original_url: item.original_url,
          src_url: item.src_url
        }));
        
        setPopularMemes(transformedMemes);
      } catch (err) {
        console.error('Failed to fetch popular memes:', err);
        setError(`추천 밈을 불러오는 데 실패했습니다. (${err.message})`);
        setPopularMemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMemes();
  }, []);



  const handleSearch = (q) => {
    navigate(`/result?q=${encodeURIComponent(q || '')}`);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 팝업에서 좋아요가 변경되었을 때 호출될 함수
  const handleLikeUpdate = (imageId, newLikeCount) => {
    setPopularMemes(prevMemes => 
      prevMemes.map(m => 
        m.id === imageId ? { ...m, likes: newLikeCount } : m
      )
    );
  };

  return (
    <div className="main-page">
      {/* Main Section */}
      <section
        id="main"
        className="main-section"
        style={{
          backgroundImage: `url(${background})`,
          height: '85vh',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top'
        }}
      >
        {/* Navigation */}
        <nav className="top-nav">
          <div className="nav-logo">MEMEforyou</div>
          <div className="nav-links">
            <button onClick={() => scrollToSection('recommended')}>Recommended</button>
            <button onClick={() => scrollToSection('about')}>About us</button>
          </div>
        </nav>

        <div className="main-content">
          <div className="main-text">
            <h1 className="main-title">{"Find your\nperfect\nmeme."}</h1>
            <p className="main-subtitle">당신의 상황에 딱 맞는 밈을 추천해드려요.</p>
          </div>
          <div className="main-icon">
            <img src={memeforyouIcon} alt="Meme for you" />
          </div>
        </div>
        
        <div className="search-section">
          <SearchBox onSearch={handleSearch} width="720px" placeholder="검색하고 싶은 밈을 입력하세요" />
        </div>
      </section>

      {/* Recommended Section */}
      <section id="recommended" className="recommended-section">
        {error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {error}
          </div>
        ) : (
          <Slide 
            title="Recommended Meme" 
            items={popularMemes} 
            onClick={(m) => setSelected(m)} 
            loading={loading}
          />
        )}
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <h5>GDGonKU Worktree Team 1</h5>
          <a href="https://github.com/Memeforyou" target="_blank" rel="noopener noreferrer">
            https://github.com/Memeforyou
          </a>
        </div>
      </section>

      {selected && <SharePopup meme={selected} onClose={() => setSelected(null)} onLikeUpdate={handleLikeUpdate} />}
    </div>
  );
}
