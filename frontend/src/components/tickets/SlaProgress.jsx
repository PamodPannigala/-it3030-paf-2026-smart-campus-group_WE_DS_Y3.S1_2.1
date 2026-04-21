import React, { useState, useEffect } from 'react';

const SlaProgress = ({ ticket }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('ON_TRACK');

  // ✅ Check if ticket is completed
  const isCompleted = ['closed', 'resolved', 'repaired'].includes(
    (ticket?.status || '').toLowerCase()
  );

  useEffect(() => {
    // ✅ Don't run timer for completed tickets
    if (isCompleted) {
      setStatus('COMPLETED');
      setProgress(100);
      return;
    }

    if (!ticket.slaFirstResponseDue && !ticket.slaResolutionDue) return;

    const calculate = () => {
      const now = new Date();
      const created = new Date(ticket.createdAt);
      
      // Determine active target
      const target = ticket.firstResponseAt 
        ? new Date(ticket.slaResolutionDue) 
        : new Date(ticket.slaFirstResponseDue);
      
      const total = target - created;
      const elapsed = now - created;
      const percent = Math.min(100, (elapsed / total) * 100);
      
      setProgress(percent);
      
      // Determine status
      if (now > target) {
        setStatus('BREACHED');
      } else if (percent > 80) {
        setStatus('AT_RISK');
      } else {
        setStatus('ON_TRACK');
      }
    };

    calculate();
    const timer = setInterval(calculate, 30000);

    return () => clearInterval(timer);
  }, [ticket, isCompleted]); // ✅ Added isCompleted dependency

  const getBarColor = () => {
    if (status === 'COMPLETED') return '#059669'; // ✅ Green for completed
    if (status === 'BREACHED') return '#dc2626';
    if (status === 'AT_RISK') return '#d97706';
    return '#2563eb';
  };

  const getMetrics = () => {
    const created = new Date(ticket.createdAt);
    
    // ✅ For completed tickets, show final metrics (not running clock)
    if (isCompleted) {
      const target = ticket.firstResponseAt 
        ? new Date(ticket.slaResolutionDue) 
        : new Date(ticket.slaFirstResponseDue);
      const total = target - created;
      return {
        label: ticket.firstResponseAt ? 'Time to Resolution' : 'Time to First Response',
        target: ticket.slaResolutionDue,
        elapsed: total, // Show full duration
        total: total,
        deadline: target
      };
    }
    
    const now = new Date();
    
    if (!ticket.firstResponseAt) {
      return {
        label: 'Time to First Response',
        target: ticket.slaFirstResponseDue,
        elapsed: now - created,
        total: new Date(ticket.slaFirstResponseDue) - created,
        deadline: new Date(ticket.slaFirstResponseDue)
      };
    }
    
    const firstResponse = new Date(ticket.firstResponseAt);
    return {
      label: 'Time to Resolution',
      target: ticket.slaResolutionDue,
      elapsed: now - firstResponse,
      total: new Date(ticket.slaResolutionDue) - firstResponse,
      deadline: new Date(ticket.slaResolutionDue)
    };
  };

  const metrics = getMetrics();
  const color = getBarColor();

  const formatDuration = (ms) => {
    if (ms < 0) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(ms / (1000 * 60));
      return `${minutes}m`;
    }
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  if (!ticket.slaFirstResponseDue) return null;

  return (
    <div style={{
      background: '#ffffff',
      border: '1.5px solid #e5e7eb',
      borderRadius: '18px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827' }}>
          {isCompleted ? '✅ SLA Completed' : `⏱️ SLA Timer: ${metrics.label}`}
        </h3>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: status === 'COMPLETED' ? '#059669' : 
                 status === 'BREACHED' ? '#dc2626' : 
                 status === 'AT_RISK' ? '#d97706' : '#2563eb',
          fontFamily: 'monospace',
          padding: '4px 10px',
          borderRadius: '8px',
          background: status === 'COMPLETED' ? '#d1fae5' :
                      status === 'BREACHED' ? '#fee2e2' : 
                      status === 'AT_RISK' ? '#fef3c7' : '#dbeafe'
        }}>
          {status === 'COMPLETED' ? 'COMPLETED' : `${Math.round(progress)}% elapsed`}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '10px',
        background: '#f3f4f6',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '18px'
      }}>
        <div style={{
          width: `${Math.min(100, progress)}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '999px',
          transition: 'width 1s ease, background 0.3s ease',
          boxShadow: status === 'AT_RISK' ? `0 0 10px ${color}66` : 'none'
        }} />
      </div>

      {/* Time Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        fontSize: '13px'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', marginBottom: '6px', fontWeight: 600 }}>
            {isCompleted ? 'Total Time' : 'Elapsed'}
          </div>
          <div style={{ fontWeight: 800, color: '#111827', fontFamily: 'monospace', fontSize: '16px' }}>
            {formatDuration(metrics.elapsed)}
          </div>
        </div>
        <div style={{
          background: '#f9fafb',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', marginBottom: '6px', fontWeight: 600 }}>
            {isCompleted ? 'Status' : 'Remaining'}
          </div>
          <div style={{ 
            fontWeight: 800, 
            color: isCompleted ? '#059669' : progress > 80 ? '#dc2626' : '#111827',
            fontFamily: 'monospace',
            fontSize: '16px'
          }}>
            {isCompleted ? 'Done' : formatDuration(metrics.total - metrics.elapsed)}
          </div>
        </div>
        <div style={{
          background: '#f9fafb',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#6b7280', marginBottom: '6px', fontWeight: 600 }}>
            {isCompleted ? 'Completed On' : 'Deadline'}
          </div>
          <div style={{ fontWeight: 800, color: '#111827', fontFamily: 'monospace', fontSize: '14px' }}>
            {isCompleted 
              ? (ticket.closedAt 
                  ? new Date(ticket.closedAt).toLocaleDateString() + ' ' + new Date(ticket.closedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                  : metrics.deadline.toLocaleDateString() + ' ' + metrics.deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
              : metrics.deadline.toLocaleDateString() + ' ' + metrics.deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status === 'BREACHED' && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#fee2e2',
          border: '1.5px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚠️</span>
          SLA deadline has been breached. This ticket has been escalated to supervisors.
        </div>
      )}

      {status === 'COMPLETED' && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#d1fae5',
          border: '1.5px solid #6ee7b7',
          borderRadius: '12px',
          color: '#059669',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✅</span>
          Ticket resolved within SLA. Great work!
        </div>
      )}
    </div>
  );
};

export default SlaProgress;