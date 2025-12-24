import React, { useEffect, useState, FormEvent, JSX, ChangeEvent, MouseEvent } from 'react';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Guest from '../../server/model/guest';
import AdminLoginForm from '../components/LoginForm';
import { PageContent } from '../components/PageContent';
import Person from '../../server/model/person';

const defaultPerson = {
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
} as Person;

const defaultGuest = {
  id: 0,
  address: '',
  city: '',
  state: '',
  zipCode: '',
  additionalGuests: 0,
  people: [defaultPerson],
} as Guest;

export default function AdminPage(): JSX.Element {
  const { request, isAuthenticated } = useApp();
  const [guestList, setGuestList] = useState<Guest[]>();
  const [pendingGuest, setPendingGuest] = useState<Guest>(defaultGuest);

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
    <PageContent>
      <AdminGuestForm
        guestInfo={pendingGuest}
        onSave={(guestInfo) => {
          const req = (pendingGuest.id !== 0) ?
            request(`/guests/${pendingGuest.id}`, {
              method: 'PUT',
              body: JSON.stringify(guestInfo),
            })
            :
            request(`/guests`, {
              method: 'POST',
              body: JSON.stringify(guestInfo),
            });

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
    </PageContent>
  );
}

type AdminPersonRowProps = {
  person: Person;
  onUpdate: (info: Partial<Person>) => void;
  onAdd?: () => void;
  onDelete?: () => void;
}

function AdminPersonRow({ person, onUpdate, onAdd, onDelete }: AdminPersonRowProps): JSX.Element {
  function TextInput({ prop, label, placeholder }: {
    prop: keyof Person;
    label?: string;
    placeholder?: string;
  }) {
    if (!label) {
      label = prop[0].toUpperCase() + prop.substring(1);
    }
    placeholder = placeholder || label;

    let inputType = 'text';

    return (
      <div>
        <input
          type={inputType}
          value={person[prop] as string || ''}
          onChange={e => onUpdate({ [prop]: e.target.value })}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <tr>
      <td>{TextInput({ prop: 'firstName' })}</td>
      <td>{TextInput({ prop: 'lastName' })}</td>
      <td>{TextInput({ prop: 'email' })}</td>
      <td>{TextInput({ prop: 'phone' })}</td>
      <td>
        {onAdd && <button onClick={onAdd}>Add</button>}
        {onDelete && <button onClick={onDelete}>Del</button>}
      </td>
    </tr>);
}

type AdminGuestFormProps = {
  guestInfo: Guest;
  onSave: (info: Guest) => void;
  onCancel: () => void;
}

function AdminGuestForm({ guestInfo, onSave, onCancel }: AdminGuestFormProps): JSX.Element {
  const isEditing = guestInfo.id !== 0;

  const [guest, setGuest] = useState<Guest>(guestInfo);
  const updateGuest = (info: Partial<Guest>) =>
    setGuest({ ...guest, ...info } as Guest);

  const handleSave = (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    onSave(guest);
  };

  const [isGuestValid, setIsGuestValid] = useState(true);
  useEffect(() => {
    setGuest(guestInfo);
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

    return (
      <div>
        <input
          type={inputType}
          value={guest[prop] as string || ''}
          onChange={e => updateGuest({ [prop]: e.target.value })}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <Card style={{ marginBottom: '30px', padding: 0 }}>
      <h2
        style={{
          padding: '20px',
          marginTop: '0',
          color: '#333',
          gridColumnStart: 1,
          gridColumnEnd: 4,
        }}
      >
        {isEditing ? 'Edit Guest Info' : 'Add New Guest'}
      </h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {guest.people.map((person, index) => {
            return <AdminPersonRow
              key={index}
              person={person}
              onUpdate={(info) => {
                updateGuest({
                  people: guest.people.map((person, i) => i !== index ? person : { ...person, ...info } as Person)
                })
              }}
              onDelete={() => updateGuest({ people: guest.people.filter((_, i) => i !== index) })}
            />;
          })}

          <tr>
            <td>
              <button onClick={() => updateGuest({ people: [...guest.people, defaultPerson] })}>Add</button>
            </td>
          </tr>
        </tbody>
      </table>
      <form className='admin-form' onSubmit={handleSave}>
        {AdminTextInput({ prop: 'address' })}
        {AdminTextInput({ prop: 'city' })}
        {AdminTextInput({ prop: 'state' })}
        {AdminTextInput({ prop: 'zipCode' })}
        <div>
          <input
            type='number'
            value={guest.additionalGuests}
            onChange={e => updateGuest({ additionalGuests: +e.target.value })}
            placeholder={'Extra Guests?'}
          />
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
                <td>{guest.people.map(g => <div>{g.firstName}</div>)}</td>
                <td>{guest.people.map(g => <div>{g.lastName}</div>)}</td>
                <td>{guest.people.some(g => !!g.email) ? '✓' : ''}</td>
                <td>{ResponseOutput(guest)}</td>
                <td>{guest.address ? '✓' : ''}</td>
                <td>{guest.people.some(g => !!g.phone) ? '✓' : ''}</td>
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
