import { FormEvent, JSX, useState } from "react";
import { useApp } from "../context/AppContext";
import Card from "./Card";

export default function AdminLoginForm(): JSX.Element {
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
