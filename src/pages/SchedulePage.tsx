import React, { JSX } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

interface ScheduleEventProps {
  date: string;
  title: string;
  time: string;
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
            Reception Schedule
          </h2>
          <Card style={{ padding: '10px' }}>
            {
              [
                {
                  title: "Shuttle Pickup",
                  time: "2:30 PM",
                  description: "The final shuttle departs for Amphitheater of the Redwoods.",
                },
                {
                  title: "Cocktail Hour",
                  time: "3:30-4:30 PM",
                  description: "Enjoy drinks and appetizers while we get spruced up.",
                },
                {
                  title: "Dinner",
                  time: "5:00 PM",
                  description: "Join us for the main event (food!) in the Gallery Meadow.",
                },
                {
                  title: "Reception Cont.",
                  time: "6:15 PM",
                  description: "Toasts, dancing, and celebration among the redwoods!",
                },
                {
                  title: "Reception Wind-Down",
                  time: "10:00 PM",
                  description: "Amplified music will be cut off, those who wish to stay longer can move to the firepit for acoustics, chit-chat, and a night cap or snack.",
                },
                {
                  title: "Shuttle Return",
                  time: "10:30 PM",
                  description: "The final shuttle departs back to Watsonville.",
                },
              ].map(({ title, time, description }) => (
                <Card style={{ border: 'none', borderBottom: '1px solid #e0e0e0', }}>
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
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <div style={{ color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>
                        {time}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#666', lineHeight: '1.6', margin: '15px 0 0 0' }}>
                    {description}
                  </p></Card>
              ))
            }
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
