import React, { useState, useEffect } from 'react';
import { creditHistoryService } from '../services/api';
import ScoreHistoryChart from '../charts/ScoreHistoryChart';
import { 
  History, 
  Plus, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  CheckCircle2,
  X,
  ShieldCheck,
  CreditCard
} from 'lucide-react';

const CreditHistoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form for manual periodic entry
  const [newScore, setNewScore] = useState(720);
  const [submitting, setSubmitting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await creditHistoryService.getHistory();
      setHistoryData(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load credit score history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await creditHistoryService.addEntry({
        credit_score: Number(newScore)
      });
      setIsAddModalOpen(false);
      await fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Failed to log new score entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading credit score trajectory...</p>
      </div>
    );
  }

  const records = historyData?.records || [];
  const netChange = historyData?.net_score_change || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <History size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Credit Score History & Audit Log
            </h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Historical timeline of all user-entered credit scores and calculated indicators.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={18} />
          <span>Record New Score Check</span>
        </button>
      </div>

      {/* Baseline Metric Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: '#ffffff',
        padding: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Overall Trajectory Baseline
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>
            {historyData?.wording || "No baseline available"}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
            Note: Reflects user-reported updates rather than automated score causation.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>First Recorded Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>
              {historyData?.earliest_score || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Latest Recorded Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
              {historyData?.latest_score || '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Net Point Delta</div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: netChange > 0 ? '#34d399' : netChange < 0 ? '#f87171' : '#94a3b8'
            }}>
              {netChange > 0 ? `+${netChange}` : netChange}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Score Progression Chart</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chronological Record</span>
        </div>
        <ScoreHistoryChart history={records} />
      </div>

      {/* Historical Audit Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recorded Financial Snapshots
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Each snapshot archives the credit score, utilization, and DTI ratio at the recorded date.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Date Recorded</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Score</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Credit Utilization</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DTI Ratio</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Debt (₹)</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Missed Payments</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const date = new Date(rec.recorded_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.875rem 1.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {date}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {rec.credit_score}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: `${rec.score_status?.color || '#3b82f6'}15`,
                        color: rec.score_status?.color || '#3b82f6'
                      }}>
                        {rec.score_status?.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {rec.credit_utilization?.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {rec.dti_ratio?.toFixed(1)}%
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      ₹{(rec.total_debt || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem', color: rec.missed_payments > 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {rec.missed_payments || 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Score Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Log Periodic Credit Score
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEntry}>
              <div className="form-group">
                <label className="form-label">New Credit Score (300 to 900)</label>
                <input
                  type="number"
                  min={300}
                  max={900}
                  required
                  className="form-input"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                />
                <div className="form-hint">
                  Obtained from CIBIL, Experian, or authorized bureau report.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm"
                >
                  {submitting ? 'Recording...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditHistoryPage;
