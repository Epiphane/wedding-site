export default function Header(): JSX.Element {
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
        <div>August 22, 2026</div>
        <div>Ampitheatre of the Redwoods</div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '40px 20px 20px'
        }}
      >
        <h1 className="name-banner">
          Thomas Steinke & Liz Petersen
        </h1>
      </div>
    </>
  );
}
