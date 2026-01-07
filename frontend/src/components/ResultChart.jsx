import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ResultChart = ({ results }) => {
  // If no results yet, show empty state
  if (!results || results.length === 0) return null;

  const labels = results.map(r => r.option);
  const dataPoints = results.map(r => r.count);

  const data = {
    labels,
    datasets: [
      {
        label: 'Votes',
        data: dataPoints,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Live Poll Results' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto mt-6">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ResultChart;