const {
  getBusinessDate,
  toBusinessDate,
  getWorkingLeaveDates,
  getLeaveDaysByYear,
} = require("../../../utils/leave.utils");

describe("leave.utils", () => {
  describe("toBusinessDate", () => {
    test("should convert a date string into a Date object", () => {
      const result = toBusinessDate("2026-07-25");

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2026-07-25T00:00:00.000Z");
    });
  });

  describe("getWorkingLeaveDates", () => {
    test("should exclude weekends", () => {
      const start = new Date("2026-07-20T00:00:00Z"); // Monday
      const end = new Date("2026-07-26T00:00:00Z"); // Sunday

      const dates = getWorkingLeaveDates(start, end);

      expect(dates).toHaveLength(5);
    });

    test("should return one day when start and end are the same weekday", () => {
      const day = new Date("2026-07-22T00:00:00Z");

      const dates = getWorkingLeaveDates(day, day);

      expect(dates).toHaveLength(1);
    });

    test("should return zero days for a weekend", () => {
      const saturday = new Date("2026-07-25T00:00:00Z");
      const sunday = new Date("2026-07-26T00:00:00Z");

      const dates = getWorkingLeaveDates(saturday, sunday);

      expect(dates).toHaveLength(0);
    });
  });

  describe("getLeaveDaysByYear", () => {
    test("should group leave days by year", () => {
      const dates = [
        new Date("2025-12-30"),
        new Date("2025-12-31"),
        new Date("2026-01-01"),
      ];

      expect(getLeaveDaysByYear(dates)).toEqual([
        { year: 2025, days: 2 },
        { year: 2026, days: 1 },
      ]);
    });
  });
});