import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

interface ScheduleEventProps {
  date: string;
  title: string;
  time: string;
  location: string;
  description: string;
}

export default function SchedulePage(): JSX.Element {
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
            Wedding Schedule
          </h2>
          <ScheduleEvent
            date="Friday, August 21, 2026"
            title="Welcome Dinner"
            time="7:00 PM"
            location="Downtown Santa Cruz"
            description="Join us for a casual welcome dinner the night before the wedding. Location details will be provided closer to the date."
          />
          <ScheduleEvent
            date={model.weddingDate}
            title="Ceremony"
            time="4:00 PM"
            location={model.venue}
            description="Our wedding ceremony will take place in the beautiful natural setting of the Ampitheatre of the Redwoods."
          />
          <ScheduleEvent
            date={model.weddingDate}
            title="Cocktail Hour"
            time="4:30 PM"
            location={model.venue}
            description="Enjoy drinks and appetizers while we take photos."
          />
          <ScheduleEvent
            date={model.weddingDate}
            title="Reception"
            time="6:00 PM"
            location={model.venue}
            description="Dinner, dancing, and celebration under the redwoods!"
          />
          <ScheduleEvent
            date={model.weddingDate}
            title="Shuttle Return"
            time="10:00 PM"
            location={model.venue}
            description="Last shuttle departs back to Santa Cruz."
          />
        </div>
      </div>
    </React.Fragment>
  );
}

function ScheduleEvent({ date, title, time, location, description }: ScheduleEventProps): JSX.Element {
  return (
    <Card style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3
            style={{
              marginTop: '0',
              marginBottom: '5px',
              color: '#333',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: '1.3em'
            }}
          >
            {title}
          </h3>
          <p style={{ color: '#999', margin: '0', fontSize: '0.9em' }}>{date}</p>
        </div>
        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <div style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>
            {time}
          </div>
          <div style={{ color: '#666', fontSize: '0.9em' }}>{location}</div>
        </div>
      </div>
      <p style={{ color: '#666', lineHeight: '1.6', margin: '15px 0 0 0' }}>
        {description}
      </p>
    </Card>
  );
}
