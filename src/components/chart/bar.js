import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const generateData = () => {
  const labels = Array.from({ length: 100 }, (_, i) => `Label ${i + 1}`);
  const data = Array.from({ length: 100 }, () => Math.floor(Math.random() * 100));
  return { labels, data };
};

const { labels, data } = generateData();

const BarChart = () => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 10;
  const itemHeight = 10; // 每个条形图的高度为 20px

  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    const newIndex = Math.floor(scrollTop / itemHeight); // 根据新的高度计算索引
    setStartIndex(newIndex);
  };

  const displayedLabels = labels.slice(startIndex, startIndex + itemsPerPage);
  const displayedData = data.slice(startIndex, startIndex + itemsPerPage);

  const chartData = {
    labels: displayedLabels,
    datasets: [
      {
        label: 'Value',
        data: displayedData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '400px', overflowY: 'scroll', marginBottom: 16 }} onScroll={handleScroll}>
      <div style={{ height: `${labels.length * itemHeight}px` }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarChart;