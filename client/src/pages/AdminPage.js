import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Card from '../components/Card';

export default function AdminPage() {
  const { model, updateModel, sendToBackend } = useApp();
  const [name1, name2] = model.coupleNames;

  useEffect(() => {
    if (model.isAuthenticated) {
      sendToBackend({ type: 'getGuestList' });
    }
  }, [model.isAuthenticated, sendToBackend]);

  if (model.isAuthenticated) {
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
            maxWidth: '1000px',
            margin: '20px auto',
            padding: '0 20px',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={() => {
              sendToBackend({ type: 'logoutBackend' });
              updateModel(prev => ({ ...prev, isAuthenticated: false }));
            }}
            style={{
              background: '#333',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              fontSize: '0.9em',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: "'Georgia', 'Times New Roman', serif"
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
          <AdminGuestForm model={model} updateModel={updateModel} sendToBackend={sendToBackend} />
          <AdminGuestTable 
            model={model} 
            updateModel={updateModel} 
            sendToBackend={sendToBackend}
            onEdit={(guest) => {
              updateModel(prev => ({
                ...prev,
                adminEditingGuest: guest,
                adminFormName: guest.name,
                adminFormEmail: guest.email,
                adminFormPlusOne: guest.plusOne
              }));
            }}
          />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header
        weddingDate={model.weddingDate}
        venue={model.venue}
        coupleNames={model.coupleNames}
      />
      <NavigationBar isAuthenticated={model.isAuthenticated} />
      <AdminLoginForm model={model} updateModel={updateModel} sendToBackend={sendToBackend} />
      <Footer />
    </div>
  );
}

function AdminLoginForm({ model, updateModel, sendToBackend }) {
  const handlePasswordChange = (e) => {
    updateModel(prev => ({ ...prev, adminPasswordInput: e.target.value }));
  };

  const handleLogin = () => {
    sendToBackend({ type: 'adminLogin', password: model.adminPasswordInput });
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
        {model.adminLoginError && (
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
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={model.adminPasswordInput}
            onChange={handlePasswordChange}
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
          onClick={handleLogin}
          disabled={model.adminPasswordInput.trim() === ''}
          style={{
            background: model.adminPasswordInput.trim() === '' ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: model.adminPasswordInput.trim() === '' ? 'not-allowed' : 'pointer',
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

function AdminGuestForm({ model, updateModel, sendToBackend }) {
  const handleNameChange = (e) => {
    updateModel(prev => ({ ...prev, adminFormName: e.target.value }));
  };

  const handleEmailChange = (e) => {
    updateModel(prev => ({ ...prev, adminFormEmail: e.target.value }));
  };

  const handlePlusOneChange = (e) => {
    updateModel(prev => ({ ...prev, adminFormPlusOne: e.target.checked }));
  };

  const handleSave = () => {
    const guest = {
      name: model.adminFormName,
      email: model.adminFormEmail,
      plusOne: model.adminFormPlusOne
    };
    sendToBackend({ type: 'addOrUpdateGuest', guest });
    updateModel(prev => ({
      ...prev,
      adminFormName: '',
      adminFormEmail: '',
      adminFormPlusOne: false,
      adminEditingGuest: null
    }));
  };

  const handleCancel = () => {
    updateModel(prev => ({
      ...prev,
      adminFormName: '',
      adminFormEmail: '',
      adminFormPlusOne: false,
      adminEditingGuest: null
    }));
  };

  return (
    <Card style={{ marginBottom: '30px' }}>
      <h2
        style={{
          marginTop: '0',
          color: '#333'
        }}
      >
        {model.adminEditingGuest ? 'Edit Guest' : 'Add New Guest'}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            Name
          </label>
          <input
            type="text"
            value={model.adminFormName}
            onChange={handleNameChange}
            placeholder="Guest name"
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
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '5px',
              color: '#333',
              fontWeight: 'bold'
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={model.adminFormEmail}
            onChange={handleEmailChange}
            placeholder="guest@example.com"
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
            checked={model.adminFormPlusOne}
            onChange={handlePlusOneChange}
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
          disabled={model.adminFormName.trim() === '' || model.adminFormEmail.trim() === ''}
          style={{
            background: (model.adminFormName.trim() === '' || model.adminFormEmail.trim() === '') ? '#ccc' : '#333',
            color: 'white',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1em',
            borderRadius: '2px',
            cursor: (model.adminFormName.trim() === '' || model.adminFormEmail.trim() === '') ? 'not-allowed' : 'pointer',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            flex: '1'
          }}
        >
          Save Guest
        </button>
        {model.adminEditingGuest && (
          <button
            onClick={handleCancel}
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
    </Card>
  );
}

function AdminGuestTable({ model, updateModel, sendToBackend, onEdit }) {
  const handleEdit = (guest) => {
    if (onEdit) {
      onEdit(guest);
    }
  };

  const handleDelete = (email) => {
    sendToBackend({ type: 'deleteGuestByEmail', email });
  };

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
        Guest List ({model.adminGuestList.length} guests)
      </h2>
      {model.adminGuestList.length === 0 ? (
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
                Name
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
            {model.adminGuestList.map((guest, index) => (
              <tr key={index} style={{ borderTop: '1px solid #e9ecef' }}>
                <td style={{ padding: '15px 20px' }}>{guest.name}</td>
                <td style={{ padding: '15px 20px', color: '#666' }}>{guest.email}</td>
                <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                  {guest.plusOne ? '✓' : '✗'}
                </td>
                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleEdit(guest)}
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
                    onClick={() => handleDelete(guest.email)}
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
