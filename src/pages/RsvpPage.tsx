import React, { ChangeEvent, FormEvent, JSX, useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function RsvpPage(): JSX.Element {
  const { request, login, model, personInfo, areRsvpsOpen } = useApp();
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guestInfo, setGuestInfo] = useState(personInfo?.guest);

  useEffect(() => {
    if (personInfo && personInfo.guest) {
      setGuestInfo(personInfo.guest);
    }
  }, [personInfo]);

  // local RSVP state pieces matching rsvp.ts
  const [attending, setAttending] = useState<boolean>(true);
  const [plusOne, setPlusOne] = useState<boolean>(false);
  const [plusOneName, setPlusOneName] = useState<string>('');
  const [onsite, setOnsite] = useState<string>('both');

  // initialize form state from any existing response when guestInfo changes
  useEffect(() => {
    if (guestInfo && guestInfo.response) {
      setAttending(guestInfo.response.attending);
      setPlusOne(guestInfo.response.plusOne);
      setPlusOneName(guestInfo.response.plusOneName || '');
      setOnsite(guestInfo.response.onsite);
    }
  }, [guestInfo]);

  if (!areRsvpsOpen) {
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
        <h3 style={{ textAlign: 'center', marginBottom: '12px' }}>We're not ready for RSVPs yet!</h3>
        <p style={{ textAlign: 'center' }}>Please come back after March 22nd.</p>

      </div>
    );
  }

  if (personInfo === undefined) {
    const handleFormSubmit = (event: FormEvent | MouseEvent) => {
      event.preventDefault();
      request('/guests/me', { headers: { Authorization: `Basic ${btoa(`${nameInput}:test`)}` } })
        .then(result => {
          if (result.status !== 200) {
            setError(`We couldn't find your name on the guest list. Please check the spelling and try again.`);
            return;
          }
          login(nameInput)
            .then(() => setError(null))
            .catch(err => setError(err));
        })
    };

    return (
      <form
        onSubmit={handleFormSubmit}
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
        {error && (
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
            {error}
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
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
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
          onClick={handleFormSubmit}
          disabled={nameInput.trim() === ''}
          style={{
            background: nameInput.trim() === '' ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: nameInput.trim() === '' ? 'not-allowed' : 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            width: '100%'
          }}
        >
          {model.rsvpStep === 'guestNotFound' ? 'Try Again' : 'Find My Invitation'}
        </button>
      </form>
    );
  }

  if (!guestInfo) {
    return (<div>Loading...</div>);
  }

  // event handlers updating local state
  const handleAttendingChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAttending(e.target.value === 'attending');
  };

  const handleBringPlusOneToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setPlusOne(e.target.checked);
  };

  const handlePlusOneNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlusOneName(e.target.value);
  };

  const handleOnsiteChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setOnsite(e.target.value);
  };

  const handleSubmitRsvp = () => {
    if (!guestInfo) return;

    const payload = {
      attending,
      plusOne,
      plusOneName: plusOne ? plusOneName : '',
      onsite
    };

    request('/guests/me/rsvp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(res => {
      if (res.status === 201) {
        // refresh guest info from server
        return request('/guests/me');
      }
      throw new Error('Failed to submit RSVP');
    }).then(res => res && res.json())
      .then(data => {
        // update guestInfo so banner shows and form is populated
        setGuestInfo(data);
      })
      .catch(err => setError(err.message || String(err)));
  };

  // Get the names of all people in the guest group
  const guestNames = guestInfo.people && guestInfo.people.length > 0
    ? guestInfo.people.map(p => `${p.firstName} ${p.lastName}`).join(', ')
    : personInfo?.firstName;

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
      {guestInfo.response ? (
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}
        >
          Thanks, {personInfo.firstName}!<br style={{ marginBottom: '4px' }} />You can update your response below.
        </div>
      ) : (<div
        style={{
          background: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}
      >
        Welcome, {personInfo.firstName}!
      </div>
      )}

      {/* Main attendance question for guest group */}
      <div style={{ marginBottom: '20px' }}>
        <label
          style={{
            display: 'block',
            marginBottom: '5px',
            color: '#333',
            fontWeight: 'bold'
          }}
        >
          Will you{guestInfo.people && guestInfo.people.length > 1 ? ` and ${guestInfo.people.filter(p => p.id !== personInfo.id).map(p => p.firstName).join(', ')}` : ''} attend?
        </label>
        <select
          onChange={handleAttendingChange}
          value={attending ? 'attending' : 'notAttending'}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '1em',
            boxSizing: 'border-box'
          }}
        >
          <option value="attending">Yes, {guestInfo.people.length > 1 ? "We'll" : "I'll"} be there!</option>
          <option value="notAttending">Sorry, can't make it</option>
        </select>
      </div>

      {guestInfo.lodgingOptions !== '' && (
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            We would love for you to stay on-site!
          </label>
          <select
            onChange={handleOnsiteChange}
            value={onsite}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1em',
              boxSizing: 'border-box'
            }}
          >
            <option value="both">{guestInfo.people.length === 1 ? "I'll" : "We'll"} stay Friday & Saturday!</option>
            <option value="fri">{guestInfo.people.length === 1 ? "I'll" : "We'll"} stay Friday night!</option>
            <option value="sat">{guestInfo.people.length === 1 ? "I'll" : "We'll"} stay Saturday night!</option>
            <option value="">{guestInfo.people.length === 1 ? "I'll" : "We'll"} find {guestInfo.people.length === 1 ? "my" : "our"} own lodging</option>
          </select>
        </div>
      )}

      {/* Additional guests form (only if additionalGuests > 0) */}
      {guestInfo.additionalGuests > 0 && (
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '15px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            Will you be bringing an additional guest?
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', marginBottom: '15px', }}>
            <input
              type="checkbox"
              checked={plusOne}
              onChange={handleBringPlusOneToggle}
              style={{ marginRight: '8px', }}
            />
            Yes
          </label>

          {plusOne && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                value={plusOneName}
                onChange={handlePlusOneNameChange}
                placeholder="Name"
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
          )}
        </div>
      )}

      <button
        onClick={handleSubmitRsvp}
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
