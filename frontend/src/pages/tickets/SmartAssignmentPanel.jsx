import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sparkles, 
  Star,
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  Zap,
  Briefcase,
  AlertCircle,
  Info
} from 'lucide-react';

const BACKEND_URL = "http://localhost:8080";

// CATEGORY TO SPECIALIZATION MAPPING
const CATEGORY_MAPPING = {
  'SOFTWARE': ['Software'],
  'HARDWARE': ['Hardware'],
  'NETWORK': ['Network'],
  'ELECTRICAL': ['Electrical'],
  'CARPENTRY': ['Carpentry'],
  'PLUMBING': ['Plumbing'],
  'CLEANING': ['Cleaning'],
  'SECURITY': ['Security', 'Network'],
  'GENERAL': ['General'],
  'TECHNICAL': ['Software', 'Hardware', 'Network', 'Electrical'],
  'BILLING': ['Software', 'General'],
  'ACCOUNT': ['Software', 'General'],
  'FEATURE_REQUEST': ['Software', 'General'],
  'BUG_REPORT': ['Software', 'Hardware', 'Network'],
  '': ['General'] // Default
};

// Get category from ticket
const extractCategory = (ticket) => {
  if (!ticket) return '';
  
  // Check if category exists and is not empty
  const cat = ticket.category?.toString().toUpperCase().trim();
  if (cat) return cat;
  
  // Try other fields
  const altFields = ['issueType', 'ticketType', 'type'];
  for (const field of altFields) {
    const val = ticket[field]?.toString().toUpperCase().trim();
    if (val) return val;
  }
  
  return '';
};

// Get compatible specializations
const getCompatibleSpecs = (category) => {
  return CATEGORY_MAPPING[category] || CATEGORY_MAPPING[''];
};

