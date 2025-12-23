import React, { useEffect, useState, FormEvent, JSX } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Guest from '../../server/model/guest';

const defaultGuest = {
  id: 0,
  firstName: '',
  lastName: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  gender: '',
  phone: '',
  plusOneAllowed: false,
} as Guest;

export default function AdminPage(): JSX.Element {
  const { request, isAuthenticated, updateModel } = useApp();
  const [guestList, setGuestList] = useState<Guest[]>();
  const [pendingGuest, setPendingGuest] = useState<Guest>(defaultGuest);
  const updateGuest = (info: Partial<Guest>) =>
    setPendingGuest({ ...pendingGuest, ...info } as Guest);

  useEffect(() => {
    if (isAuthenticated) {
      request('/guests').then(async response => setGuestList(await response.json()));
    }
    else {
      setGuestList(undefined);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <React.Fragment>
      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        <AdminGuestForm
          updateGuest={updateGuest}
          guestInfo={pendingGuest}
          isEditing={pendingGuest.id !== 0}
          onSave={() => {
            request(`/guests/${pendingGuest.id}`, {
              method: 'PUT',
              body: JSON.stringify(pendingGuest),
            });
          }}
          onCancel={() => {
            setPendingGuest(defaultGuest);
          }}
        />
        {guestList && <AdminGuestList guestList={guestList}
          onEdit={(guest) => setPendingGuest(guest)}
          onDelete={(guest) => { }}
        // updateModel(prev => ({
        //   ...prev,
        //   adminEditingGuest: guest,
        //   adminFormName: guest.firstName,
        //   adminFormEmail: guest.email,
        //   adminFormPlusOne: guest.plusOne
        // }));
        // }}
        />
        }
      </div>
    </React.Fragment>
  );
}

function AdminLoginForm(): JSX.Element {
  const { setAdminPassword } = useApp();
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    setAdminPassword(password)
      .catch(err => setError(err))
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <Card style={{ padding: '40px' }}>
        <h2
          style={{
            marginTop: '0',
            color: '#333',
            textAlign: 'center'
          }}
        >
          Admin Login
        </h2>
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
            Invalid password. Please try again.
          </div>
        )}
        <div style={{ marginBottom: '20px' }}>
          <label>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter admin password"
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
          disabled={password.trim() === ''}
          style={{
            background: password.trim() === '' ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: password.trim() === '' ? 'not-allowed' : 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            width: '100%'
          }}
        >
          Login
        </button>
      </Card>
    </div>
  );
}

type AdminGuestFormProps = {
  isEditing: boolean;
  guestInfo: Guest;
  updateGuest: (info: Partial<Guest>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function AdminGuestForm({ isEditing, guestInfo, updateGuest, onSave, onCancel }: AdminGuestFormProps): JSX.Element {
  const handleSave = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    onSave();
  };

  const [isGuestValid, setIsGuestValid] = useState(false);
  useEffect(() => {
    setIsGuestValid(
      !!guestInfo.firstName &&
      !!guestInfo.lastName &&
      !!guestInfo.email
    );
  }, [guestInfo]);

  type AdminTextInputProps = {
    prop: keyof Guest;
    label?: string;
    placeholder?: string;
  }

  function AdminTextInput({ prop, label, placeholder }: AdminTextInputProps) {
    if (!label) {
      label = prop[0].toUpperCase() + prop.substring(1);
    }
    placeholder = placeholder || label;

    let inputType = 'text';
    if (prop === 'email') { inputType = 'email'; }
    if (prop === 'phone') { inputType = 'tel'; }

    return (
      <div>
        <input
          type={inputType}
          value={guestInfo[prop] as string || ''}
          onChange={e => updateGuest({ [prop]: e.target.value })}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <Card style={{ marginBottom: '30px' }}>
      <form onSubmit={handleSave}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          <h2
            style={{
              marginTop: '0',
              color: '#333',
              gridColumnStart: 1,
              gridColumnEnd: 4,
            }}
          >
            {isEditing ? 'Edit Guest' : 'Add New Guest'}
          </h2>
          {AdminTextInput({ prop: 'firstName', label: "First Name" })}
          {AdminTextInput({ prop: 'lastName', label: "Last Name" })}
          {AdminTextInput({ prop: 'email' })}
          {AdminTextInput({ prop: 'address' })}
          {AdminTextInput({ prop: 'city' })}
          {AdminTextInput({ prop: 'state' })}
          {AdminTextInput({ prop: 'zipCode' })}
          {AdminTextInput({ prop: 'gender' })}
          {AdminTextInput({ prop: 'phone' })}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={!!guestInfo.plusOneAllowed}
              onChange={e => updateGuest({ plusOneAllowed: !guestInfo.plusOneAllowed })}
              style={{
                marginRight: '10px',
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }}
            />
            Allow Plus One
          </label>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={!isGuestValid}
            style={{
              background: (!isGuestValid) ? '#ccc' : '#333',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              fontSize: '1em',
              borderRadius: '2px',
              cursor: (!isGuestValid) ? 'not-allowed' : 'pointer',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              flex: '1'
            }}
          >
            Save Guest
          </button>
          {isEditing && (
            <button
              onClick={onCancel}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                fontSize: '1em',
                borderRadius: '2px',
                cursor: 'pointer',
                fontFamily: "'Georgia', 'Times New Roman', serif"
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

type AdminGuestListProps = {
  guestList: Guest[];
  onEdit: (guest: Guest) => void;
  onDelete: (guest: Guest) => void;
}

function AdminGuestList({ guestList, onEdit, onDelete }: AdminGuestListProps): JSX.Element {
  return (
    <Card style={{ padding: '0', overflow: 'hidden' }}>
      <h2
        style={{
          padding: '20px',
          margin: '0',
          color: '#333',
          borderBottom: '2px solid #f0f0f0'
        }}
      >
        Guest List ({guestList.length} guests)
      </h2>
      {guestList.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#666'
          }}
        >
          No guests yet. Add your first guest above!
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>
                First Name
              </th>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>
                Last Name
              </th>
              <th style={{ textAlign: 'left', padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>
                Email
              </th>
              <th style={{ textAlign: 'center', padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>
                Plus One
              </th>
              <th style={{ textAlign: 'right', padding: '15px 20px', color: '#333', fontWeight: 'bold' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {guestList.map((guest, index) => (
              <tr key={index} style={{ borderTop: '1px solid #e9ecef' }}>
                <td style={{ padding: '15px 20px' }}>{guest.firstName}</td>
                <td style={{ padding: '15px 20px' }}>{guest.lastName}</td>
                <td style={{ padding: '15px 20px', color: '#666' }}>{guest.email}</td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  {guest.response?.plusOne ? '✓' : '✗'}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => onEdit(guest)}
                    style={{
                      background: '#333',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      marginRight: '10px',
                      fontSize: '0.9em',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: "'Georgia', 'Times New Roman', serif"
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(guest)}
                    style={{
                      background: '#666',
                      color: 'white',
                      border: 'none',
                      padding: '8px 15px',
                      fontSize: '0.9em',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      fontFamily: "'Georgia', 'Times New Roman', serif"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
