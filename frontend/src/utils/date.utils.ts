import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatTime = (date: Date): string => {
  return dayjs(date).format('h:mm A');
};

export const formatDate = (date: Date): string => {
  const day = dayjs(date);
  const today = dayjs();
  
  if (day.isSame(today, 'day')) return 'Today';
  if (day.isSame(today.add(1, 'day'), 'day')) return 'Tomorrow';
  if (day.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  
  return day.format('MMM D, YYYY');
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatRelativeTime = (date: Date): string => {
  return dayjs(date).fromNow();
};

export const roundToNearest15Minutes = (date: Date): Date => {
  return dayjs(date)
    .minute(Math.round(dayjs(date).minute() / 15) * 15)
    .second(0)
    .millisecond(0)
    .toDate();
};

export const getTimeSlots = (startHour: number = 6, endHour: number = 23): Date[] => {
  const slots: Date[] = [];
  let current = dayjs().hour(startHour).minute(0).second(0).millisecond(0);
  const end = dayjs().hour(endHour).minute(0).second(0).millisecond(0);

  while (current.isBefore(end) || current.isSame(end)) {
    slots.push(current.toDate());
    current = current.add(15, 'minute');
  }

  return slots;
};

export const isValidTimeBlockDuration = (start: Date, end: Date): boolean => {
  const duration = dayjs(end).diff(dayjs(start), 'minute');
  return duration >= 15 && duration % 15 === 0;
};

export const getWeekDates = (date: Date): Date[] => {
  const week = [];
  const startOfWeek = dayjs(date).startOf('week');

  for (let i = 0; i < 7; i++) {
    week.push(startOfWeek.add(i, 'day').toDate());
  }

  return week;
};