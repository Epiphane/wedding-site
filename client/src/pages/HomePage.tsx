import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function HomePage(): JSX.Element {
  const { model } = useApp();
  const [name1, name2] = model.coupleNames;

  return (
    <React.Fragment>
      {/* Hero Image Section */}
      <div
        style={{
          width: '100%',
          height: '600px',
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '1.5em',
          fontStyle: 'italic'
        }}
      >
        Hero Image
      </div>

      {/* Couple Names Section */}
      <div
        style={{
          background: 'white',
          padding: '80px 20px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: '2.5em',
                fontWeight: '400',
                color: '#333',
                lineHeight: '1.2'
              }}
            >
              {name1}
            </div>
          </div>
          <div
            style={{
              fontSize: '1.5em',
              color: '#666',
              fontStyle: 'italic'
            }}
          >
            and
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: '2.5em',
                fontWeight: '400',
                color: '#333',
                lineHeight: '1.2'
              }}
            >
              {name2}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: '40px',
            fontSize: '1.8em',
            color: '#333',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          {model.weddingDate} | 4:00 PM
        </div>
      </div>

      {/* Details Section */}
      <div
        style={{
          maxWidth: '800px',
          margin: '60px auto',
          padding: '40px 20px',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontSize: '2.5em',
            marginBottom: '40px',
            color: '#333',
            fontWeight: '400'
          }}
        >
          Save the Date
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '30px'
          }}
        >
          {detailCard('📅', 'Date', model.weddingDate)}
          {detailCard('📍', 'Venue', model.venue)}
          {detailCard('⏰', 'Time', '4:00 PM')}
        </div>
      </div>

      {/* RSVP Call to Action */}
      <div
        style={{
          background: 'white',
          padding: '60px 20px',
          textAlign: 'center'
        }}
      >
        <h2
          style={{
            fontSize: '2.5em',
            marginBottom: '20px',
            color: '#333',
            fontWeight: '400'
          }}
        >
          RSVP
        </h2>
        <p
          style={{
            color: '#666',
            fontSize: '1.2em',
            marginBottom: '30px'
          }}
        >
          We'd love to celebrate with you!
        </p>
        <Link
          to="/rsvp"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 40px',
            fontSize: '1.2em',
            borderRadius: '30px',
            cursor: 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          RSVP Now
        </Link>
      </div>
    </React.Fragment>
  );
}

function detailCard(emoji: string, title: string, content: string): JSX.Element {
  return (
    <div
      style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        minWidth: '200px',
        flex: '1'
      }}
    >
      <div style={{ fontSize: '3em', marginBottom: '10px' }}>{emoji}</div>
      <h3
        style={{
          margin: '10px 0',
          color: '#667eea',
          fontWeight: '400'
        }}
      >
        {title}
      </h3>
      <p style={{ margin: '10px 0', color: '#666', fontSize: '1.1em' }}>
        {content}
      </p>
    </div>
  );
}
