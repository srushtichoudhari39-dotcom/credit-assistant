import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      padding: '2rem 1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Compliance and Educational Banner */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={24} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Educational Financial Health Guidance — Disclaimer & Transparency
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
              <strong>Credit Assistant</strong> provides educational information based on the data you provide. It does not provide financial, legal, or credit-bureau advice and does not guarantee changes to your credit score. All calculations (including Debt-to-Income and Credit Utilization) follow transparent educational principles for the Indian retail credit ecosystem (scale 300 to 900). For official credit reports, dispute resolution, or loan agreements, verify directly with RBI-authorized bureaus (TransUnion CIBIL, Experian, Equifax, CRIF High Mark) or your respective bank/lender.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Credit Assistant. Designed for Indian Retail Borrowers.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Indian Scale: 300 – 900</span>
            <span>Local Currency: INR (₹)</span>
            <span>AI Model: Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
