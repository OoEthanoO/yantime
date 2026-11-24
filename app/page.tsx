'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { calculatePartitions, formatDuration } from '@/lib/timePartitions';
import TimelineVisual from '@/components/TimelineVisual';

// Everything on the page is kept in this browser's localStorage, so a refresh
// brings back the same times and the same partition counts.
const STORAGE_KEY = 'yantime:v1';
const MAX_PARTITIONS = 24;

type SavedState = {
  startTime: string;
  endTime: string;
  counts: number[];
  draftCount: number;
};

const DEFAULT_STATE: SavedState = {
  startTime: '09:00',
  endTime: '17:00',
  counts: [4],
  draftCount: 4,
};

const isTime = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value);

const clampCount = (value: number) =>
  Math.min(MAX_PARTITIONS, Math.max(1, Math.round(value)));

const sortedUnique = (values: number[]) =>
  Array.from(new Set(values)).sort((a, b) => a - b);

function readSavedState(): SavedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SavedState>;
    const counts = Array.isArray(data.counts)
      ? sortedUnique(
          data.counts
            .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
            .map(clampCount)
        )
      : DEFAULT_STATE.counts;
    return {
      startTime: isTime(data.startTime) ? data.startTime : DEFAULT_STATE.startTime,
      endTime: isTime(data.endTime) ? data.endTime : DEFAULT_STATE.endTime,
      counts,
      draftCount:
        typeof data.draftCount === 'number' && Number.isFinite(data.draftCount)
          ? clampCount(data.draftCount)
          : DEFAULT_STATE.draftCount,
    };
  } catch {
    return null;
  }
}

function writeSavedState(state: SavedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private windows or blocked storage: the page still works, it just forgets.
  }
}

const inputClass =
  'w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-gray-800 font-medium';

// True only in the browser, where localStorage exists. The server render (and
// hydration) sees false, so the planner mounts right after with saved values.
const subscribeNoop = () => () => {};
function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

export default function Home() {
  const isClient = useIsClient();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Time Partition Tool
          </h1>
          <p className="text-gray-600 text-lg">
            Divide your time into equal partitions and compare several splits at once
          </p>
        </div>

        {isClient ? <Planner /> : null}
      </div>
    </main>
  );
}

function Planner() {
  const [initial] = useState(() => readSavedState() ?? DEFAULT_STATE);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [counts, setCounts] = useState<number[]>(initial.counts);
  const [draftCount, setDraftCount] = useState(initial.draftCount);

  useEffect(() => {
    writeSavedState({ startTime, endTime, counts, draftCount });
  }, [startTime, endTime, counts, draftCount]);

  const timelines = useMemo(
    () =>
      counts.map((count) => ({
        count,
        partitions: calculatePartitions(startTime, endTime, count),
      })),
    [counts, startTime, endTime]
  );

  const addCount = () => {
    setCounts((previous) => sortedUnique([...previous, clampCount(draftCount)]));
  };

  const removeCount = (count: number) => {
    setCounts((previous) => previous.filter((n) => n !== count));
  };

  return (
    <>
      {/* Input Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              onChange={(e) => setStartTime(e.target.value || DEFAULT_STATE.startTime)}
              className={inputClass}
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
              onChange={(e) => setEndTime(e.target.value || DEFAULT_STATE.endTime)}
              className={inputClass}
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
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                addCount();
              }}
            >
              <input
                id="numPartitions"
                type="number"
                min="1"
                max={MAX_PARTITIONS}
                value={draftCount}
                onChange={(e) => setDraftCount(parseInt(e.target.value) || 1)}
                className={inputClass}
              />
              <button
                type="submit"
                className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {/* The partition counts being shown */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 mr-1">Showing:</span>
          {counts.length === 0 ? (
            <span className="text-sm text-gray-500">
              nothing yet. Add a number of partitions.
            </span>
          ) : (
            counts.map((count) => (
              <span
                key={count}
                className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 pl-3 pr-1 py-1 text-sm font-semibold text-blue-700"
              >
                {count} {count === 1 ? 'partition' : 'partitions'}
                <button
                  type="button"
                  onClick={() => removeCount(count)}
                  aria-label={`Remove ${count} ${count === 1 ? 'partition' : 'partitions'}`}
                  className="ml-1 w-6 h-6 rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-800 leading-none"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Results: one timeline per partition count */}
      <div className="space-y-14">
        {timelines.map(({ count, partitions }) => {
          const each =
            partitions.length > 0
              ? partitions[0].end.getTime() - partitions[0].start.getTime()
              : 0;
          return (
            <section key={count} className="animate-fade-in">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {count} {count === 1 ? 'Partition' : 'Partitions'}
                </h2>
                <span className="text-gray-600 font-medium">
                  {formatDuration(each)} each
                </span>
              </div>
              <TimelineVisual partitions={partitions} />
            </section>
          );
        })}
      </div>
    </>
  );
}
