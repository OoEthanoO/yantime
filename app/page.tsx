'use client';

import { useState } from 'react';
import { calculatePartitions, TimePartition } from '@/lib/timePartitions';
import TimelineVisual from '@/components/TimelineVisual';

export default function Home() {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [numPartitions, setNumPartitions] = useState(4);
  const [partitions, setPartitions] = useState<TimePartition[]>([]);

  const handleCalculate = () => {
    const result = calculatePartitions(startTime, endTime, numPartitions);
    setPartitions(result);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Time Partition Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Divide your time into equal partitions and visualize your schedule
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Start Time Input */}
            <div>
              <label
                htmlFor="startTime"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-800 font-medium"
              />
            </div>

            {/* End Time Input */}
            <div>
              <label
                htmlFor="endTime"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-800 font-medium"
              />
            </div>

            {/* Number of Partitions Input */}
            <div>
              <label
                htmlFor="numPartitions"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Number of Partitions
              </label>
              <input
                id="numPartitions"
                type="number"
                min="1"
                max="24"
                value={numPartitions}
                onChange={(e) => setNumPartitions(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-800 font-medium"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Calculate Partitions
          </button>
        </div>

        {/* Results */}
        {partitions.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your Time Partitions
            </h2>
            <TimelineVisual partitions={partitions} />
          </div>
        )}
      </div>
    </main>
  );
}
