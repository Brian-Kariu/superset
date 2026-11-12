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
import { useCallback, useMemo, useState } from 'react';
import { styled } from '@apache-superset/core/theme';
import { RangePicker } from '@superset-ui/core/components';
import { extendedDayjs } from '@superset-ui/core/utils/dates';
import type { Dayjs } from 'dayjs';
import type {
  FrameComponentProps,
  FrameType,
} from 'src/explore/components/controls/DateFilterControl/types';
import { DAYJS_FORMAT } from 'src/explore/components/controls/DateFilterControl/utils/constants';
import { CalendarDatePickerPresetRail } from './CalendarDatePickerPresetRail';
import {
  PresetKey,
  presetToDayjsRange,
  timeRangeToPreset,
} from './CalendarDatePickerPresets';

const FrameShell = styled.div`
  position: relative;
  min-height: 360px;

  .ant-picker {
    width: 100%;
  }

  .ant-picker-dropdown {
    position: relative !important;
    inset: auto !important;
    transform: none !important;
    box-shadow: none;
  }

  .ant-picker-panel-container {
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.colorSplit};
    border-radius: ${({ theme }) => theme.borderRadius}px;
  }
`;

const PanelLayout = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colorBgElevated};
`;

const parseRangeString = (value: string): [Dayjs, Dayjs] | null => {
  const presetKey = timeRangeToPreset(value);
  if (presetKey) return presetToDayjsRange(presetKey);
  const parts = value.split(' : ');
  if (parts.length === 2) {
    const start = extendedDayjs(parts[0]);
    const end = extendedDayjs(parts[1]);
    if (start.isValid() && end.isValid()) return [start, end];
  }
  return null;
};

type CalendarDatePickerFrameProps = FrameComponentProps & {
  onSwitchFrame?: (frame: FrameType) => void;
};

const noopSwitch: (frame: FrameType) => void = () => {};

export function CalendarDatePickerFrame({
  value,
  onChange,
  onSwitchFrame = noopSwitch,
}: CalendarDatePickerFrameProps) {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(() =>
    parseRangeString(value),
  );
  const selectedPreset = useMemo(() => timeRangeToPreset(value), [value]);

  const handleRangeChange = useCallback(
    (dates: [Dayjs | null, Dayjs | null] | null) => {
      if (!dates || !dates[0] || !dates[1]) return;
      const [start, end] = dates as [Dayjs, Dayjs];
      setRange([start, end]);
      onChange(
        `${start.utc().format(DAYJS_FORMAT)} : ${end
          .utc()
          .format(DAYJS_FORMAT)}`,
      );
    },
    [onChange],
  );

  const handlePresetPick = useCallback(
    (encoded: string, key: PresetKey) => {
      setRange(presetToDayjsRange(key));
      onChange(encoded);
    },
    [onChange],
  );

  return (
    <FrameShell data-test="calendar-date-picker-frame">
      <RangePicker
        open
        value={range}
        onChange={handleRangeChange as any}
        format={DAYJS_FORMAT}
        allowClear={false}
        getPopupContainer={trigger =>
          (trigger.parentElement as HTMLElement) || document.body
        }
        panelRender={panel => (
          <PanelLayout>
            <CalendarDatePickerPresetRail
              selected={selectedPreset}
              onPick={handlePresetPick}
              onSwitchFrame={onSwitchFrame}
            />
            {panel}
          </PanelLayout>
        )}
      />
    </FrameShell>
  );
}
