'use client';

import React, { useState, useEffect } from 'react';
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
import { Line } from 'react-chartjs-2';
import { orderService } from '@/services/orderService';
import { toastService } from '@/services/toastService';
import { RevenueStatsResponse } from '@/types/order';

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

export const SalesChart = ({ revenueData }: { revenueData: RevenueStatsResponse | null }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Thống kê doanh thu',
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
          text: 'Nghìn đồng',
        },
      },
    },
  };

  // Tạo dữ liệu cho Chart
  const chartData = {
    labels: revenueData?.labels || [],
    datasets: [
      {
        label: 'Doanh thu (kVND)',
        data: revenueData?.data || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};

const DashboardCharts = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [revenueData, setRevenueData] = useState<RevenueStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        const response = await orderService.adminGetRevenueStats(period);
        if (response.code === 1000 && response.result) {
          setRevenueData(response.result);
        } else {
          toastService.error('Không thể lấy dữ liệu doanh thu');
          setRevenueData(null);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
        toastService.error('Không thể lấy dữ liệu doanh thu');
        setRevenueData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [period]);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Thống kê doanh thu</h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm ${period === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setPeriod('day')}
            >
              Ngày
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${period === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setPeriod('week')}
            >
              Tuần
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${period === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setPeriod('month')}
            >
              Tháng
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${period === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              onClick={() => setPeriod('year')}
            >
              Năm
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : revenueData && revenueData.data.length > 0 ? (
          <SalesChart revenueData={revenueData} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Không có dữ liệu</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DashboardCharts; 