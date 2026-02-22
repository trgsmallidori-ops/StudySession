import test from 'node:test';
import assert from 'node:assert/strict';

import { WEEK_STARTS_ON, WEEKDAY_MIN, WEEKDAY_SHORT, sortDaysByWeekStart } from '../lib/calendar/constants.ts';

test('calendar constants are Sunday-first', () => {
  assert.equal(WEEK_STARTS_ON, 0);
  assert.deepEqual(WEEKDAY_SHORT, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  assert.deepEqual(WEEKDAY_MIN, ['S', 'M', 'T', 'W', 'T', 'F', 'S']);
});

test('sortDaysByWeekStart sorts by Sunday-first display order', () => {
  assert.deepEqual(sortDaysByWeekStart([1, 0, 3]), [0, 1, 3]);
  assert.deepEqual(sortDaysByWeekStart([6, 2, 0, 2]), [0, 2, 6]);
  assert.deepEqual(sortDaysByWeekStart([9, -1, 5]), [5]);
});
