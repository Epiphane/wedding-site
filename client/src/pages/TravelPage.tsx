import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

export default function TravelPage(): JSX.Element {
  const { model } = useApp();

  return (
    <React.Fragment>
      <div
        style={{
          background: 'white',
          padding: '80px 20px'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '2em',
              marginBottom: '40px',
              color: '#333',
              fontWeight: '400',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              textAlign: 'center'
            }}
          >
            Travel Information
          </h2>
          <Card style={{ marginBottom: '30px' }}>
            <h3
              style={{
                marginTop: '0',
                color: '#333',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '1.5em'
              }}
            >
              Accommodations
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
              We recommend staying in Santa Cruz, which offers a variety of hotels and vacation rentals within easy reach of the venue.
            </p>
            <div style={{ marginTop: '20px' }}>
              <h4
                style={{
                  color: '#333',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  marginBottom: '10px'
                }}
              >
                Suggested Hotels:
              </h4>
              <ul style={{ color: '#666', lineHeight: '1.8' }}>
                <li>Dream Inn Santa Cruz - Beachfront hotel with ocean views</li>
                <li>Hotel Paradox - Boutique hotel in downtown Santa Cruz</li>
                <li>West Cliff Inn - Victorian inn near the beach</li>
                <li>Mission Inn - Budget-friendly option near downtown</li>
              </ul>
            </div>
          </Card>

          <Card style={{ marginBottom: '30px' }}>
            <h3
              style={{
                marginTop: '0',
                color: '#333',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '1.5em'
              }}
            >
              Getting to the Reception
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
              The Ampitheatre of the Redwoods is located in the Santa Cruz Mountains. We will provide shuttle service from downtown Santa Cruz.
            </p>
            <div
              style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '2px',
                marginTop: '20px'
              }}
            >
              <h4
                style={{
                  color: '#333',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  marginTop: '0',
                  marginBottom: '10px'
                }}
              >
                Shuttle Details:
              </h4>
              <ul style={{ color: '#666', lineHeight: '1.8', margin: '0', paddingLeft: '20px' }}>
                <li>Pickup Location: Downtown Santa Cruz (specific location TBD)</li>
                <li>Departure Time: 3:00 PM</li>
                <li>Return Shuttle: Departing venue at 10:00 PM</li>
                <li>Please RSVP to reserve your spot on the shuttle</li>
              </ul>
            </div>
          </Card>

          <Card>
            <h3
              style={{
                marginTop: '0',
                color: '#333',
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: '1.5em'
              }}
            >
              Driving Directions
            </h3>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              If you prefer to drive yourself, the venue is approximately 20 minutes from downtown Santa Cruz via Highway 9. Parking is available on-site. Please note that the mountain roads can be winding, so allow extra time for your journey.
            </p>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
