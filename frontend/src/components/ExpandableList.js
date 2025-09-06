import React, { useState } from 'react';
import './styles/ExpandableList.css';

const ExpandableList = ({ title, className, items, maxVisible = 2 }) => {
  const [expanded, setExpanded] = useState(false);

  // Handle both string arrays and object arrays from API
  const processedItems = items?.map(item => {
    if (typeof item === 'string') return item;
    return item?.name || item?.title || item?.label || item?.slug || '';
  }).filter(Boolean) || [];

  if (!processedItems || processedItems.length === 0) {
    return (
      <div className={className}>
        {title && <span>{title}:</span>}
        <div className={`name-${className.split(" ")[0]}`}>
          <span>—</span>
        </div>
      </div>
    );
  }

  const visibleItems = processedItems.slice(0, maxVisible);
  const hiddenItems = processedItems.slice(maxVisible);

  return (
    <div className={className}>
      {title && <span>{title}:</span>}
      <div className={`name-${className.split(" ")[0]}`}>
        {visibleItems.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {hiddenItems.length > 0 && (
          <div className="expandable-container">
            <button 
              className="expand-btn" 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              aria-label={expanded ? "Сховати додаткові елементи" : "Показати додаткові елементи"}
            >
              {expanded ? "▲" : "▼"}
            </button>
            {expanded && (
              <div className="dropdown-list">
                {hiddenItems.map((item, index) => (
                  <div key={index + maxVisible} className="dropdown-item">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableList;
