import React, { useState } from 'react';
import { users } from '../mockData';
import { Lock, Store } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            onLogin(user);
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <Store size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                <h2 className="text-gradient">Bakery POS System</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your credentials to continue</p>

                <form className="login-form" onSubmit={handleSubmit}>
                    {error && <div style={{ color: 'var(--danger)', fontSize: '14px' }}>{error}</div>}
                    <input
                        type="text"
                        placeholder="Username (admin / cashier1 / cashier2)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password (123)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn" style={{ marginTop: '16px' }}>
                        <Lock size={18} />
                        Login Securely
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
