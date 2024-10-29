import dayjs from 'dayjs';
import businessTime from '../src';

describe('Add Business Minutes', () => {
  beforeAll(() => {
    dayjs.extend(businessTime);

    const holidays = ['2021-01-01', '2021-01-25', '2021-06-03'];

    dayjs.setHolidays(holidays);

    // Setting wednesday working hours for 2 segments
    //   with 3 and 5 hours respectively
    const businessHours = dayjs.getBusinessTime();
    businessHours.wednesday = [
      { start: '09:00:00', end: '12:00:00' },
      { start: '13:00:00', end: '18:00:00' },
    ];
  });

  it('should handle `null` arguments', () => {
    const date = dayjs('2021-02-08 09:00:00');
    const expected = dayjs('2021-02-08 09:00:00');

    const newDate = date.addBusinessMinutes(null);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should handle negative arguments', () => {
    const date = dayjs('2021-02-08 09:15:00');
    const expected = dayjs('2021-02-08 09:00:00');

    const newDate = date.addBusinessMinutes(-15);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 15 business minutes on a date', () => {
    const date = dayjs('2021-02-08 09:00:00');
    const expected = dayjs('2021-02-08 09:15:00');

    const newDate = date.addBusinessMinutes(15);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 33 business minutes on a date in a day with 2 working segments', () => {
    const date = dayjs('2021-02-03 11:30:00');
    const expected = dayjs('2021-02-03 13:03:00');

    const newDate = date.addBusinessMinutes(33);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 45 business minutes on a date before a weekend', () => {
    // february 19th, 2021 is a friday
    const date = dayjs('2021-02-19 16:30:00');

    // february 25th, 2021 is a monday
    const expected = dayjs('2021-02-22 09:15:00');

    const newDate = date.addBusinessMinutes(45);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 10 business hours on a date before a holiday', () => {
    // june 2nd, 2021 is a wednesday
    //   before corpus christ holiday
    const date = dayjs('2021-06-02 17:55');

    // june 4th, 2021 is a friday
    const expected = dayjs('2021-06-04 09:05:00');

    const newDate = date.addBusinessMinutes(10);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });

  it('should add 16 business minutes on a date before a long weekend', () => {
    // january 22nd, 2021 is a friday
    //   before São Paulo City anniversary
    const date = dayjs('2021-01-22 17:00:00');

    // january 27th, 2021 is a wednesday
    const expected = dayjs('2021-01-26 09:16:00');

    const newDate = date.addBusinessMinutes(16);

    expect(newDate).toBeDefined();
    expect(newDate).toStrictEqual(expected);
  });
});
