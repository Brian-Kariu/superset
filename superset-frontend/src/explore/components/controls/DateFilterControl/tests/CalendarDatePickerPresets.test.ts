/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { extendedDayjs } from '@superset-ui/core/utils/dates';
import {
  CurrentDay,
  CurrentMonth,
  CurrentQuarter,
  CurrentWeek,
  CurrentYear,
  PreviousCalendarMonth,
  PreviousCalendarQuarter,
  PreviousCalendarWeek,
  PreviousCalendarYear,
} from '../types';
import {
  CALENDAR_DATE_PICKER_VALUES_SET,
  PRESET_TO_TIME_RANGE,
  presetToDayjsRange,
  presetToTimeRange,
  timeRangeToPreset,
} from '../components/CalendarDatePickerPresets';
import { guessFrame } from '../utils/dateFilterUtils';

const fixedNow = extendedDayjs.utc('2024-11-15T00:00:00');

test('presetToTimeRange maps cur-* to canonical Current constants', () => {
  expect(presetToTimeRange('cur-day')).toBe(CurrentDay);
  expect(presetToTimeRange('cur-week')).toBe(CurrentWeek);
  expect(presetToTimeRange('cur-month')).toBe(CurrentMonth);
  expect(presetToTimeRange('cur-quarter')).toBe(CurrentQuarter);
  expect(presetToTimeRange('cur-year')).toBe(CurrentYear);
});

test('presetToTimeRange maps prev-* to canonical previous-calendar constants', () => {
  expect(presetToTimeRange('prev-week')).toBe(PreviousCalendarWeek);
  expect(presetToTimeRange('prev-month')).toBe(PreviousCalendarMonth);
  expect(presetToTimeRange('prev-quarter')).toBe(PreviousCalendarQuarter);
  expect(presetToTimeRange('prev-year')).toBe(PreviousCalendarYear);
});

test('presetToTimeRange encodes relative DATEADD for last-N', () => {
  expect(presetToTimeRange('last-7')).toBe(
    'DATEADD(DATETIME("today"), -7, day) : today',
  );
  expect(presetToTimeRange('last-14')).toBe(
    'DATEADD(DATETIME("today"), -14, day) : today',
  );
  expect(presetToTimeRange('last-30')).toBe(
    'DATEADD(DATETIME("today"), -30, day) : today',
  );
  expect(presetToTimeRange('last-90')).toBe(
    'DATEADD(DATETIME("today"), -90, day) : today',
  );
});

test('timeRangeToPreset round-trips every preset', () => {
  Object.entries(PRESET_TO_TIME_RANGE).forEach(([key, value]) => {
    expect(timeRangeToPreset(value)).toBe(key);
  });
});

test('timeRangeToPreset returns undefined for non-preset strings', () => {
  expect(timeRangeToPreset('Last week')).toBeUndefined();
  expect(timeRangeToPreset('2024-01-01 : 2024-01-07')).toBeUndefined();
});

test('presetToDayjsRange computes last-N ranges with frozen now', () => {
  const [l7s, l7e] = presetToDayjsRange('last-7', fixedNow);
  expect(l7s.toISOString()).toBe('2024-11-08T00:00:00.000Z');
  expect(l7e.toISOString()).toBe('2024-11-15T00:00:00.000Z');

  const [l90s, l90e] = presetToDayjsRange('last-90', fixedNow);
  expect(l90s.toISOString()).toBe('2024-08-17T00:00:00.000Z');
  expect(l90e.toISOString()).toBe('2024-11-15T00:00:00.000Z');
});

test('presetToDayjsRange computes Current ranges', () => {
  const [d0, d1] = presetToDayjsRange('cur-day', fixedNow);
  expect(d0.toISOString()).toBe('2024-11-15T00:00:00.000Z');
  expect(d1.toISOString()).toBe('2024-11-16T00:00:00.000Z');

  const [m0, m1] = presetToDayjsRange('cur-month', fixedNow);
  expect(m0.toISOString()).toBe('2024-11-01T00:00:00.000Z');
  expect(m1.toISOString()).toBe('2024-12-01T00:00:00.000Z');

  const [y0, y1] = presetToDayjsRange('cur-year', fixedNow);
  expect(y0.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  expect(y1.toISOString()).toBe('2025-01-01T00:00:00.000Z');
});

test('presetToDayjsRange computes Previous ranges as calendar-aligned prior unit', () => {
  const [m0, m1] = presetToDayjsRange('prev-month', fixedNow);
  expect(m0.toISOString()).toBe('2024-10-01T00:00:00.000Z');
  expect(m1.toISOString()).toBe('2024-11-01T00:00:00.000Z');

  const [y0, y1] = presetToDayjsRange('prev-year', fixedNow);
  expect(y0.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  expect(y1.toISOString()).toBe('2024-01-01T00:00:00.000Z');
});

test('presetToDayjsRange computes calendar-aligned quarter ranges', () => {
  const [c0, c1] = presetToDayjsRange('cur-quarter', fixedNow);
  expect(c0.toISOString()).toBe('2024-10-01T00:00:00.000Z');
  expect(c1.toISOString()).toBe('2025-01-01T00:00:00.000Z');

  const [p0, p1] = presetToDayjsRange('prev-quarter', fixedNow);
  expect(p0.toISOString()).toBe('2024-07-01T00:00:00.000Z');
  expect(p1.toISOString()).toBe('2024-10-01T00:00:00.000Z');
});

test('CALENDAR_DATE_PICKER_VALUES_SET contains every emitted preset string', () => {
  Object.values(PRESET_TO_TIME_RANGE).forEach(value => {
    expect(CALENDAR_DATE_PICKER_VALUES_SET.has(value)).toBe(true);
  });
});

test('guessFrame routes every preset string to CalendarDatePicker', () => {
  Object.values(PRESET_TO_TIME_RANGE).forEach(value => {
    expect(guessFrame(value)).toBe('CalendarDatePicker');
  });
});

test('guessFrame routes empty/NO_TIME_RANGE to CalendarDatePicker', () => {
  expect(guessFrame('')).toBe('CalendarDatePicker');
  expect(guessFrame('No filter')).toBe('CalendarDatePicker');
});

test('guessFrame still routes non-preset canonical strings to their frames', () => {
  expect(guessFrame('Last week')).toBe('Common');
});
