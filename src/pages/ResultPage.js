import React, { useState, useMemo, useEffect } from 'react';
import './ResultPage.css';
import SearchBox from '../components/SearchBox';
import MemeItem from '../components/MemeItem';
import SharePopup from '../components/SharePopup';
import { useLocation, useNavigate } from 'react-router-dom';
// using default SearchBox icon (Lusend)

const API_BASE_URL = 'https://memeforyou-server-production.up.railway.app';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'likes'
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const q = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }, [location.search]);

  // Fetch memes from API when query changes
  useEffect(() => {
    const fetchMemes = async () => {
      if (!q) {
        setMemes([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Always use 'accuracy' sort for API call
        const params = new URLSearchParams({
          query: q,
          page: '1',
          size: '20',
          sort: 'accuracy'
        });

        const response = await fetch(`${API_BASE_URL}/search?${params}`, {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('API Response:', data); // 디버깅용
        
        // Check if data.items exists and is an array
        if (!data.items || !Array.isArray(data.items)) {
          console.error('Invalid API response structure:', data);
          setMemes([]);
          return;
        }
        
        // Transform API response to match app's data structure
        const transformedMemes = data.items.map(item => ({
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
        
        setMemes(transformedMemes);
      } catch (err) {
        console.error('Failed to fetch memes:', err);
        console.error('Error details:', err.message);
        setError(`검색 결과를 불러오는 데 실패했습니다. (${err.message})`);
        setMemes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMemes();
  }, [q]);

  // Sort memes based on sortBy selection
  const sorted = useMemo(() => {
    if (sortBy === 'likes') {
      // Sort by like_cnt in descending order
      const sortedByLikes = [...memes].sort((a, b) => b.likes - a.likes);
      console.log('Sorted by likes:', sortedByLikes.map(m => ({ id: m.id, likes: m.likes })));
      return sortedByLikes;
    }
    // 'recommended' - keep original order from API (accuracy sort)
    console.log('Original order (accuracy)');
    return memes;
  }, [memes, sortBy]);

  const handleSearch = (newQ) => {
    navigate(`/result?q=${encodeURIComponent(newQ || '')}`);
  };

  // 팝업에서 좋아요가 변경되었을 때 호출될 함수
  const handleLikeUpdate = (imageId, newLikeCount) => {
    setMemes(prevMemes => 
      prevMemes.map(m => 
        m.id === imageId ? { ...m, likes: newLikeCount } : m
      )
    );
  };

  return (
    <div className="result-page">
      <div className="result-search-top">
        {/* no back button; use browser nav */}
  <SearchBox initial={q} onSearch={handleSearch} width="720px" />
      </div>

      <div className="result-meta">
        <h4><strong>"{q || '이런저런 밈'}"</strong> 에 대한 검색 결과 {memes.length}개</h4>
        <div className="filters">
          <div className="sort-toggle">
            <button type="button" className="sort-btn" onClick={() => setShowSortOptions((s) => !s)}>
              {sortBy === 'recommended' ? '추천순' : '좋아요수'} ▾
            </button>
            {showSortOptions && (
              <div className="sort-dropdown">
                <button type="button" className="sort-item" onClick={() => { setSortBy('recommended'); setShowSortOptions(false); }}>추천순</button>
                <button type="button" className="sort-item" onClick={() => { setSortBy('likes'); setShowSortOptions(false); }}>좋아요수</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="result-grid">
        {loading ? (
          <div className="no-result">검색 중...</div>
        ) : error ? (
          <div className="no-result">{error}</div>
        ) : memes.length === 0 ? (
          <div className="no-result">검색 결과가 없습니다.</div>
        ) : (
          sorted.map((m) => (
            <MemeItem key={m.id} meme={m} onClick={(mm) => setSelected(mm)} />
          ))
        )}
      </div>

      {selected && <SharePopup meme={selected} onClose={() => setSelected(null)} onLikeUpdate={handleLikeUpdate} />}
    </div>
  );
}
