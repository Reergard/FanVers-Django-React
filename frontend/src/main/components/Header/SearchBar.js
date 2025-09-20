import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SearchBar = ({ label, iconSrc }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Переходим на страницу поиска с параметром запроса
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form 
      className="flex justify-between items-center px-4 py-0.5 max-w-full border-b border-cyan-500 min-h-[27px] w-[300px]"
      onSubmit={handleSearch}
    >
      <input
        type="search"
        id="siteSearch"
        placeholder={label}
        className="self-stretch my-auto"
        aria-label={label}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button type="submit" aria-label="Search">
        <img
          loading="lazy"
          src={iconSrc}
          alt=""
          className="object-contain shrink-0 self-stretch my-auto w-7 aspect-square"
        />
      </button>
    </form>
  );
};
