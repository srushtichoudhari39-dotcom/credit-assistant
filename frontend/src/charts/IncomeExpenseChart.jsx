import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IncomeExpenseChart = ({ income = 0, expenses = 0, emi = 0 }) => {
  const surplus = Math.max(0, income - (expenses + emi));

  const data = {
    labels: ['Monthly Cashflow'],
    datasets: [
      {
        label: 'Gross Income',
        data: [income],
        backgroundColor: '#3b82f6',
        borderRadius: 6,
      },
      {
        label: 'Living Expenses',
        data: [expenses],
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
      {
        label: 'Monthly EMIs',
        data: [emi],
        backgroundColor: '#ef4444',
        borderRadius: 6,
      },
      {
        label: 'Estimated Surplus',
        data: [surplus],
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const val = context.parsed.y;
            return ` ${label}: ₹${val.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          callback: (value) => `₹${(value / 1000).toFixed(0)}k`,
        },
        grid: {
          color: '#f1f5f9',
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ height: '220px', width: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default IncomeExpenseChart;
