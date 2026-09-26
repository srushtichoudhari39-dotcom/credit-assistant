import React from 'react';
import { Award, AlertCircle, CheckCircle2 } from 'lucide-react';

const CreditScoreGauge = ({ score = 700, statusData }) => {
  // Score is between 300 and 900
  const minScore = 300;
  const maxScore = 900;
  const clampedScore = Math.max(minScore, Math.min(maxScore, score));
  
  // Percentage from 0% (300) to 100% (900)
  const percentage = ((clampedScore - minScore) / (maxScore - minScore)) * 100;
  
  // Angle for SVG arc (from -90 deg to +90 deg, total 180 degrees)
  const angle = -90 + (percentage / 100) * 180;

  const color = statusData?.color || (
    score >= 750 ? '#10B981' :
    score >= 700 ? '#3B82F6' :
    score >= 650 ? '#F59E0B' : '#EF4444'
  );

  const statusText = statusData?.status || (
    score >= 750 ? 'Excellent' :
    score >= 700 ? 'Good' :
    score >= 650 ? 'Fair' : 'Needs Attention'
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1.5rem 1rem',
      position: 'relative'
    }}>
      {/* Semicircle SVG Gauge */}
      <svg width="240" height="135" viewBox="0 0 240 135" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="65%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Background track arc (semicircle from 20,120 to 220,120) */}
        <path
          d="M 20 120 A 100 100 0 0 1 220 120"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Colored progress arc */}
        <path
          d="M 20 120 A 100 100 0 0 1 220 120"
          fill="none"
          stroke="url(#scoreGaugeGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="314.159"
          strokeDashoffset={314.159 * (1 - percentage / 100)}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />

        {/* Needle indicator */}
        <g transform={`rotate(${angle} 120 120)`}>
          <line
            x1="120"
            y1="120"
            x2="120"
            y2="30"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="120" cy="120" r="7" fill="#1e293b" />
          <circle cx="120" cy="120" r="3.5" fill="#ffffff" />
        </g>

        {/* Scale labels */}
        <text x="20" y="142" fontSize="11" fill="#64748b" fontWeight="600" textAnchor="middle">300</text>
        <text x="75" y="55" fontSize="10" fill="#94a3b8" fontWeight="500">650</text>
        <text x="120" y="32" fontSize="10" fill="#94a3b8" fontWeight="500" textAnchor="middle">700</text>
        <text x="165" y="55" fontSize="10" fill="#94a3b8" fontWeight="500">750</text>
        <text x="220" y="142" fontSize="11" fill="#64748b" fontWeight="600" textAnchor="middle">900</text>
      </svg>

      {/* Score and Status Display */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <div style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1,
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.03em'
        }}>
          {score}
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: `${color}15`,
              color: color,
              border: `1px solid ${color}40`
            }}
          >
            {score >= 700 ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            {statusText}
          </span>
        </div>

        <p style={{
          fontSize: '0.8rem',
          color: '#64748b',
          maxWidth: '260px',
          margin: '0.6rem auto 0 auto',
          lineHeight: 1.4
        }}>
          {statusData?.description || "Indian bureau scale (CIBIL/Experian) 300 to 900."}
        </p>
      </div>
    </div>
  );
};

export default CreditScoreGauge;
