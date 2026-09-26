import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ScoreHistoryChart = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No historical credit score records available yet. Updates will appear here over time.
      </div>
    );
  }

  const labels = history.map((item, index) => {
    if (item.recorded_at) {
      const date = new Date(item.recorded_at);
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    return `Record #${index + 1}`;
  });

  const scores = history.map((item) => item.credit_score);

  const data = {
    labels,
    datasets: [
      {
        label: 'Credit Score',
        data: scores,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 3,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context) => {
            const score = context.parsed.y;
            const status = score >= 750 ? 'Excellent' : score >= 700 ? 'Good' : score >= 650 ? 'Fair' : 'Needs Attention';
            return `Score: ${score} (${status})`;
          },
        },
      },
    },
    scales: {
      y: {
        min: 300,
        max: 900,
        ticks: {
          stepSize: 100,
          color: '#64748b',
          font: { size: 11 },
        },
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '260px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ScoreHistoryChart;
