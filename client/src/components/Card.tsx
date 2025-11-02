import React, { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function Card({ children, style = {} }: CardProps): JSX.Element {
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
