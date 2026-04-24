import React from 'react';

const SlaPreview = ({ priority }) => {
  const slaTimes = {
    LOW: { response: '24 hours', resolution: '5 days', color: '#6b7280' },
    MEDIUM: { response: '8 hours', resolution: '3 days', color: '#d97706' },
    HIGH: { response: '2 hours', resolution: '1 day', color: '#dc2626' },
    URGENT: { response: '30 minutes', resolution: '4 hours', color: '#7c3aed' }
  };

  if (!priority) return null;

  const times = slaTimes[priority] || slaTimes.LOW;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #eff6ff 0%, #ffffff 100%)',
      border: '1.5px solid #bfdbfe',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '20px',
      animation: 'slideIn 0.3s ease'
    }}>
      <h4 style={{ 
        margin: '0 0 14px 0', 
        fontSize: '15px', 
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: 700
      }}>
        <span>⏱️</span> Service Level Agreement
      </h4>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px'
      }}>
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #dbeafe',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            First Response
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: times.color,
            fontFamily: 'monospace'
          }}>
            {times.response}
          </div>
        </div>
        
        <div style={{
          background: '#ffffff',
          padding: '16px',
          borderRadius: '12px',
          border: '1.5px solid #dbeafe',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resolution Target
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            color: times.color,
            fontFamily: 'monospace'
          }}>
            {times.resolution}
          </div>
        </div>
      </div>
      
      <p style={{ 
        margin: '14px 0 0 0', 
        fontSize: '12px', 
        color: '#6b7280',
        lineHeight: 1.5
      }}>
        Based on <strong style={{ color: times.color }}>{priority}</strong> priority. 
        Timers start when ticket is submitted. First response = technician assignment.
      </p>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SlaPreview;