import React, { ChangeEvent } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { FrontendModel } from '../types';

interface RsvpHandlers {
  handleUpdateRsvpName: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLookupGuest: () => void;
  handleUpdateAttending: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleUpdatePlusOneName: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUpdatePlusOneAttending: (e: ChangeEvent<HTMLSelectElement>) => void;
  handleSubmitRsvp: () => void;
}

export default function RsvpPage(): JSX.Element {
  const { model, updateModel, sendToBackend } = useApp();

  const handleUpdateRsvpName = (e: ChangeEvent<HTMLInputElement>) => {
    updateModel(prev => ({ ...prev, rsvpName: e.target.value }));
  };

  const handleLookupGuest = () => {
    // sendToBackend({ type: 'lookupGuestByName', name: model.rsvpName });
  };

  const handleUpdateAttending = (e: ChangeEvent<HTMLSelectElement>) => {
    updateModel(prev => ({
      ...prev,
      rsvpAttending: e.target.value as 'attending' | 'notAttending'
    }));
  };

  const handleUpdatePlusOneName = (e: ChangeEvent<HTMLInputElement>) => {
    updateModel(prev => ({ ...prev, rsvpPlusOneName: e.target.value }));
  };

  const handleUpdatePlusOneAttending = (e: ChangeEvent<HTMLSelectElement>) => {
    updateModel(prev => ({
      ...prev,
      rsvpPlusOneAttending: e.target.value as 'attending' | 'notAttending'
    }));
  };

  const handleSubmitRsvp = () => {
    if (model.rsvpStep === 'guestConfirmed' && model.confirmedGuest) {
      // const rsvp = {
      //   guestName: model.confirmedGuest.name,
      //   email: model.confirmedGuest.email,
      //   attending: model.rsvpAttending,
      //   plusOneName: model.confirmedGuest.plusOne && model.rsvpPlusOneName !== '' ? model.rsvpPlusOneName : null,
      //   plusOneAttending: model.confirmedGuest.plusOne && model.rsvpPlusOneName !== '' ? model.rsvpPlusOneAttending : null
      // };
      // // sendToBackend({ type: 'submitRsvpToBackend', rsvp });
      // updateModel(prev => ({ ...prev, rsvpSubmitted: true }));
    }
  };

  return (
    <div>
      <Header
        weddingDate={model.weddingDate}
        venue={model.venue}
        coupleNames={model.coupleNames}
      />
      <NavigationBar isAuthenticated={model.isAuthenticated} />

      <div
        style={{
          background: 'white',
          padding: '80px 20px',
          textAlign: 'center',
          minHeight: '60vh'
        }}
      >
        <h2
          style={{
            fontSize: '2em',
            marginBottom: '20px',
            color: '#333',
            fontWeight: '400',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          RSVP
        </h2>
        <p
          style={{
            color: '#666',
            fontSize: '1.1em',
            marginBottom: '40px',
            fontFamily: "'Georgia', 'Times New Roman', serif"
          }}
        >
          We'd love to celebrate with you!
        </p>
        {renderRsvpForm(model, {
          handleUpdateRsvpName,
          handleLookupGuest,
          handleUpdateAttending,
          handleUpdatePlusOneName,
          handleUpdatePlusOneAttending,
          handleSubmitRsvp
        })}
      </div>

      <Footer />
    </div>
  );
}

function renderRsvpForm(model: FrontendModel, handlers: RsvpHandlers): JSX.Element | null {
  if (model.rsvpStep === 'enteringName' || model.rsvpStep === 'guestNotFound') {
    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '30px auto',
          textAlign: 'left',
          background: '#fafafa',
          padding: '40px',
          borderRadius: '2px',
          border: '1px solid #e0e0e0'
        }}
      >
        {model.rsvpStep === 'guestNotFound' && (
          <div
            style={{
              background: '#f8d7da',
              color: '#721c24',
              padding: '15px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            We couldn't find your name on the guest list. Please check the spelling and try again.
          </div>
        )}
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Please enter your name to find your invitation.
        </p>
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333'
            }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={model.rsvpName}
            onChange={handlers.handleUpdateRsvpName}
            placeholder="Enter your full name"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1em',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          onClick={handlers.handleLookupGuest}
          disabled={model.rsvpName.trim() === ''}
          style={{
            background: model.rsvpName.trim() === '' ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: model.rsvpName.trim() === '' ? 'not-allowed' : 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            width: '100%'
          }}
        >
          {model.rsvpStep === 'guestNotFound' ? 'Try Again' : 'Find My Invitation'}
        </button>
      </div>
    );
  }

  if (model.rsvpStep === 'guestConfirmed' && model.confirmedGuest) {
    const guest = model.confirmedGuest;

    if (model.rsvpSubmitted) {
      return (
        <div
          style={{
            maxWidth: '500px',
            margin: '30px auto',
            background: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '5px',
            textAlign: 'center',
            border: '1px solid #e0e0e0'
          }}
        >
          Thank you! Your RSVP has been received. Total RSVPs: {model.rsvpCount}
        </div>
      );
    }

    return (
      <div
        style={{
          maxWidth: '500px',
          margin: '30px auto',
          textAlign: 'left',
          background: '#fafafa',
          padding: '40px',
          borderRadius: '2px',
          border: '1px solid #e0e0e0'
        }}
      >
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          Welcome, {guest.firstName}!
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            Will you attend?
          </label>
          <select
            onChange={handlers.handleUpdateAttending}
            value={model.rsvpAttending}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1em',
              boxSizing: 'border-box'
            }}
          >
            <option value="attending">Yes, I'll be there!</option>
            <option value="notAttending">Sorry, can't make it</option>
          </select>
        </div>
        {guest.response.plusOne && (
          <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#333',
                fontWeight: 'bold'
              }}
            >
              Plus One (Optional)
            </label>
            <p style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>
              You're invited to bring a guest!
            </p>
            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                Plus One Name
              </label>
              <input
                type="text"
                value={model.rsvpPlusOneName}
                onChange={handlers.handleUpdatePlusOneName}
                placeholder="Guest name (optional)"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1em',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {model.rsvpPlusOneName !== '' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>
                  Will they attend?
                </label>
                <select
                  onChange={handlers.handleUpdatePlusOneAttending}
                  value={model.rsvpPlusOneAttending}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '1em',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="attending">Yes</option>
                  <option value="notAttending">No</option>
                </select>
              </div>
            )}
          </div>
        )}
        <button
          onClick={handlers.handleSubmitRsvp}
          style={{
            background: '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            width: '100%',
            marginTop: '20px'
          }}
        >
          Submit RSVP
        </button>
      </div>
    );
  }

  return null;
}
