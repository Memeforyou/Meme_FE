import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { MdSaveAlt } from 'react-icons/md';
import { BiShareAlt } from 'react-icons/bi';
import kakaoIcon from '../assets/kakao-icon.png';
import './SharePopup.css';

const API_BASE_URL = 'https://memeforyou-server-production.up.railway.app';

// localStorage에서 좋아요 목록 가져오기
const getLikedImages = () => {
  const liked = localStorage.getItem('likedImages');
  return liked ? JSON.parse(liked) : [];
};

// localStorage에 좋아요 목록 저장하기
const saveLikedImages = (likedImages) => {
  localStorage.setItem('likedImages', JSON.stringify(likedImages));
};

export default function SharePopup({ meme, onClose, onLikeUpdate }) {
  const [memeDetail, setMemeDetail] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  // 초기값을 meme.likes로 설정
  const [likeCount, setLikeCount] = useState(meme?.likes || 0);
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // 사용자가 좋아요를 눌렀는지 추적

  useEffect(() => {
    // 먼저 localStorage에서 좋아요 상태 확인
    const likedImages = getLikedImages();
    setIsLiked(likedImages.includes(meme?.id));
    
    const fetchMemeDetail = async () => {
      if (!meme || !meme.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/image/${meme.id}`, {
          method: 'GET',
          headers: {
            'accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error(`API 요청 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log('Meme Detail:', data);
        setMemeDetail(data);
        
        // 사용자가 좋아요를 누르지 않았을 때만 서버 값으로 업데이트
        if (!hasUserInteracted) {
          setLikeCount(data.like_cnt || 0);
        }
      } catch (err) {
        console.error('Failed to fetch meme detail:', err);
      }
    };

    fetchMemeDetail();
  }, [meme, hasUserInteracted]);

  const handleLike = async () => {
    if (!meme || !meme.id) return;

    // 사용자가 상호작용했음을 표시
    setHasUserInteracted(true);

    // 먼저 UI 상태를 즉시 업데이트 (낙관적 업데이트)
    const willBeLiked = !isLiked;
    const newLikeCount = willBeLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(willBeLiked);
    setLikeCount(newLikeCount);

    // 부모 컴포넌트에 좋아요 수 변경 알림
    if (onLikeUpdate) {
      onLikeUpdate(meme.id, newLikeCount);
    }

    // localStorage 즉시 업데이트
    const likedImages = getLikedImages();
    if (willBeLiked) {
      if (!likedImages.includes(meme.id)) {
        likedImages.push(meme.id);
        saveLikedImages(likedImages);
      }
    } else {
      const updatedLiked = likedImages.filter(id => id !== meme.id);
      saveLikedImages(updatedLiked);
    }

    // 백그라운드에서 서버에 알림 (응답으로 UI 업데이트 안 함)
    try {
      let response;
      if (willBeLiked) {
        // 좋아요 추가 - POST
        console.log(`Calling like for image ${meme.id}`);
        response = await fetch(`${API_BASE_URL}/image/${meme.id}/like`, {
          method: 'POST',
          headers: {
            'accept': '*/*'
          }
        });
      } else {
        // 좋아요 취소 - DELETE
        console.log(`Calling unlike for image ${meme.id}`);
        response = await fetch(`${API_BASE_URL}/image/${meme.id}/unlike`, {
          method: 'DELETE',
          headers: {
            'accept': '*/*'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('Like/Unlike Response:', data);
      // 서버 응답은 로그만 남기고, UI는 이미 업데이트되어 있음
    } catch (err) {
      console.error('Failed to like/unlike:', err);
      // API 실패 시 상태 롤백
      setIsLiked(!willBeLiked);
      setLikeCount(prev => willBeLiked ? prev - 1 : prev + 1);
      
      // localStorage도 롤백
      const likedImagesRollback = getLikedImages();
      if (willBeLiked) {
        const updatedLiked = likedImagesRollback.filter(id => id !== meme.id);
        saveLikedImages(updatedLiked);
      } else {
        if (!likedImagesRollback.includes(meme.id)) {
          likedImagesRollback.push(meme.id);
          saveLikedImages(likedImagesRollback);
        }
      }
    }
  };

  const handleDownload = async () => {
    if (!meme || !meme.id) return;

    try {
      console.log(`Downloading image ${meme.id}`);
      const response = await fetch(`${API_BASE_URL}/image/${meme.id}/download`, {
        method: 'GET',
        headers: {
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.status}`);
      }

      // Blob으로 변환
      const blob = await response.blob();
      
      // 파일명 추출 (response header에서)
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `meme_${meme.id}.jpg`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Download completed:', filename);
    } catch (err) {
      console.error('Failed to download:', err);
      alert('다운로드에 실패했습니다.');
    }
  };

  // Share handlers
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = () => {
    // prefer cloud_url from detail, fall back to meme.src or current page
    return (memeDetail && memeDetail.cloud_url) || meme?.src || window.location.href;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      alert('링크가 복사되었습니다.');
      setShareOpen(false);
    } catch (err) {
      console.error('복사 실패:', err);
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleSystemShare = async () => {
    const url = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        // fallback to copy
        await navigator.clipboard.writeText(url);
        alert('공유 지원이 없는 환경입니다. 링크가 복사되었습니다.');
      }
      setShareOpen(false);
    } catch (err) {
      console.error('System share failed', err);
    }
  };

  const handleKakaoShare = () => {
    // 카카오톡 공유는 시스템 공유로 대체
    handleSystemShare();
  };

  const handleWhatsAppShare = () => {
    const url = shareUrl();
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank', 'noopener');
    setShareOpen(false);
  };

  const handleFacebookShare = () => {
    const url = shareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener');
    setShareOpen(false);
  };

  const handleTwitterShare = () => {
    const url = shareUrl();
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank', 'noopener');
    setShareOpen(false);
  };

  if (!meme) return null;
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>✕</button>
        <h2>
          {memeDetail && memeDetail.tags && memeDetail.tags.length > 0
            ? memeDetail.tags.map(tag => `#${tag}`).join(' ')
            : ' '}
        </h2>
        <div className="popup-image-wrap">
          <img src={meme.src} alt={meme.title} />
        </div>
        <div className="popup-actions">
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isLiked ? (
              <FaHeart size={28} color="#ff0000" />
            ) : (
              <FaRegHeart size={28} />
            )}
            <span>{likeCount}</span>
          </button>

          <div className="share-wrapper">
            <button onClick={() => setShareOpen((s) => !s)} aria-haspopup="menu" aria-expanded={shareOpen} title="공유">
              <BiShareAlt size={28} />
            </button>
            {shareOpen && (
              <div className="share-modal-overlay" onClick={() => setShareOpen(false)}>
                <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                  <h3 onClick={() => setShareOpen(false)}>공유</h3>
                  <div className="share-content">
                    {/* 앱 아이콘 섹션 */}
                    <div className="share-icons">
                      <button className="share-icon-btn" onClick={handleKakaoShare} title="카카오톡">
                        <div className="icon-circle kakao">
                          <img src={kakaoIcon} alt="Kakao" />
                        </div>
                        <span>앱으로 공유</span>
                      </button>
                      <button className="share-icon-btn" onClick={handleWhatsAppShare} title="WhatsApp">
                        <div className="icon-circle whatsapp"><FaWhatsapp /></div>
                        <span>WhatsApp</span>
                      </button>
                      <button className="share-icon-btn" onClick={handleFacebookShare} title="Facebook">
                        <div className="icon-circle facebook"><FaFacebookF /></div>
                        <span>Facebook</span>
                      </button>
                      <button className="share-icon-btn" onClick={handleTwitterShare} title="X">
                        <div className="icon-circle twitter"><FaTwitter /></div>
                        <span>X</span>
                      </button>
                    </div>

                    {/* 링크 복사 섹션 */}
                    <div className="share-link-section">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareUrl()} 
                        className="share-link-input"
                        onClick={(e) => e.target.select()}
                      />
                      <button className="share-copy-btn" onClick={handleCopyLink}>
                        복사
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={handleDownload}><MdSaveAlt size={28} /></button>
        </div>
      </div>
    </div>
  );
}
