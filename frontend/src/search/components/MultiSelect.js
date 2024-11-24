import React from 'react';

function MultiSelect({ items, onChange, title }) {
    const handleSelectChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        onChange(selectedOptions);
    };

    return (
        <div>
            {items && (
                <>
                    <label className="d-block">{title}:</label>
                    <select multiple={true} onChange={handleSelectChange}>
                        {items.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </>
            )}
        </div>
    );
}

export default MultiSelect;
