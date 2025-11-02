'use client';

import { TimePartition, formatTime, formatDuration } from '@/lib/timePartitions';

interface TimelineVisualProps {
  partitions: TimePartition[];
}

const colors = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-rose-400 to-rose-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-amber-400 to-amber-600',
  'bg-gradient-to-br from-lime-400 to-lime-600',
  'bg-gradient-to-br from-emerald-400 to-emerald-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-cyan-400 to-cyan-600',
  'bg-gradient-to-br from-sky-400 to-sky-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
];

export default function TimelineVisual({ partitions }: TimelineVisualProps) {
  if (partitions.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-8">
      {/* Timeline Bar */}
      <div className="relative">
        <div className="flex w-full rounded-lg overflow-hidden shadow-lg h-16">
          {partitions.map((partition, index) => (
            <div
              key={index}
              className={`flex-1 ${colors[index % colors.length]} transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer relative group`}
              style={{ zIndex: partitions.length - index }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                  {index + 1}
                </span>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                  <div className="font-semibold">Partition {index + 1}</div>
                  <div>{formatTime(partition.start)} - {formatTime(partition.end)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partitions.map((partition, index) => {
          const duration = partition.end.getTime() - partition.start.getTime();
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
            >
              <div className={`h-2 ${colors[index % colors.length]}`}></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-800">
                    Partition {index + 1}
                  </h3>
                  <span className={`w-8 h-8 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
                    {index + 1}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Start:</span>
                    <span className="text-gray-800 font-semibold">
                      {formatTime(partition.start)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">End:</span>
                    <span className="text-gray-800 font-semibold">
                      {formatTime(partition.end)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-medium">Duration:</span>
                    <span className="text-gray-800 font-semibold">
                      {formatDuration(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
