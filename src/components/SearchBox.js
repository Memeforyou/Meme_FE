import React from 'react';
import { LuSend as Lusend } from 'react-icons/lu';

export default function SearchBox({ placeholder = '검색하고 싶은 밈을 입력하세요.', onSearch, initial = '', width = '800px', Icon = Lusend }) {
  const wrapperStyle = { width , marginLeft: 'auto', marginRight: 'auto', position: 'relative'};
  const handleSearch = () => {
    const el = document.querySelector('.search-box input');
    const val = el ? el.value : '';
    onSearch && onSearch(val);
  };

  return (
    <div className="search-box" style={wrapperStyle}>
      <input
        defaultValue={initial}
        style={{height: '50px', borderRadius: '20px'}}
        placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch && onSearch(e.target.value); }}
      />
      <button type="button" className="search-btn" onClick={handleSearch} aria-label="search">
        {/* force a consistent visible size for the icon */}
        <Icon size={18} />
      </button>
    </div>
  );
}