const SmartAssignmentPanel = ({ ticket, technicians, onAssign, assigning }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [detectedCategory, setDetectedCategory] = useState('');

  useEffect(() => {
    if (!ticket || !technicians?.length) return;
    
    const cat = extractCategory(ticket);
    setDetectedCategory(cat);
    calculateSuggestions(cat);
  }, [ticket?.id, technicians.length]);

  const calculateSuggestions = (ticketCategory) => {
    setLoading(true);
    
    const compatibleSpecs = getCompatibleSpecs(ticketCategory);
    
    // Filter active techs
    const activeTechs = technicians.filter(tech => {
      const status = (tech.status || 'ACTIVE').toString().toUpperCase();
      return status !== 'ON_LEAVE';
    });

    // Calculate scores
    let scored = activeTechs.map((tech, index) => {
      const techSpec = (tech.specialization || 'General').toString().trim();
      const techSpecLower = techSpec.toLowerCase();
      const techTeam = (tech.team || '').toString().toLowerCase();
      const techStatus = (tech.status || 'ACTIVE').toString().toUpperCase();
      
      let score = 30;
      let reasons = [];
      let isPrimaryMatch = false;
      let isCompatible = false;

      // If we have a category, score based on specialization match
      if (ticketCategory) {
        const specIndex = compatibleSpecs.findIndex(s => s.toLowerCase() === techSpecLower);
        
        if (specIndex === 0) {
          // Perfect primary match
          score = 95;
          isPrimaryMatch = true;
          isCompatible = true;
          reasons.push({ text: `${techSpec} specialist`, type: 'expert', icon: 'star' });
        } else if (specIndex > 0) {
          // Secondary match
          score = 85;
          isCompatible = true;
          reasons.push({ text: `Skilled in ${techSpec}`, type: 'skilled', icon: 'check' });
        } else if (techSpecLower === 'general') {
          // Generalist
          score = 60;
          isCompatible = true;
          reasons.push({ text: 'General support', type: 'general', icon: 'briefcase' });
        } else {
          // Wrong specialization
          score = 40;
          isCompatible = false;
          reasons.push({ text: `Not ideal for this issue`, type: 'weak', icon: 'alert' });
        }

        // IT Support team bonus for technical issues
        const isTechnical = ['SOFTWARE', 'HARDWARE', 'NETWORK', 'TECHNICAL', 'BUG_REPORT', 'SECURITY'].includes(ticketCategory);
        if (isTechnical && (techTeam.includes('it') || techTeam.includes('support'))) {
          score += 5;
          if (score > 100) score = 100;
        }
      } else {
        // No category - general scoring
        score = 70 + (index % 3) * 5; // 70, 75, 80...
        isCompatible = true;
        reasons.push({ text: 'General support', type: 'general', icon: 'briefcase' });
      }

      // Status bonus
      if (techStatus === 'ACTIVE') {
        score += 5;
        reasons.push({ text: 'Available', type: 'available', icon: 'check' });
      }

      return {
        score: Math.min(100, score),
        reasons: reasons.slice(0, 2),
        technician: tech,
        isPrimaryMatch,
        isCompatible,
        spec: techSpec
      };
    });

    // Sort
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isPrimaryMatch && !b.isPrimaryMatch) return -1;
      if (!a.isPrimaryMatch && b.isPrimaryMatch) return 1;
      return a.technician.name.localeCompare(b.technician.name);
    });

    const topMatches = scored.slice(0, 4).map((match, index) => ({
      ...match,
      rank: index + 1,
      isBest: index === 0
    }));

    setSuggestions(topMatches);
    setLoading(false);
  };

  const getScoreColor = (score, isCompatible) => {
    if (!isCompatible) return '#ef4444';
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    return '#6b7280';
  };

  const renderIcon = (iconType) => {
    const props = { size: 12 };
    switch(iconType) {
      case 'star': return <Star {...props} fill="currentColor" />;
      case 'check': return <CheckCircle {...props} />;
      case 'briefcase': return <Briefcase {...props} />;
      case 'alert': return <AlertCircle {...props} />;
      default: return <span>•</span>;
    }
  };

  if (!ticket) return null;

  const hasCategory = !!detectedCategory;
  const categoryLabel = detectedCategory.replace(/_/g, ' ') || 'Not set';

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              Smart Assignment
            </div>
            <div style={{ fontSize: '12px', color: hasCategory ? '#059669' : '#dc2626' }}>
              {hasCategory ? (
                <span>Category: <strong>{categoryLabel}</strong></span>
              ) : (
                <span>⚠️ No category - Edit ticket to add one</span>
              )}
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
      </div>

      {expanded && (
        <div style={{ marginTop: '12px' }}>
          {!hasCategory && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Info size={14} />
              <span>This ticket has no category. Smart matching works best when tickets are categorized.</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              Calculating...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suggestions.map((match) => (
                <div
                  key={match.technician.id}
                  style={{
                    background: 'white',
                    borderRadius: '10px',
                    border: `2px solid ${match.isBest ? '#3b82f6' : match.isCompatible ? '#e2e8f0' : '#fecaca'}`,
                    padding: '14px',
                    position: 'relative'
                  }}
                >
                  {/* BEST Badge */}
                  {match.isBest && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '10px',
                      background: '#f59e0b',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      textTransform: 'uppercase'
                    }}>
                      Best Match
                    </div>
                  )}

                  {/* Main Row */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    marginTop: match.isBest ? '2px' : 0
                  }}>
                    {/* Score Circle */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: `${getScoreColor(match.score, match.isCompatible)}15`,
                      border: `3px solid ${getScoreColor(match.score, match.isCompatible)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: getScoreColor(match.score, match.isCompatible)
                      }}>
                        {match.score}
                      </span>
                    </div>

                    {/* Middle Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name & Badge */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        marginBottom: '4px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: '700', 
                          color: '#0f172a' 
                        }}>
                          {match.technician.name}
                        </span>
                        
                        {match.isPrimaryMatch && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: '#dbeafe',
                            color: '#1d4ed8',
                            borderRadius: '999px',
                            fontWeight: '700'
                          }}>
                            ★ TOP EXPERT
                          </span>
                        )}
                        
                        {!match.isPrimaryMatch && match.isCompatible && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: '#d1fae5',
                            color: '#059669',
                            borderRadius: '999px',
                            fontWeight: '700'
                          }}>
                            ✓ MATCH
                          </span>
                        )}
                        
                        {!match.isCompatible && (
                          <span style={{
                            fontSize: '10px',
                            padding: '2px 8px',
                            background: '#fee2f2',
                            color: '#dc2626',
                            borderRadius: '999px',
                            fontWeight: '700'
                          }}>
                            ✗ MISMATCH
                          </span>
                        )}
                      </div>

                      {/* Spec & Team */}
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#64748b',
                        marginBottom: '6px'
                      }}>
                        {match.spec}
                        {match.technician.team && ` • ${match.technician.team}`}
                      </div>

                      {/* Tags */}
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '6px'
                      }}>
                        {match.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontWeight: '500',
                              background: reason.type === 'expert' ? '#dbeafe' :
                                        reason.type === 'skilled' ? '#e0e7ff' :
                                        reason.type === 'available' ? '#d1fae5' :
                                        reason.type === 'general' ? '#f1f5f9' : '#fef2f2',
                              color: reason.type === 'expert' ? '#1d4ed8' :
                                     reason.type === 'skilled' ? '#3730a3' :
                                     reason.type === 'available' ? '#059669' :
                                     reason.type === 'general' ? '#64748b' : '#dc2626',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {renderIcon(reason.icon)}
                            <span>{reason.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Assign Button */}
                    <button
                      onClick={() => onAssign(match.technician.id)}
                      disabled={assigning}
                      style={{
                        padding: '10px 18px',
                        background: match.isBest ? '#2563eb' : match.isCompatible ? '#f8fafc' : '#fef2f2',
                        color: match.isBest ? 'white' : match.isCompatible ? '#374151' : '#dc2626',
                        border: match.isBest ? 'none' : `1px solid ${match.isCompatible ? '#e2e8f0' : '#fecaca'}`,
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: assigning ? 'not-allowed' : 'pointer',
                        opacity: assigning ? 0.6 : 1,
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {assigning ? '...' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => calculateSuggestions(detectedCategory)}
            disabled={loading}
            style={{
              marginTop: '12px',
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
            {loading ? 'Refreshing...' : 'Refresh Matches'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SmartAssignmentPanel;