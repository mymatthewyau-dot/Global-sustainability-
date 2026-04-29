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
// Gradual declining trend; final values: N=62, P=18, DO=65
export const SIX_MONTH_HISTORY: WeeklyReading[] = [
  { week: 1,  date: '2025-04-07', label: 'Apr 7',  nScore: 65, pScore: 32, doScore: 73 },
  { week: 2,  date: '2025-04-14', label: 'Apr 14', nScore: 65, pScore: 31, doScore: 73 },
  { week: 3,  date: '2025-04-21', label: 'Apr 21', nScore: 64, pScore: 30, doScore: 72 },
  { week: 4,  date: '2025-04-28', label: 'Apr 28', nScore: 64, pScore: 29, doScore: 72 },
  { week: 5,  date: '2025-05-05', label: 'May 5',  nScore: 64, pScore: 28, doScore: 72 },
  { week: 6,  date: '2025-05-12', label: 'May 12', nScore: 63, pScore: 27, doScore: 71 },
  { week: 7,  date: '2025-05-19', label: 'May 19', nScore: 63, pScore: 27, doScore: 71 },
  { week: 8,  date: '2025-05-26', label: 'May 26', nScore: 63, pScore: 26, doScore: 70 },
  { week: 9,  date: '2025-06-02', label: 'Jun 2',  nScore: 63, pScore: 25, doScore: 70 },
  { week: 10, date: '2025-06-09', label: 'Jun 9',  nScore: 63, pScore: 25, doScore: 70 },
  { week: 11, date: '2025-06-16', label: 'Jun 16', nScore: 63, pScore: 24, doScore: 69 },
  { week: 12, date: '2025-06-23', label: 'Jun 23', nScore: 62, pScore: 24, doScore: 69 },
  { week: 13, date: '2025-06-30', label: 'Jun 30', nScore: 62, pScore: 23, doScore: 68 },
  { week: 14, date: '2025-07-07', label: 'Jul 7',  nScore: 62, pScore: 23, doScore: 68 },
  { week: 15, date: '2025-07-14', label: 'Jul 14', nScore: 62, pScore: 22, doScore: 68 },
  { week: 16, date: '2025-07-21', label: 'Jul 21', nScore: 62, pScore: 22, doScore: 67 },
  { week: 17, date: '2025-07-28', label: 'Jul 28', nScore: 62, pScore: 21, doScore: 67 },
  { week: 18, date: '2025-08-04', label: 'Aug 4',  nScore: 62, pScore: 21, doScore: 67 },
  { week: 19, date: '2025-08-11', label: 'Aug 11', nScore: 62, pScore: 20, doScore: 66 },
  { week: 20, date: '2025-08-18', label: 'Aug 18', nScore: 62, pScore: 20, doScore: 66 },
  { week: 21, date: '2025-08-25', label: 'Aug 25', nScore: 62, pScore: 19, doScore: 66 },
  { week: 22, date: '2025-09-01', label: 'Sep 1',  nScore: 62, pScore: 19, doScore: 66 },
  { week: 23, date: '2025-09-08', label: 'Sep 8',  nScore: 62, pScore: 19, doScore: 65 },
  { week: 24, date: '2025-09-15', label: 'Sep 15', nScore: 62, pScore: 18, doScore: 65 },
  { week: 25, date: '2025-09-22', label: 'Sep 22', nScore: 62, pScore: 18, doScore: 65 },
  { week: 26, date: '2025-10-06', label: 'Oct 6',  nScore: 62, pScore: 18, doScore: 65 },
];

export const LATEST_READING = SIX_MONTH_HISTORY[SIX_MONTH_HISTORY.length - 1];
