import React, { useState, useEffect } from 'react';

const SlaTimer = ({ ticket }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('ON_TRACK');

  // ✅ Check if ticket is completed (Closed, Resolved, or Repaired)
  const isCompleted = ['closed', 'resolved', 'repaired'].includes(
    (ticket.status || '').toLowerCase()
  );

  useEffect(() => {
    // ✅ Don't run timer for completed tickets
    if (isCompleted) {
      setStatus('COMPLETED');
      setTimeLeft(0);
      return;
    }

    if (!ticket.slaFirstResponseDue && !ticket.slaResolutionDue) return;

    const calculateStatus = () => {
      const now = new Date();
      
      // Determine which deadline to track
      const target = ticket.firstResponseAt 
        ? new Date(ticket.slaResolutionDue) 
        : new Date(ticket.slaFirstResponseDue);
      
      const diff = target - now;
      
      // Calculate total duration for percentage
      const createdAt = new Date(ticket.createdAt);
      const totalDuration = target - createdAt;
      const elapsed = now - createdAt;
      const percentElapsed = elapsed / totalDuration;

      if (diff <= 0) {
        setStatus('BREACHED');
      } else if (percentElapsed > 0.8) { // Less than 20% time left
        setStatus('AT_RISK');
      } else {
        setStatus('ON_TRACK');
      }

      setTimeLeft(diff);
    };

    calculateStatus();
    const timer = setInterval(calculateStatus, 1000);

    return () => clearInterval(timer);
  }, [ticket, isCompleted]); // ✅ Added isCompleted to dependency array

  const formatTime = (ms) => {
    if (ms <= 0) return 'BREACHED';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'COMPLETED': // ✅ New status
        return { 
          bg: '#d1fae5', 
          text: '#059669', 
          border: '#6ee7b7', 
          label: 'COMPLETED',
          dot: '#059669'
        };
      case 'BREACHED':
        return { 
          bg: '#fee2e2', 
          text: '#dc2626', 
          border: '#fecaca', 
          label: 'SLA BREACHED',
          dot: '#dc2626'
        };
      case 'AT_RISK':
        return { 
          bg: '#fef3c7', 
          text: '#d97706', 
          border: '#fde68a', 
          label: 'AT RISK',
          dot: '#d97706'
        };
      default:
        return { 
          bg: '#dbeafe', 
          text: '#2563eb', 
          border: '#bfdbfe', 
          label: 'ON TRACK',
          dot: '#2563eb'
        };
    }
  };

  const styles = getStatusStyles();
  const isFirstResponse = !ticket.firstResponseAt;
  
  if (!ticket.slaFirstResponseDue && !ticket.slaResolutionDue) return null;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px',
      borderRadius: '999px',
      background: styles.bg,
      border: `1.5px solid ${styles.border}`,
      fontSize: '12px',
      fontWeight: 700,
      color: styles.text,
      fontFamily: 'monospace',
      whiteSpace: 'nowrap'
    }}>
      <span style={{ 
        width: '8px', 
        height: '8px', 
        borderRadius: '50%', 
        background: styles.dot,
        animation: status === 'AT_RISK' ? 'pulse 1.5s infinite' : 'none',
        flexShrink: 0
      }} />
      <span>{styles.label}</span>
      <span style={{ opacity: 0.5 }}>|</span>
      {/* ✅ Show "Done" instead of timer for completed tickets */}
      <span>{isCompleted ? '' : (isFirstResponse ? 'Response: ' : 'Resolution: ')}</span>
      <span>{isCompleted ? 'Done' : formatTime(timeLeft)}</span>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default SlaTimer;