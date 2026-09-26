import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/api';
import CreditScoreGauge from '../components/CreditScoreGauge';
import MetricCard from '../components/MetricCard';
import ScoreHistoryChart from '../charts/ScoreHistoryChart';
import UtilizationChart from '../charts/UtilizationChart';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import AIAdvisorModal from '../components/AIAdvisorModal';

import {
  Sparkles,
  TrendingUp,
  Percent,
  IndianRupee,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Layers,
  Wallet,
  Activity,
  CreditCard,
  FileText
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load dashboard metrics. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Loading your credit health dashboard...</p>
      </div>
    );
  }

  // If user has not completed financial onboarding yet (Scenario 1)
  if (!data?.has_profile || !data?.profile) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <SlidersHorizontal size={30} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Complete Your Financial Profile
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Welcome to Credit Assistant, {user?.name}! To calculate your baseline Debt-to-Income (DTI) ratio, credit utilization, and credit health status, please provide your current financial metrics.
          </p>
          <Link to="/profile" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            <span>Start Financial Onboarding</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const profile = data.profile;
  const firstDelta = data.first_record_delta;
  const prevDelta = data.previous_record_delta;

  // Formatting helpers
  const formatINR = (val) => (val || 0).toLocaleString('en-IN');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Welcome & AI CTA */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Credit Health Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Welcome back, <strong>{data.user_name}</strong>. Here is your current credit profile in the Indian ecosystem.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/profile" className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <SlidersHorizontal size={15} />
            <span>Update Profile</span>
          </Link>

          <button
            onClick={() => setIsAIModalOpen(true)}
            className="btn btn-ai"
            style={{ gap: '8px' }}
          >
            <Sparkles size={18} />
            <span>Ask AI Advisor</span>
          </button>
        </div>
      </div>

      {/* Validation Warning Alert if balance exceeds limit */}
      {profile.validation_warning && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          color: 'var(--danger-text)'
        }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {profile.validation_warning}
          </div>
        </div>
      )}

      {/* Progress & Milestone Delta Banner (Scenarios 3 & 4) */}
      {firstDelta?.has_baseline && (
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>
                {firstDelta.wording}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                Utilization change: <strong>{firstDelta.utilization_change > 0 ? `+${firstDelta.utilization_change}` : firstDelta.utilization_change} percentage points</strong>
                {' • '}
                Debt reduction: <strong>₹{formatINR(Math.abs(firstDelta.debt_change))}</strong>
              </div>
            </div>
          </div>

          <Link to="/history" style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View full audit history <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Main Grid: Credit Score Card & Key Financial Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Score Dial Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div className="card-header">
            <span className="card-title">Credit Score Standing</span>
            <span className="badge badge-info">Indian Scale (300-900)</span>
          </div>

          <CreditScoreGauge score={profile.credit_score} statusData={profile.score_status} />

          <div style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Status Assessment:</span>
            <span style={{ fontWeight: 700, color: profile.score_status?.color || '#2563eb' }}>
              {profile.score_status?.status} Tier
            </span>
          </div>
        </div>

        {/* 2x3 Metric Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem'
        }}>
          {/* DTI Card */}
          <MetricCard
            title="Debt-to-Income (DTI)"
            value={`${profile.dti_ratio.toFixed(1)}%`}
            icon={Percent}
            statusBadge={profile.dti_status?.status}
            statusColor={profile.dti_status?.color}
            benchmarkText="Recommended <= 35%"
            deltaText={prevDelta?.has_baseline ? `${prevDelta.dti_change > 0 ? '+' : ''}${prevDelta.dti_change} pp` : null}
            deltaType={prevDelta?.dti_change < 0 ? 'positive' : prevDelta?.dti_change > 0 ? 'negative' : 'neutral'}
          />

          {/* Credit Utilization Card */}
          <MetricCard
            title="Credit Utilization"
            value={`${profile.credit_utilization.toFixed(1)}%`}
            icon={CreditCard}
            statusBadge={profile.utilization_status?.status}
            statusColor={profile.utilization_status?.color}
            benchmarkText="Target <= 30%"
            deltaText={prevDelta?.has_baseline ? `${prevDelta.utilization_change > 0 ? '+' : ''}${prevDelta.utilization_change} pp` : null}
            deltaType={prevDelta?.utilization_change < 0 ? 'positive' : prevDelta?.utilization_change > 0 ? 'negative' : 'neutral'}
          />

          {/* Outstanding Debt */}
          <MetricCard
            title="Total Outstanding Debt"
            formattedValue={`₹${formatINR(profile.total_debt)}`}
            icon={Wallet}
            benchmarkText="Combined loans & balances"
            deltaText={prevDelta?.has_baseline ? `${prevDelta.debt_change > 0 ? '+₹' : '-₹'}${formatINR(Math.abs(prevDelta.debt_change))}` : null}
            deltaType={prevDelta?.debt_change < 0 ? 'positive' : prevDelta?.debt_change > 0 ? 'negative' : 'neutral'}
          />

          {/* Monthly Income */}
          <MetricCard
            title="Gross Monthly Income"
            formattedValue={`₹${formatINR(profile.monthly_income)}`}
            icon={IndianRupee}
            benchmarkText="Reported monthly cash flow"
          />

          {/* Monthly EMI */}
          <MetricCard
            title="Monthly Debt EMIs"
            formattedValue={`₹${formatINR(profile.monthly_debt_payment)}`}
            icon={Activity}
            benchmarkText={`${profile.active_loans} Active Loan(s)`}
          />

          {/* Missed Payments */}
          <MetricCard
            title="Missed Payments"
            value={profile.missed_payments}
            icon={AlertTriangle}
            statusBadge={profile.missed_payments > 0 ? 'Delinquency Flag' : 'Zero Missed'}
            statusColor={profile.missed_payments > 0 ? '#EF4444' : '#10B981'}
            benchmarkText="Affects ~35% of score"
          />
        </div>
      </div>

      {/* Visualizations Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Chart 1: Credit Score History Line Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Credit Score Trajectory</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Timeline</span>
          </div>
          <ScoreHistoryChart history={data.score_history} />
        </div>

        {/* Chart 2: Credit Utilization Doughnut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revolving Limit vs Balance</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Card Utilization</span>
          </div>
          <UtilizationChart
            balance={profile.credit_balance}
            limit={profile.credit_limit}
            utilization={profile.credit_utilization}
          />
        </div>

        {/* Chart 3: Income vs Expenses & EMI Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Cashflow Allocation</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income vs Obligations</span>
          </div>
          <IncomeExpenseChart
            income={profile.monthly_income}
            expenses={profile.monthly_expenses}
            emi={profile.monthly_debt_payment}
          />
        </div>

        {/* Card 4: Financial Health Bottlenecks & Insights */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <span className="card-title">Financial Bottlenecks</span>
              <span className="badge badge-warning">Action Items</span>
            </div>

            {data.bottlenecks?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.bottlenecks.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-card-subtle)',
                      borderLeft: `3px solid ${b.severity === 'critical' ? '#ef4444' : '#f59e0b'}`,
                      borderRadius: '6px',
                      padding: '0.75rem 1rem'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {b.recommendation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--success)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>No severe bottlenecks detected</p>
                <p style={{ fontSize: '0.8rem' }}>Your indicators demonstrate disciplined credit usage.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsAIModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginTop: '1.25rem', gap: '6px' }}
          >
            <Sparkles size={14} style={{ color: '#7c3aed' }} />
            <span>Generate Full AI Improvement Plan</span>
          </button>
        </div>
      </div>

      {/* Mandatory Compliance Disclaimer Banner */}
      <div className="disclaimer-banner">
        <ShieldAlert size={20} className="disclaimer-icon" />
        <div>
          <strong>Educational Notice:</strong> {data.disclaimer}
        </div>
      </div>

      {/* AI Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        userProfile={profile}
      />
    </div>
  );
};

export default DashboardPage;
