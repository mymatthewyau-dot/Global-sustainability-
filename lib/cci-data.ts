// lib/cci-data.ts

export interface WeeklyReading {
  week: number;
  date: string;       // ISO date string
  nScore: number;     // 0-100 nitrogen goodness (higher = less eutrophic)
  pScore: number;     // 0-100 phosphorus goodness
  doScore: number;    // 0-100 dissolved oxygen (higher = more oxygen)
  label: string;      // e.g. "Apr 7"
}

// 26 weekly readings, April 7 → Oct 6 2025 (southern hemisphere winter)
// Final values locked: N=58, P=24, DO=78
export const SIX_MONTH_HISTORY: WeeklyReading[] = [
  { week: 1,  date: '2025-04-07', label: 'Apr 7',  nScore: 40, pScore: 12, doScore: 60 },
  { week: 2,  date: '2025-04-14', label: 'Apr 14', nScore: 41, pScore: 13, doScore: 61 },
  { week: 3,  date: '2025-04-21', label: 'Apr 21', nScore: 43, pScore: 13, doScore: 62 },
  { week: 4,  date: '2025-04-28', label: 'Apr 28', nScore: 42, pScore: 14, doScore: 62 },
  { week: 5,  date: '2025-05-05', label: 'May 5',  nScore: 44, pScore: 14, doScore: 63 },
  { week: 6,  date: '2025-05-12', label: 'May 12', nScore: 45, pScore: 15, doScore: 64 },
  { week: 7,  date: '2025-05-19', label: 'May 19', nScore: 46, pScore: 15, doScore: 65 },
  { week: 8,  date: '2025-05-26', label: 'May 26', nScore: 47, pScore: 16, doScore: 65 },
  { week: 9,  date: '2025-06-02', label: 'Jun 2',  nScore: 47, pScore: 16, doScore: 66 },
  { week: 10, date: '2025-06-09', label: 'Jun 9',  nScore: 48, pScore: 17, doScore: 67 },
  { week: 11, date: '2025-06-16', label: 'Jun 16', nScore: 49, pScore: 17, doScore: 67 },
  { week: 12, date: '2025-06-23', label: 'Jun 23', nScore: 50, pScore: 18, doScore: 68 },
  { week: 13, date: '2025-06-30', label: 'Jun 30', nScore: 50, pScore: 18, doScore: 69 },
  { week: 14, date: '2025-07-07', label: 'Jul 7',  nScore: 51, pScore: 19, doScore: 70 },
  { week: 15, date: '2025-07-14', label: 'Jul 14', nScore: 52, pScore: 19, doScore: 71 },
  { week: 16, date: '2025-07-21', label: 'Jul 21', nScore: 52, pScore: 20, doScore: 71 },
  { week: 17, date: '2025-07-28', label: 'Jul 28', nScore: 53, pScore: 20, doScore: 72 },
  { week: 18, date: '2025-08-04', label: 'Aug 4',  nScore: 54, pScore: 21, doScore: 73 },
  { week: 19, date: '2025-08-11', label: 'Aug 11', nScore: 54, pScore: 21, doScore: 74 },
  { week: 20, date: '2025-08-18', label: 'Aug 18', nScore: 55, pScore: 22, doScore: 74 },
  { week: 21, date: '2025-08-25', label: 'Aug 25', nScore: 55, pScore: 22, doScore: 75 },
  { week: 22, date: '2025-09-01', label: 'Sep 1',  nScore: 56, pScore: 23, doScore: 76 },
  { week: 23, date: '2025-09-08', label: 'Sep 8',  nScore: 57, pScore: 23, doScore: 76 },
  { week: 24, date: '2025-09-15', label: 'Sep 15', nScore: 57, pScore: 23, doScore: 77 },
  { week: 25, date: '2025-09-22', label: 'Sep 22', nScore: 57, pScore: 24, doScore: 77 },
  { week: 26, date: '2025-10-06', label: 'Oct 6',  nScore: 58, pScore: 24, doScore: 78 },
];

export const LATEST_READING = SIX_MONTH_HISTORY[SIX_MONTH_HISTORY.length - 1];
