import { format, formatDistance, isToday, isTomorrow, isYesterday } from 'date-fns';

export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

export const formatDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
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
  return formatDistance(date, new Date(), { addSuffix: true });
};

export const roundToNearest15Minutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  const newDate = new Date(date);
  newDate.setMinutes(roundedMinutes);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
};

export const getTimeSlots = (startHour: number = 6, endHour: number = 23): Date[] => {
  const slots: Date[] = [];
  const today = new Date();
  today.setHours(startHour, 0, 0, 0);

  while (today.getHours() <= endHour) {
    slots.push(new Date(today));
    today.setMinutes(today.getMinutes() + 15);
  }

  return slots;
};

export const isValidTimeBlockDuration = (start: Date, end: Date): boolean => {
  const duration = end.getTime() - start.getTime();
  const minimumDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  return duration >= minimumDuration && duration % minimumDuration === 0;
};

export const getWeekDates = (date: Date): Date[] => {
  const week = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }

  return week;
};