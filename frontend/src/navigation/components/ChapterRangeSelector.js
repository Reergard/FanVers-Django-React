import React from 'react';
import './ChapterRangeSelector.css';

const ChapterRangeSelector = ({ pageRanges, currentRange, onRangeSelect }) => {
    if (!pageRanges || pageRanges.length === 0) {
        return null;
    }

    return (
        <div className="chapter-range-selector">
            <div className="select-wrapper">
                <select 
                    value={`${currentRange.start}-${currentRange.end}`}
                    onChange={(e) => {
                        const [start] = e.target.value.split('-').map(Number);
                        onRangeSelect(start);
                    }}
                    className="chapter-range-select"
                >
                    {pageRanges.map((range) => (
                        <option 
                            key={`${range.start}-${range.end}`} 
                            value={`${range.start}-${range.end}`}
                        >
                            Розділи {range.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ChapterRangeSelector; 