export const WEEK_STARTS_ON = 0 as const;

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAY_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export const WEEKDAY_OPTIONS = WEEKDAY_SHORT.map((label, value) => ({ value, label }));

export function sortDaysByWeekStart(days: number[]): number[] {
  const unique = [...new Set(days.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))];
  return unique.sort((a, b) => {
    const aKey = (a - WEEK_STARTS_ON + 7) % 7;
    const bKey = (b - WEEK_STARTS_ON + 7) % 7;
    return aKey - bKey;
  });
}
