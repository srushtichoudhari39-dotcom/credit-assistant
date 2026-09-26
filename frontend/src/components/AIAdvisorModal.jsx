import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Info,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { aiService } from '../services/api';

const AIAdvisorModal = ({ isOpen, onClose, userProfile }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const [error, setError] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiService.getAdvice({ additional_notes: additionalNotes });
      setAdvice(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate AI consultation. Please ensure your financial profile is filled.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !advice && userProfile) {
      fetchAdvice();
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '88vh' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  AI Financial Health Advisor
                </h2>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  POWERED BY GEMINI
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Personalized educational strategy tailored to the Indian credit ecosystem (₹)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div style={{
              display: 'inline-block',
              animation: 'spin 1s linear infinite',
              color: '#7c3aed',
              marginBottom: '1rem'
            }}>
              <RefreshCw size={36} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Analyzing Financial Indicators...
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
              Synthesizing credit utilization, DTI ratio, and repayment history against Indian bureau guidelines.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            background: 'var(--danger-light)',
            border: '1px solid #fecaca',
            color: 'var(--danger-text)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Unable to Complete Consultation</div>
              <div style={{ fontSize: '0.85rem' }}>{error}</div>
              <button
                onClick={fetchAdvice}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.75rem' }}
              >
                Retry Consultation
              </button>
            </div>
          </div>
        )}

        {/* Content Display */}
        {advice && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Status & Executive Summary Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid #7c3aed',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6d28d9', letterSpacing: '0.04em' }}>
                  Current Situation Assessment
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: '#ede9fe',
                  color: '#5b21b6'
                }}>
                  {advice.credit_health_status}
                </span>
              </div>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {advice.summary}
              </p>
            </div>

            {/* Main Bottlenecks */}
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                Identified Financial Bottlenecks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {advice.bottlenecks?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#fffbeb',
                      border: '1px solid #fef3c7',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      fontSize: '0.875rem',
                      color: '#92400e'
                    }}
                  >
                    <span style={{ fontWeight: 800, minWidth: '18px' }}>{idx + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Step Roadmap */}
            <div>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Compass size={18} style={{ color: '#2563eb' }} />
                5-Step Credit Health Improvement Roadmap
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {advice.five_step_roadmap?.map((step) => (
                  <div
                    key={step.step_number}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                      background: '#ffffff',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {step.step_number}
                        </span>
                        <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {step.title}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={12} />
                        {step.timeframe}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', lineHeight: 1.45 }}>
                      <strong>Action:</strong> {step.action}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                      <strong>Rationale:</strong> {step.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* General Educational Recommendations */}
            {advice.recommendations && advice.recommendations.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                  Key Educational Recommendations
                </h3>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {advice.recommendations.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assumptions Stated */}
            {advice.assumptions && advice.assumptions.length > 0 && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1.25rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Stated Assumptions
                </div>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {advice.assumptions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory Educational Disclaimer */}
            <div className="disclaimer-banner" style={{ margin: '0.5rem 0 0 0' }}>
              <ShieldAlert size={20} className="disclaimer-icon" />
              <div>
                <strong>Mandatory Compliance Notice:</strong> {advice.disclaimer}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)'
            }}>
              <button
                onClick={fetchAdvice}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} />
                Regenerate Guidance
              </button>

              <button
                onClick={onClose}
                className="btn btn-primary btn-sm"
              >
                Close Advisor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisorModal;
