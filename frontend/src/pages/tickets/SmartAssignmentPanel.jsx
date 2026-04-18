import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  User, 
  MapPin, 
  Briefcase, 
  Activity, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = "http://localhost:8080";

// Calculate match score between ticket and technician
const calculateMatchScore = (ticket, technician, index) => {
  let score = 0;
  let reasons = [];

  // 1. Specialization Match (40 points) - HIGHEST PRIORITY
  const ticketCategory = (ticket.category || '').toLowerCase().trim();
  const techSpec = (technician.specialization || '').toLowerCase().trim();
  
  if (ticketCategory && techSpec) {
    if (techSpec === ticketCategory) {
      score += 40;
      reasons.push({ icon: <Target size={12} />, text: `Expert in ${technician.specialization}`, type: 'specialization' });
    } else if (techSpec === 'general' || techSpec === '') {
      score += 15;
      reasons.push({ icon: <Briefcase size={12} />, text: 'Generalist', type: 'general' });
    } else {
      // Partial match - same team/category family
      score += 5;
      reasons.push({ icon: <Briefcase size={12} />, text: techSpec, type: 'weak' });
    }
  } else {
    // No category specified, give benefit of doubt
    score += 20;
  }

  // 2. Availability Status (30 points)
  const status = (technician.status || 'OFFLINE').toUpperCase();
  switch (status) {
    case 'ACTIVE':
      score += 30;
      reasons.push({ icon: <CheckCircle size={12} />, text: 'Available now', type: 'availability' });
      break;
    case 'BUSY':
      score += 15;
      reasons.push({ icon: <Clock size={12} />, text: 'Currently busy', type: 'busy' });
      break;
    case 'ON_LEAVE':
      score += 0;
      reasons.push({ icon: <AlertCircle size={12} />, text: 'On leave', type: 'unavailable' });
      break;
    default:
      score += 10;
      reasons.push({ icon: <Activity size={12} />, text: 'Status: ' + status, type: 'limited' });
  }

  // 3. Workload Factor (20 points) - SIMULATED based on list order for now
  // In real implementation, this would be actual ticket count
  // For now, we use index to create variation (first technicians assumed less busy)
  const simulatedWorkload = index * 0.5; // 0, 0.5, 1.0 for first 3
  const workloadScore = Math.max(0, 20 - (simulatedWorkload * 10));
  score += workloadScore;
  
  if (simulatedWorkload < 1) {
    reasons.push({ icon: <Zap size={12} />, text: 'Light workload', type: 'workload' });
  }

  // 4. Team Match (10 points) - Bonus for matching team context
  const ticketDesc = (ticket.description || '').toLowerCase();
  const team = (technician.team || '').toLowerCase();
  if (ticketDesc.includes(team) || ticketCategory.includes(team.replace(' ', ''))) {
    score += 10;
    reasons.push({ icon: <MapPin size={12} />, text: 'Team context match', type: 'team' });
  }

  // Add small random factor (-2 to +2) to break ties when everything else is equal
  // This ensures different scores even with similar profiles
  const tieBreaker = (index % 3) - 1; // -1, 0, or 1
  score += tieBreaker;

  // Ensure score is 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    score: Math.round(score),
    reasons: reasons.slice(0, 3),
    technician,
    rawData: {
      specialization: techSpec,
      category: ticketCategory,
      status: status,
      match: techSpec === ticketCategory
    }
  };
};

