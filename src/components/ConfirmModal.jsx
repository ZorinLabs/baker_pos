import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", type = "primary" }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div className="glass-panel modal-content animate-in" style={{
                width: '400px', padding: '32px', border: `1px solid var(--${type})`,
                boxShadow: `0 0 30px rgba(0,0,0,0.5), 0 0 10px var(--${type}-glow)`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertTriangle size={24} color={`var(--${type})`} />
                        <h3 style={{ margin: 0 }}>{title}</h3>
                    </div>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn"
                        style={{ flex: 1, backgroundColor: type === 'danger' ? 'var(--danger)' : 'var(--primary)' }}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                    <button className="btn secondary" style={{ flex: 1 }} onClick={onCancel}>
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
