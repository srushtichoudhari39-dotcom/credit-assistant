import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { 
  SlidersHorizontal, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Save, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Percent
} from 'lucide-react';

const FinancialProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUserProfileState } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    credit_score: 700,
    monthly_income: 50000,
    monthly_expenses: 30000,
    total_debt: 200000,
    monthly_debt_payment: 15000,
    credit_limit: 100000,
    credit_balance: 40000,
    missed_payments: 0,
    active_loans: 1,
    existing_credit_cards: 1,
    loan_types: 'Personal Loan'
  });

  // Load existing profile if available
  useEffect(() => {
    const fetchExistingProfile = async () => {
      try {
        const res = await profileService.getProfile();
        if (res.data) {
          setFormData({
            credit_score: res.data.credit_score,
            monthly_income: res.data.monthly_income,
            monthly_expenses: res.data.monthly_expenses,
            total_debt: res.data.total_debt,
            monthly_debt_payment: res.data.monthly_debt_payment,
            credit_limit: res.data.credit_limit,
            credit_balance: res.data.credit_balance,
            missed_payments: res.data.missed_payments,
            active_loans: res.data.active_loans,
            existing_credit_cards: res.data.existing_credit_cards,
            loan_types: res.data.loan_types || ''
          });
          setIsExisting(true);
        }
      } catch (err) {
        // 404 means user is filling for the first time (Scenario 1 Onboarding)
        setIsExisting(false);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  // Real-time dynamic calculations
  const parsedIncome = Number(formData.monthly_income) || 0;
  const parsedEmi = Number(formData.monthly_debt_payment) || 0;
  const parsedLimit = Number(formData.credit_limit) || 0;
  const parsedBalance = Number(formData.credit_balance) || 0;

  const liveDti = parsedIncome > 0 ? ((parsedEmi / parsedIncome) * 100).toFixed(1) : '0.0';
  const liveUtilization = parsedLimit > 0 ? ((parsedBalance / parsedLimit) * 100).toFixed(1) : '0.0';

  const isOverLimit = parsedLimit > 0 && parsedBalance > parsedLimit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    // Frontend validations
    if (formData.credit_score < 300 || formData.credit_score > 900) {
      setErrorMessage('Credit score must be between 300 and 900 on the Indian credit bureau scale.');
      setSubmitting(false);
      return;
    }

    if (parsedIncome < 0 || parsedEmi < 0 || parsedLimit < 0 || parsedBalance < 0) {
      setErrorMessage('Financial amounts cannot be negative.');
      setSubmitting(false);
      return;
    }

    try {
      if (isExisting) {
        await profileService.updateProfile(formData);
        setSuccessMessage('Financial profile successfully updated! Real-time indicators refreshed.');
      } else {
        await profileService.createProfile(formData);
        updateUserProfileState(true);
        setSuccessMessage('Initial financial onboarding complete! Redirecting to dashboard...');
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || 'Failed to save financial profile. Please verify your entries.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading financial profile details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
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
            <SlidersHorizontal size={20} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isExisting ? 'Update Financial Profile' : 'Initial Financial Profile Setup'}
          </h1>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isExisting 
            ? 'Adjust your financial details whenever your income, loans, or card balances change.'
            : 'Complete your profile to calculate your baseline DTI, credit utilization, and credit health.'}
        </p>
      </div>

      {/* Real-Time Calculation Preview Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        color: '#ffffff',
        border: 'none',
        marginBottom: '2rem',
        padding: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.75rem'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.04em' }}>
            Live Real-Time Indicators (Updates As You Type)
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            Formula-Driven
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Live Score */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Reported Credit Score</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
              {formData.credit_score}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {formData.credit_score >= 750 ? 'Excellent' : formData.credit_score >= 700 ? 'Good' : formData.credit_score >= 650 ? 'Fair' : 'Needs Attention'}
            </div>
          </div>

          {/* Live DTI */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Debt-to-Income (DTI)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: Number(liveDti) <= 35 ? '#34d399' : Number(liveDti) <= 50 ? '#fbbf24' : '#f87171' }}>
              {liveDti}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {Number(liveDti) <= 35 ? 'Healthy (<= 35%)' : Number(liveDti) <= 50 ? 'Moderate (36–50%)' : 'High Risk (> 50%)'}
            </div>
          </div>

          {/* Live Utilization */}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>Credit Utilization</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: Number(liveUtilization) <= 30 ? '#34d399' : Number(liveUtilization) <= 50 ? '#fbbf24' : '#f87171' }}>
              {liveUtilization}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              {Number(liveUtilization) <= 30 ? 'Optimal (<= 30%)' : Number(liveUtilization) <= 50 ? 'Moderate (31–50%)' : 'High Usage (> 50%)'}
            </div>
          </div>
        </div>

        {/* Real-time Over Limit Warning */}
        {isOverLimit && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fca5a5'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Validation Notice:</strong> Outstanding card balance (₹{parsedBalance.toLocaleString('en-IN')}) exceeds total credit limit (₹{parsedLimit.toLocaleString('en-IN')}).
            </span>
          </div>
        )}
      </div>

      {/* Feedback Messages */}
      {errorMessage && (
        <div style={{
          background: 'var(--danger-light)',
          border: '1px solid #fecaca',
          color: 'var(--danger-text)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: 'var(--success-light)',
          border: '1px solid #a7f3d0',
          color: 'var(--success-text)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        {/* Section 1: Credit Score */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            1. Credit Score Information
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Enter your most recent score obtained from CIBIL, Experian, Equifax, or CRIF High Mark.
          </p>

          <div style={{ maxWidth: '300px' }}>
            <label className="form-label">Current Credit Score (300 to 900)</label>
            <input
              type="number"
              name="credit_score"
              min={300}
              max={900}
              required
              className="form-input"
              value={formData.credit_score}
              onChange={handleChange}
            />
            <div className="form-hint">Standard Indian bureau range: 300 to 900</div>
          </div>
        </div>

        {/* Section 2: Income & Expenses */}
        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            2. Monthly Income & Living Expenses
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Used to calculate your Debt-to-Income (DTI) ratio and surplus cashflow.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            <div className="form-group">
              <label className="form-label">Monthly Gross Income (₹)</label>
              <input
                type="number"
                name="monthly_income"
                min={0}
                required
                className="form-input"
                placeholder="50000"
                value={formData.monthly_income}
                onChange={handleChange}
              />
              <div className="form-hint">Salary or net business income</div>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Monthly Expenses (₹)</label>
              <input
                type="number"
                name="monthly_expenses"
                min={0}
                required
                className="form-input"
                placeholder="30000"
                value={formData.monthly_expenses}
                onChange={handleChange}
              />
              <div className="form-hint">Rent, groceries, utilities, school fees, etc.</div>
            </div>
          </div>
        </div>

        {/* Section 3: Debt & Loan Obligations */}
        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            3. Debt, Loans & Monthly EMIs
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Detail all current liabilities including personal loans, home loans, vehicle loans, and card balances.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            <div className="form-group">
              <label className="form-label">Total Outstanding Debt Principal (₹)</label>
              <input
                type="number"
                name="total_debt"
                min={0}
                required
                className="form-input"
                placeholder="200000"
                value={formData.total_debt}
                onChange={handleChange}
              />
              <div className="form-hint">Total remaining loan balances combined</div>
            </div>

            <div className="form-group">
              <label className="form-label">Total Monthly EMI Payments (₹)</label>
              <input
                type="number"
                name="monthly_debt_payment"
                min={0}
                required
                className="form-input"
                placeholder="15000"
                value={formData.monthly_debt_payment}
                onChange={handleChange}
              />
              <div className="form-hint">Sum of all monthly loan EMIs</div>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Active Loans</label>
              <input
                type="number"
                name="active_loans"
                min={0}
                className="form-input"
                value={formData.active_loans}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Types Description</label>
              <input
                type="text"
                name="loan_types"
                className="form-input"
                placeholder="e.g. Home Loan, Two-Wheeler Loan, Education Loan"
                value={formData.loan_types}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Credit Cards & Utilization */}
        <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            4. Credit Cards & Card Utilization
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Used to calculate revolving credit card utilization. Recommended &le; 30% in India.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            <div className="form-group">
              <label className="form-label">Total Credit Card Limit (₹)</label>
              <input
                type="number"
                name="credit_limit"
                min={0}
                required
                className="form-input"
                placeholder="100000"
                value={formData.credit_limit}
                onChange={handleChange}
              />
              <div className="form-hint">Combined limit across all active credit cards</div>
            </div>

            <div className="form-group">
              <label className="form-label">Current Outstanding Card Balance (₹)</label>
              <input
                type="number"
                name="credit_balance"
                min={0}
                required
                className="form-input"
                placeholder="40000"
                value={formData.credit_balance}
                onChange={handleChange}
              />
              <div className="form-hint">Current total statement/billed unpaid balance</div>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Active Credit Cards</label>
              <input
                type="number"
                name="existing_credit_cards"
                min={0}
                className="form-input"
                value={formData.existing_credit_cards}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Missed or Late Payments (Past 2-3 Yrs)</label>
              <input
                type="number"
                name="missed_payments"
                min={0}
                className="form-input"
                value={formData.missed_payments}
                onChange={handleChange}
              />
              <div className="form-hint">Critical bureau scoring factor</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={18} />
            <span>{submitting ? 'Saving Profile...' : isExisting ? 'Update Profile & Recalculate' : 'Save Profile & View Dashboard'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default FinancialProfilePage;
