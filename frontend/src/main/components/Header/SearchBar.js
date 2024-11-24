import React from 'react';

export const SearchBar = ({ label, iconSrc }) => (
  <form className="flex gap-10 justify-between items-center px-4 py-0.5 max-w-full text-sm border-b border-cyan-500 min-h-[27px] w-[247px]">
    <label htmlFor="siteSearch" className="self-stretch my-auto">{label}</label>
    <input
      type="search"
      id="siteSearch"
      className="hidden"
      aria-label={label}
    />
    <button type="submit" aria-label="Search">
      <img
        loading="lazy"
        src={iconSrc}
        alt=""
        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
      />
    </button>
  </form>
);