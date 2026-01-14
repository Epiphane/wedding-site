import React, { JSX } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

const Hotels = [
  {
    link: "https://www.bestwestern.com/en_US/book/hotel-rooms.05426.html?iata=00170260&%20ssob=PSBM00199G&cid=PSBM00199G:google:Conversion_National_X_US_Google_BW_BW_BR_X_Consolidated_En_District6_Cali_Primary:Best%20Western%20Rose%20Garden%20Inn",
    name: "Best Western Rose Garden Inn",
    drive: 30,
  },
  {
    link: "https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=WVIWBHX&arrivalDate=2026-08-21&departureDate=2026-08-22&room1NumAdults=1&displayCurrency=USD&aarpRate=",
    name: "Hampton Inn & Suites Watsonville",
    drive: 30,
  },
  {
    link: "https://www.hilton.com/en/book/reservation/rooms/?ctyhocn=MRYSEUP&arrivalDate=2026-08-21&departureDate=2026-08-22&room1NumAdults=1&displayCurrency=USD&aarpRate=",
    name: "Seacliff Inn Aptos, Tapestry Collection by Hilton",
    drive: 27,
  },
  {
    link: "https://www.marriott.com/en-us/hotels/sjccp-fairfield-inn-and-suites-santa-cruz-capitola/overview/",
    name: "Fairfield by Marriott Inn & Suites Santa Cruz - Capitola",
    drive: 32,
  },
  {
    link: "https://www.marriott.com/en-us/hotels/sjcru-courtyard-santa-cruz/overview/",
    name: "Courtyard by Marriott Santa Cruz",
    drive: 38,
  },
];

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
              We recommend staying in Watsonville, CA for convenience or Santa Cruz, CA for entertainment. Both offer a variety of hotels and rentals, and we will have a shuttle which picks up and drops off at a location which will have plenty of parking (TBD).
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
                {
                  Hotels.map(({ name, link, drive }) => (
                    <li className="hotel">
                      <a target="_blank" href={link}>
                        {name}
                      </a> ({drive} min. drive)
                    </li>
                  ))
                }
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
              The Ampitheatre of the Redwoods is located in the Santa Cruz Mountains, with shuttle service provided to Watsonville, CA. <br />

              If you are unable to take the shuttle, or plan on staying the night in one of the cabins/campsites, please note that in the RSVP so we ensure all parking is accommodated!
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
                <li>Return Shuttle: Every 30 minutes, from 8:00 PM - 10:00 PM</li>
                <li>Please note in your RSVP if you will be using the shuttle so we may have a list provided for the drivers :)</li>
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
              <h2 style={{ marginTop: '16px' }}>From The North:</h2>
              <div
                style={{
                  background: 'rgb(255, 252, 110)',
                  padding: '16px',
                  borderRadius: '8px',
                  marginTop: '4px',
                  display: "flex",
                  alignItems: "center",
                }}
              >

                <div style={{
                  fontSize: "24px",
                  paddingRight: "12px",
                }} >
                  <i className="fa fa-exclamation-triangle" aria-hidden="true" />
                </div>
                The default directions via Highland Way are very remote, curvy and can take longer than if you follow the Highway 1 route below.
              </div>

              <ul style={{ paddingLeft: '20px' }}>
                <li>Drive to Santa Cruz and then take Highway 1 South.</li>
                <li>Take the Freedom Boulevard exit and go left over the freeway.</li>
                <li>After 5 miles, take a left on Corralitos Road.</li>
                <li>Follow Corralitos Road for 2 miles.</li>
                <li>At the four-way stop sign the road becomes Eureka Canyon.</li>
                <li>Go straight through the stop sign onto Eureka Canyon Road and continue for 6.7 miles.</li>
                <li>Pema Osel Ling is on the left side, with a big blue sign posted at the entrance.</li>
                <li>Continue up the driveway, then veer right at the welcome sign for parking.</li>
              </ul>

              <h2 style={{ marginTop: '16px' }}>From the South:</h2>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Head north on Highway 1.</li>
                <li>Take the Airport Boulevard Exit.</li>
                <li>At the stop light on Airport and Freedom Blvd., turn left and stay left onto Freedom Boulevard, follow it for a couple of miles to the next stop sign.</li>
                <li>At the stop sign, make a right onto Corralitos Road.</li>
                <li>Follow Corralitos Road for 2 miles.</li>
                <li>At the four-way stop sign the road becomes Eureka Canyon.</li>
                <li>Go straight through the stop sign onto Eureka Canyon Road and continue for 6.7 miles.</li>
                <li>Pema Osel Ling is on the left side, with a big blue sign posted at the entrance.</li>
                <li>Continue up the driveway, then veer right at the welcome sign for parking.</li>
              </ul>
            </p>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
}
