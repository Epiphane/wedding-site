import React, { useEffect, useState, FormEvent, JSX, ChangeEvent, MouseEvent } from 'react';
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
  const { request, isAuthenticated } = useApp();
  const [guestList, setGuestList] = useState<Guest[]>();
  const [pendingGuest, setPendingGuest] = useState<Guest>(defaultGuest);
  const updateGuest = (info: Partial<Guest>) =>
    setPendingGuest({ ...pendingGuest, ...info } as Guest);

  const fetchGuests = () =>
    request('/guests').then(async response => setGuestList(await response.json()));

  useEffect(() => {
    if (isAuthenticated) {
      fetchGuests();
    }
    else {
      setGuestList(undefined);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  if (!guestList) {
    return (
      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        Error fetching guest list.
      </div>
    );
  }

  return (
    <React.Fragment>
      <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
        <AdminGuestForm
          updateGuest={updateGuest}
          guestList={guestList}
          guestInfo={pendingGuest}
          isEditing={pendingGuest.id !== 0}
          onSave={() => {
            let req;
            if (pendingGuest.id !== 0) {
              req = request(`/guests/${pendingGuest.id}`, {
                method: 'PUT',
                body: JSON.stringify(pendingGuest),
              });
            }
            else {
              req = request(`/guests`, {
                method: 'POST',
                body: JSON.stringify(pendingGuest),
              });
            }
            req.then(() => {
              setPendingGuest(defaultGuest);
              fetchGuests()
            })
          }}
          onCancel={() => {
            setPendingGuest(defaultGuest);
          }}
        />
        {guestList && <AdminGuestList guestList={guestList}
          onEdit={(guest) => setPendingGuest(guest)}
          onDelete={(guest) => request(`/guests/${guest.id}`, { method: 'DELETE' })
            .then(() => fetchGuests())}
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
  guestList: Guest[];
  updateGuest: (info: Partial<Guest>) => void;
  onSave: () => void;
  onCancel: () => void;
}

function AdminGuestForm({ isEditing, guestInfo, guestList, updateGuest, onSave, onCancel }: AdminGuestFormProps): JSX.Element {
  const handleSave = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    onSave();
  };

  const [isGuestValid, setIsGuestValid] = useState(false);
  useEffect(() => {
    setIsGuestValid(
      !!guestInfo.firstName &&
      !!guestInfo.lastName
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

  const [availablePartners, setAvailablePartners] = useState<Guest[]>([]);
  useEffect(() => {
    const guestId = guestInfo.id;
    setAvailablePartners(guestList.filter(other => {
      return other.id !== guestId &&
        (other.partnerId === null || other.partnerId === guestId)
    }))
  }, [guestInfo, guestList]);

  const onSelectPartner = (e: ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'none') {
      updateGuest({ partnerId: null });
    }
    else {
      updateGuest({ partnerId: +e.target.value });
    }
  }

  const onCopyPartner = (e: MouseEvent) => {
    e.preventDefault();
    const partner = guestList.find(guest => guest.id === guestInfo.partnerId)!;
    const { address, phone, lodgingOptions, city, state, zipCode, saveTheDateSent, inviteSent } = partner;
    updateGuest({
      address, phone, lodgingOptions, city, state, zipCode, saveTheDateSent, inviteSent
    })
  }

  return (
    <Card style={{ marginBottom: '30px' }}>
      <form className='admin-form' onSubmit={handleSave}>
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
        <div>
          <label>
            Partner
          </label>
          <select onChange={onSelectPartner} defaultValue="none" value={guestInfo.partnerId === null ? 'none' : guestInfo.partnerId}>
            <option key={'none'} value={'none'}>None</option>
            {availablePartners.map(other =>
              (<option key={other.id} value={other.id}>{other.firstName} {other.lastName}</option>)
            )}
          </select>
        </div>
        <div>
          {guestInfo.partnerId ?
            (<button className='btn-primary'
              onClick={onCopyPartner}>
              Copy from partner
            </button>)
            :
            (<React.Fragment><input
              type="checkbox"
              checked={!!guestInfo.plusOneAllowed}
              onChange={e => updateGuest({ plusOneAllowed: !guestInfo.plusOneAllowed })}
            />
              Allow Plus One
            </React.Fragment>)
          }
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex' }}>
          <button className='btn-primary btn-lg'
            onClick={handleSave}
            disabled={!isGuestValid}
            style={{ flex: 1 }}
          >
            Save Guest
          </button>
          {isEditing && (
            <button className='btn-secondary btn-lg' onClick={onCancel}>
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
  const ResponseOutput = (guest: Guest) => {
    if (!guest.response) {
      return '';
    }

    const { attending, plusOne } = guest.response;
    if (attending) {
      return plusOne ? '✓ (+1)' : '✓';
    } {
      return '✗';
    }
  }

  const [confirmDelete, setConfirmDelete] = useState(0);

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
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Response</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guestList.map((guest, index) => (
              <tr key={index} style={{ borderTop: '1px solid #e9ecef' }}>
                <td>{guest.firstName}</td>
                <td>{guest.lastName}</td>
                <td>{guest.email ? '✓' : '✗'}</td>
                <td>{ResponseOutput(guest)}</td>
                <td>{guest.address ? '✓' : '✗'}</td>
                <td>{guest.phone ? '✓' : '✗'}</td>
                <td>
                  <button onClick={() => onEdit(guest)}>
                    Edit
                  </button>
                  <button
                    className={'btn-secondary' + ((confirmDelete === guest.id) ? ' confirm' : '')}
                    onClick={() => (confirmDelete === guest.id) ? onDelete(guest) : setConfirmDelete(guest.id)}>
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
