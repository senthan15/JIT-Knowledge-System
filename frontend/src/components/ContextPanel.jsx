import React from 'react';

export default function ContextPanel({ context, setContext }) {
    return (
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Case Context</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Claim Type</label>
                <select
                    className="input-field"
                    value={context.claimType}
                    onChange={(e) => setContext({ ...context, claimType: e.target.value })}
                >
                    <option value="Auto">Auto Accident</option>
                    <option value="Home">Home Insurance</option>
                    <option value="Life">Life Insurance</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Location</label>
                <input
                    type="text"
                    className="input-field"
                    value={context.location}
                    onChange={(e) => setContext({ ...context, location: e.target.value })}
                    placeholder="e.g. California"
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Policy ID</label>
                <input
                    type="text"
                    className="input-field"
                    value={context.policyId}
                    onChange={(e) => setContext({ ...context, policyId: e.target.value })}
                    placeholder="POL-123456"
                />
            </div>
        </div>
    );
}
