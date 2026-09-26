import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, HelpCircle } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  formattedValue,
  unit = '',
  icon: Icon,
  statusBadge,
  statusColor = '#3b82f6',
  deltaText,
  deltaType = 'neutral', // 'positive' (good), 'negative' (bad), 'neutral'
  tooltip,
  benchmarkText,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {Icon && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} />
              </div>
            )}
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {title}
            </span>
          </div>

          {statusBadge && (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: `${statusColor}18`,
                color: statusColor,
                border: `1px solid ${statusColor}30`,
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
              }}
            >
              {statusBadge}
            </span>
          )}
        </div>

        {/* Primary Value */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '0.25rem 0' }}>
          <span style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-sans)'
          }}>
            {formattedValue !== undefined ? formattedValue : value}
          </span>
          {unit && (
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Delta & Benchmark */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.625rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {deltaText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', fontWeight: 600 }}>
            {deltaType === 'positive' && <ArrowUpRight size={15} style={{ color: 'var(--success)' }} />}
            {deltaType === 'negative' && <ArrowDownRight size={15} style={{ color: 'var(--danger)' }} />}
            {deltaType === 'neutral' && <Minus size={15} style={{ color: 'var(--text-muted)' }} />}
            <span style={{
              color: deltaType === 'positive' ? 'var(--success)' :
                     deltaType === 'negative' ? 'var(--danger)' : 'var(--text-secondary)'
            }}>
              {deltaText}
            </span>
          </div>
        )}

        {benchmarkText && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {benchmarkText}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
