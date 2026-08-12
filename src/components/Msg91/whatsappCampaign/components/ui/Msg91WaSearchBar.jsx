import React, { useState } from 'react'
import { SearchIcon } from './WaIcons'

/**
 * SearchBar
 * Props: value, onChange, placeholder, style
 */
const SearchBar = ({ value, onChange, placeholder = 'Search...', style = {} }) => {
    const [focused, setFocused] = useState(false)

    return (
        <div style={{ position: 'relative', ...style }}>
            <span style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: '#9aa0ab',
                display: 'flex', alignItems: 'center',
                pointerEvents: 'none',
            }}>
                <SearchIcon />
            </span>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    paddingLeft: 32,
                    paddingRight: 12,
                    height: 36,
                    border: `1px solid ${focused ? '#1a73e8' : '#dde1e7'}`,
                    borderRadius: 6,
                    fontSize: 12,
                    outline: 'none',
                    color: '#333',
                    background: '#fafbfc',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    boxShadow: focused ? '0 0 0 3px rgba(26,115,232,0.1)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
            />
        </div>
    )
}

export default SearchBar