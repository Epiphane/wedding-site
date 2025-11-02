import React from 'react';

export default function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '2px',
        border: '1px solid #e0e0e0',
        ...style
      }}
    >
      {children}
    </div>
  );
}
