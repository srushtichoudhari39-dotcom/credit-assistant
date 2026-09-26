import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  Compass, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  IndianRupee
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 1rem 2rem 1rem',
        maxWidth: '880px',
        margin: '0 auto'
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: '#eff6ff',
          color: '#1d4ed8',
          fontSize: '0.85rem',
          fontWeight: 700,
          border: '1px solid #bfdbfe',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} />
          <span>Tailored for the Indian Credit Ecosystem (INR ₹)</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#0f172a',
          lineHeight: 1.15,
          marginBottom: '1.25rem'
        }}>
          Master Your Credit Health with <span style={{ color: 'var(--primary)' }}>AI-Powered</span> Clarity
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 2rem auto'
        }}>
          Track your 300–900 bureau credit score, calculate Debt-to-Income (DTI) and credit utilization automatically, identify financial bottlenecks, and unlock personalized 5-step roadmaps guided by Google Gemini AI.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ gap: '8px' }}>
            <span>Get Started Free</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In to Dashboard
          </Link>
        </div>

        {/* Quick Trust Badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
            <span>Educational Guidance (Scale 300–900)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={16} style={{ color: 'var(--primary)' }} />
            <span>Bank-Grade JWT & Bcrypt Encryption</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: '#7c3aed' }} />
            <span>Gemini AI Consultation Engine</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={{ maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Engineered for Comprehensive Credit Well-Being
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Transparent calculations and actionable steps based on Indian banking standards.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Card 1 */}
          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#eff6ff',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Historical Score & Delta Tracking
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Maintain a reliable record of your credit score over time. Instantly observe changes since your first recorded score (e.g. +45 points) with clear, user-reported baseline indicators.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <PieChart size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              DTI & Utilization Calculators
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Automatic calculation of Debt-to-Income (DTI) and revolving credit utilization ratios. Receive instant warnings when card balances approach or exceed credit limits.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card">
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Compass size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Google Gemini AI Advisor
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Receive structured educational roadmaps, identify financial bottlenecks, and explore realistic 5-step action plans configured specifically for the Indian financial landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Callout Banner */}
      <section style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderLeft: '5px solid var(--primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldCheck size={26} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Strict Commitment to Financial Safety
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                Credit Assistant is an educational platform. It does not fabricate bureau records or make false guarantees about specific score changes. It does not sell high-interest loans or solicit commercial products. All recommendations are framed as transparent educational guidelines to help Indian borrowers navigate credit responsibly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