const SmartAssignmentPanel = ({ ticket, technicians, onAssign, assigning }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState(null);
  const [usingRealData, setUsingRealData] = useState(false);

  // Calculate suggestions when ticket or technicians change
  useEffect(() => {
    if (!ticket || !technicians?.length) return;
    calculateSuggestions();
  }, [ticket, technicians]);

  const calculateSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from backend first
      let scoredTechnicians = [];
      
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/tickets/smart-suggestions`, {
            params: {
              ticketId: ticket.id,
              category: ticket.category,
              location: ticket.location,
              priority: ticket.priority
            },
            timeout: 2000
          }
        );
        
        if (response.data?.suggestions?.length > 0) {
          scoredTechnicians = response.data.suggestions;
          setUsingRealData(true);
        }
      } catch (apiErr) {
        // Expected - backend endpoint not implemented yet
        console.log('Backend smart-suggestions not available, using client-side calculation');
      }

      // Fallback to client-side calculation
      if (scoredTechnicians.length === 0) {
        scoredTechnicians = technicians
          .filter(tech => tech.status !== 'ON_LEAVE') // Filter out on-leave techs
          .map((tech, index) => calculateMatchScore(ticket, tech, index));
        setUsingRealData(false);
      }

      // Sort by score (highest first), then by specialization match
      const topMatches = scoredTechnicians
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          // Tie-breaker: specialization match priority
          const aMatch = a.rawData?.specialization === a.rawData?.category;
          const bMatch = b.rawData?.specialization === b.rawData?.category;
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        })
        .slice(0, 3)
        .map((match, index) => ({
          ...match,
          rank: index + 1,
          rankColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : '#cd7f32'
        }));

      setSuggestions(topMatches);
      
      // Auto-expand if we have good matches
      if (topMatches[0]?.score >= 50) {
        setExpanded(true);
      }
    } catch (err) {
      console.error('Smart assignment error:', err);
      setError('Failed to calculate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green - Excellent
    if (score >= 60) return '#3b82f6'; // Blue - Good
    if (score >= 40) return '#f59e0b'; // Orange - Fair
    return '#ef4444'; // Red - Poor
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  // Debug info for development
  const showDebugInfo = () => {
    if (!ticket) return null;
    return (
      <div style={{
        marginBottom: '12px',
        padding: '8px 12px',
        background: '#f1f5f9',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <strong>Ticket:</strong> {ticket.category || 'No category'} | 
        <strong> Matching against:</strong> {technicians.length} technicians
        {!usingRealData && ' (Client-side calc)'}
      </div>
    );
  };

  if (!ticket) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      border: '1px solid #bae6fd',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background element */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '50%'
      }} />

      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '700',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Smart Assignment
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: '#dbeafe',
                color: '#1d4ed8',
                borderRadius: '999px',
                fontWeight: '600'
              }}>
                AI
              </span>
              {!usingRealData && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '999px',
                  fontWeight: '600'
                }}>
                  BETA
                </span>
              )}
            </h4>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: '#64748b'
            }}>
              {suggestions.length > 0 
                ? `Top ${suggestions.length} matches found` 
                : 'Click to find best technicians'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {!expanded && suggestions[0] && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'white',
              borderRadius: '999px',
              border: '1px solid #e2e8f0'
            }}>
              <User size={14} color="#3b82f6" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                {suggestions[0].technician.name}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                color: getScoreColor(suggestions[0].score)
              }}>
                {suggestions[0].score}%
              </span>
            </div>
          )}
          {expanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ marginTop: '16px', position: 'relative', zIndex: 1 }}>
          {showDebugInfo()}
          
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
              gap: '12px',
              color: '#64748b'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Analyzing best matches...</span>
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#ef4444',
              fontSize: '14px'
            }}>
              {error}
            </div>
          ) : suggestions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#64748b',
              fontSize: '14px'
            }}>
              No matching technicians found
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {suggestions.map((match) => (
                <div
                  key={match.technician.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${match.rank === 1 ? '#3b82f6' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative',
                    transition: 'all 0.2s',
                    boxShadow: match.rank === 1 ? '0 4px 6px -1px rgba(59, 130, 246, 0.1)' : 'none'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '16px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: match.rankColor,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '700',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '2px solid white'
                  }}>
                    {match.rank}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {/* Score Circle */}
                    <div style={{
                      position: 'relative',
                      width: '56px',
                      height: '56px',
                      flexShrink: 0
                    }}>
                      <svg style={{ transform: 'rotate(-90deg)' }} width="56" height="56">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="4"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke={getScoreColor(match.score)}
                          strokeWidth="4"
                          strokeDasharray={`${(match.score / 100) * 150.8} 150.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          color: getScoreColor(match.score)
                        }}>
                          {match.score}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          color: '#64748b',
                          textTransform: 'uppercase'
                        }}>
                          {getScoreLabel(match.score)}
                        </span>
                      </div>
                    </div>

                    {/* Technician Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#0f172a'
                        }}>
                          {match.technician.name}
                        </span>
                        {match.rawData?.match && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            borderRadius: '999px',
                            fontWeight: '700'
                          }}>
                            EXPERT
                          </span>
                        )}
                      </div>
                      
                      <div style={{
                        fontSize: '13px',
                        color: '#64748b',
                        marginBottom: '8px'
                      }}>
                        {match.technician.specialization || 'General'} • {match.technician.team || 'No team'} • {match.technician.email}
                      </div>

                      {/* Match Reasons */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        {match.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              padding: '4px 8px',
                              background: reason.type === 'specialization' ? '#dbeafe' :
                                        reason.type === 'availability' ? '#d1fae5' :
                                        reason.type === 'workload' ? '#fef3c7' : '#f1f5f9',
                              color: reason.type === 'specialization' ? '#1d4ed8' :
                                     reason.type === 'availability' ? '#059669' :
                                     reason.type === 'workload' ? '#d97706' : '#64748b',
                              borderRadius: '6px',
                              fontWeight: '500'
                            }}
                          >
                            {reason.icon}
                            {reason.text}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Assign Button */}
                    <button
                      onClick={() => onAssign(match.technician.id)}
                      disabled={assigning}
                      style={{
                        padding: '10px 20px',
                        background: match.rank === 1 ? '#2563eb' : '#f8fafc',
                        color: match.rank === 1 ? 'white' : '#0f172a',
                        border: match.rank === 1 ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: assigning ? 'not-allowed' : 'pointer',
                        opacity: assigning ? 0.6 : 1,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {assigning ? (
                        <>
                          <div style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          ...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          {match.rank === 1 ? 'Best Match' : 'Assign'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={calculateSuggestions}
            disabled={loading}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px dashed #94a3b8',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Zap size={14} />
            {loading ? 'Calculating...' : 'Recalculate Matches'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SmartAssignmentPanel;