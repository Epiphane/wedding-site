import React from 'react';

interface HeaderProps {
  weddingDate: string;
  venue: string;
  coupleNames: [string, string];
}

export default function Header({ weddingDate, venue, coupleNames }: HeaderProps): JSX.Element {
  const [name1, name2] = coupleNames;

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px 40px',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          color: '#333'
        }}
      >
        <div>{weddingDate}</div>
        <div>{venue}</div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px 20px'
        }}
      >
        <h1 className="name-banner">
          {name1} & {name2}
        </h1>
      </div>
    </>
  );
}
