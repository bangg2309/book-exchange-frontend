'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data - Replace with actual API data when available
const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const salesData = {
  labels: monthNames,
  datasets: [
    {
      label: 'Doanh thu (triệu đồng)',
      data: [1200, 1900, 1500, 2500, 2200, 2800, 3100, 2900, 3500, 3200, 3800, 4100],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

const bookCategoryData = {
  labels: ['CNTT', 'Kinh tế', 'Ngoại ngữ', 'Kỹ thuật', 'Toán học', 'Vật lý', 'Y khoa', 'Khác'],
  datasets: [
    {
      label: 'Số lượng sách',
      data: [65, 59, 80, 42, 56, 40, 35, 20],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(6, 182, 212, 0.8)',   // Cyan
        'rgba(14, 165, 233, 0.8)',  // Light blue
        'rgba(79, 70, 229, 0.8)',   // Indigo
        'rgba(168, 85, 247, 0.8)',  // Purple
        'rgba(236, 72, 153, 0.8)',  // Pink
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(245, 158, 11, 0.8)',  // Amber
      ],
      borderWidth: 1,
    },
  ],
};



export const SalesChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Doanh thu theo tháng',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Triệu đồng',
        },
      },
    },
  };

  return <Line options={options} data={salesData} />;
};

export const BookCategoryChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Phân bố sách theo danh mục',
        font: {
          size: 16,
        },
      },
    },
  };

  return <Pie options={options} data={bookCategoryData} />;
};



const DashboardCharts = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <SalesChart />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <BookCategoryChart />
        </div>
       
      </div>
    </>
  );
};

export default DashboardCharts; 