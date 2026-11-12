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
import { FC, useMemo } from 'react';
import { t } from '@apache-superset/core/translation';
import { styled } from '@apache-superset/core/theme';
import { Menu, MenuItem } from '@superset-ui/core/components';
import type { FrameType } from 'src/explore/components/controls/DateFilterControl/types';
import { PresetKey, presetToTimeRange } from './CalendarDatePickerPresets';

type CalendarDatePickerPresetRailProps = {
  selected?: PresetKey;
  onPick: (encoded: string, key: PresetKey) => void;
  onSwitchFrame: (frame: FrameType) => void;
};

const RAIL_WIDTH = 180;

const RailContainer = styled.div`
  width: ${RAIL_WIDTH}px;
  border-right: 1px solid ${({ theme }) => theme.colorSplit};
  padding: ${({ theme }) => theme.sizeUnit}px 0;

  .ant-menu-light,
  .ant-menu-vertical {
    border-inline-end: none;
    background: transparent;
  }
`;

const GROUP_KEYS = new Set(['last', 'previous', 'current']);

const buildItems = (): MenuItem[] => [
  {
    key: 'last',
    label: t('Last'),
    children: [
      { key: 'last-7', label: t('Last 7 Days') },
      { key: 'last-14', label: t('Last 14 Days') },
      { key: 'last-30', label: t('Last 30 Days') },
      { key: 'last-90', label: t('Last 90 Days') },
    ],
  },
  {
    key: 'previous',
    label: t('Previous'),
    children: [
      { key: 'prev-week', label: t('Week') },
      { key: 'prev-month', label: t('Month') },
      { key: 'prev-quarter', label: t('Quarter') },
      { key: 'prev-year', label: t('Year') },
    ],
  },
  {
    key: 'current',
    label: t('Current'),
    children: [
      { key: 'cur-day', label: t('Day') },
      { key: 'cur-week', label: t('Week') },
      { key: 'cur-month', label: t('Month') },
      { key: 'cur-quarter', label: t('Quarter') },
      { key: 'cur-year', label: t('Year') },
    ],
  },
  { key: 'advanced', label: t('Advanced') },
];

const parentGroup = (key: PresetKey): string | undefined => {
  if (key.startsWith('last-')) return 'last';
  if (key.startsWith('prev-')) return 'previous';
  if (key.startsWith('cur-')) return 'current';
  return undefined;
};

export const CalendarDatePickerPresetRail: FC<
  CalendarDatePickerPresetRailProps
> = ({ selected, onPick, onSwitchFrame }) => {
  const items = useMemo(() => buildItems(), []);
  const openKeys = useMemo(() => {
    const g = selected ? parentGroup(selected) : undefined;
    return g ? [g] : [];
  }, [selected]);

  return (
    <RailContainer data-test="calendar-date-picker-preset-rail">
      <Menu
        mode="inline"
        selectable
        selectedKeys={selected ? [selected] : []}
        defaultOpenKeys={openKeys}
        items={items}
        onClick={({ key }) => {
          if (key === 'advanced') {
            onSwitchFrame('Advanced');
            return;
          }
          if (GROUP_KEYS.has(key)) return;
          const presetKey = key as PresetKey;
          onPick(presetToTimeRange(presetKey), presetKey);
        }}
      />
    </RailContainer>
  );
};
