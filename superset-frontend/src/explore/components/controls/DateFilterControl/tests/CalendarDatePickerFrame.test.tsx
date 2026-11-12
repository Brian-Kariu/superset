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
import { render, screen, fireEvent } from 'spec/helpers/testing-library';
import { CalendarDatePickerFrame } from '../components/CalendarDatePickerFrame';
import { CurrentQuarter, PreviousCalendarWeek } from '../types';

test('renders preset rail with top-level group labels', () => {
  render(
    <CalendarDatePickerFrame
      value=""
      onChange={jest.fn()}
      onSwitchFrame={jest.fn()}
    />,
  );

  expect(screen.getByText('Last')).toBeInTheDocument();
  expect(screen.getByText('Previous')).toBeInTheDocument();
  expect(screen.getByText('Current')).toBeInTheDocument();
  expect(screen.getByText('Advanced')).toBeInTheDocument();
});

test('Last submenu expands and picking 7 Days emits DATEADD encoding', () => {
  const onChange = jest.fn();
  render(
    <CalendarDatePickerFrame
      value=""
      onChange={onChange}
      onSwitchFrame={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByText('Last'));
  fireEvent.click(screen.getByText('Last 7 Days'));

  expect(onChange).toHaveBeenLastCalledWith(
    'DATEADD(DATETIME("today"), -7, day) : today',
  );
});

test('Previous submenu picks canonical previous-calendar week', () => {
  const onChange = jest.fn();
  render(
    <CalendarDatePickerFrame
      value=""
      onChange={onChange}
      onSwitchFrame={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByText('Previous'));
  fireEvent.click(screen.getByText('Week'));

  expect(onChange).toHaveBeenLastCalledWith(PreviousCalendarWeek);
});

test('Current submenu picks canonical Current quarter', () => {
  const onChange = jest.fn();
  render(
    <CalendarDatePickerFrame
      value=""
      onChange={onChange}
      onSwitchFrame={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByText('Current'));
  fireEvent.click(screen.getByText('Quarter'));

  expect(onChange).toHaveBeenLastCalledWith(CurrentQuarter);
});

test('clicking Advanced triggers onSwitchFrame', () => {
  const onSwitchFrame = jest.fn();
  render(
    <CalendarDatePickerFrame
      value=""
      onChange={jest.fn()}
      onSwitchFrame={onSwitchFrame}
    />,
  );

  fireEvent.click(screen.getByText('Advanced'));

  expect(onSwitchFrame).toHaveBeenCalledWith('Advanced');
});

test('highlights rail entry matching incoming value', () => {
  render(
    <CalendarDatePickerFrame
      value={PreviousCalendarWeek}
      onChange={jest.fn()}
      onSwitchFrame={jest.fn()}
    />,
  );

  const item = screen
    .getAllByText('Week')[0]
    .closest('li.ant-menu-item, li.ant-menu-item-selected');
  expect(item).toHaveClass('ant-menu-item-selected');
});
