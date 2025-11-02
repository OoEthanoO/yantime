export interface TimePartition {
  start: Date;
  end: Date;
  label: string;
  index: number;
}

export function calculatePartitions(
  startTime: string,
  endTime: string,
  numPartitions: number
): TimePartition[] {
  if (numPartitions < 1) {
    return [];
  }

  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  
  // Handle case where end time is before start time (crosses midnight)
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  const totalDuration = end.getTime() - start.getTime();
  const partitionDuration = totalDuration / numPartitions;

  const partitions: TimePartition[] = [];

  for (let i = 0; i < numPartitions; i++) {
    const partitionStart = new Date(start.getTime() + i * partitionDuration);
    const partitionEnd = new Date(start.getTime() + (i + 1) * partitionDuration);

    partitions.push({
      start: partitionStart,
      end: partitionEnd,
      label: `Partition ${i + 1}`,
      index: i,
    });
  }

  return partitions;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
}
