import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const UtilizationChart = ({ balance = 0, limit = 0, utilization = 0 }) => {
  const safeLimit = Math.max(limit, 0);
  const safeBalance = Math.max(balance, 0);
  const remainingLimit = Math.max(0, safeLimit - safeBalance);

  // Status color
  const color = utilization <= 30 ? '#10B981' : utilization <= 50 ? '#F59E0B' : '#EF4444';

  const data = {
    labels: ['Used Balance (₹)', 'Available Limit (₹)'],
    datasets: [
      {
        data: [safeBalance, remainingLimit],
        backgroundColor: [color, '#e2e8f0'],
        hoverBackgroundColor: [color, '#cbd5e1'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '76%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 12, family: 'var(--font-sans)' },
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const val = context.parsed;
            return ` ₹${val.toLocaleString('en-IN')}`;
          },
        },
      },
    },
  };

  return (
    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
      <Doughnut data={data} options={options} />
      
      {/* Center Percentage Display */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1
        }}>
          {utilization.toFixed(1)}%
        </div>
        <div style={{
          fontSize: '0.725rem',
          fontWeight: 700,
          color: color,
          textTransform: 'uppercase',
          marginTop: '2px'
        }}>
          {utilization <= 30 ? 'Optimal' : utilization <= 50 ? 'Moderate' : 'High Usage'}
        </div>
      </div>
    </div>
  );
};

export default UtilizationChart;
