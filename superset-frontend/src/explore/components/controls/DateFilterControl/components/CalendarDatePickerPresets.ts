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
import type { Dayjs, ManipulateType } from 'dayjs';
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
} from 'src/explore/components/controls/DateFilterControl/types';

export type LastPresetKey = 'last-7' | 'last-14' | 'last-30' | 'last-90';
export type PrevPresetKey =
  | 'prev-week'
  | 'prev-month'
  | 'prev-quarter'
  | 'prev-year';
export type CurPresetKey =
  | 'cur-day'
  | 'cur-week'
  | 'cur-month'
  | 'cur-quarter'
  | 'cur-year';

export type PresetKey = LastPresetKey | PrevPresetKey | CurPresetKey;

const encodeLastDays = (n: number): string =>
  `DATEADD(DATETIME("today"), -${n}, day) : today`;

export const PRESET_TO_TIME_RANGE: Record<PresetKey, string> = {
  'last-7': encodeLastDays(7),
  'last-14': encodeLastDays(14),
  'last-30': encodeLastDays(30),
  'last-90': encodeLastDays(90),
  'prev-week': PreviousCalendarWeek,
  'prev-month': PreviousCalendarMonth,
  'prev-quarter': PreviousCalendarQuarter,
  'prev-year': PreviousCalendarYear,
  'cur-day': CurrentDay,
  'cur-week': CurrentWeek,
  'cur-month': CurrentMonth,
  'cur-quarter': CurrentQuarter,
  'cur-year': CurrentYear,
};

export const CALENDAR_DATE_PICKER_VALUES_SET = new Set<string>(
  Object.values(PRESET_TO_TIME_RANGE),
);

export const presetToTimeRange = (key: PresetKey): string =>
  PRESET_TO_TIME_RANGE[key];

export const timeRangeToPreset = (value: string): PresetKey | undefined => {
  const entry = (
    Object.entries(PRESET_TO_TIME_RANGE) as [PresetKey, string][]
  ).find(([, v]) => v === value);
  return entry ? entry[0] : undefined;
};

type CalendarUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

const PREV_UNIT: Record<PrevPresetKey, CalendarUnit> = {
  'prev-week': 'week',
  'prev-month': 'month',
  'prev-quarter': 'quarter',
  'prev-year': 'year',
};

const CUR_UNIT: Record<CurPresetKey, CalendarUnit> = {
  'cur-day': 'day',
  'cur-week': 'week',
  'cur-month': 'month',
  'cur-quarter': 'quarter',
  'cur-year': 'year',
};

/**
 * Quarters are handled as three-month spans so the dayjs quarterOfYear
 * plugin (not registered on extendedDayjs) is not required.
 */
const startOfUnit = (date: Dayjs, unit: CalendarUnit): Dayjs =>
  unit === 'quarter'
    ? date.startOf('month').month(Math.floor(date.month() / 3) * 3)
    : date.startOf(unit);

const unitStep = (unit: CalendarUnit): [number, ManipulateType] =>
  unit === 'quarter' ? [3, 'month'] : [1, unit];

export const presetToDayjsRange = (
  key: PresetKey,
  now: Dayjs = extendedDayjs().utc().startOf('day'),
): [Dayjs, Dayjs] => {
  if (key in PREV_UNIT) {
    const unit = PREV_UNIT[key as PrevPresetKey];
    const start = startOfUnit(now, unit);
    const [amount, stepUnit] = unitStep(unit);
    return [start.subtract(amount, stepUnit), start];
  }
  if (key in CUR_UNIT) {
    const unit = CUR_UNIT[key as CurPresetKey];
    const start = startOfUnit(now, unit);
    const [amount, stepUnit] = unitStep(unit);
    return [start, start.add(amount, stepUnit)];
  }
  const days = Number(key.split('-')[1]);
  return [now.subtract(days, 'day'), now];
};
