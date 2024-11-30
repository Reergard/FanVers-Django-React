import React from 'react';

function MultiSelect({ items, onChange, title }) {
    const handleChange = (event) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        onChange(selectedOptions);
    };

    return (
        <div>
            <label>{title}</label>
            <select multiple onChange={handleChange}>
                {items.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default MultiSelect;
