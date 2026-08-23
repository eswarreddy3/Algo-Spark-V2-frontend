export type LeaderRow = {
  rank: number;
  name: string;
  group: string;
  points: number;
  /** Places gained (+) or lost (-) since last week. */
  delta: number;
  solved: number;
  streak: number;
  you?: boolean;
};

export type Scope = "Section" | "Branch" | "College";

/** Snapshot data. In the real app this is one paginated leaderboard endpoint. */
export const LEADERBOARDS: Record<Scope, LeaderRow[]> = {
  Section: [
    { rank: 1, name: "Aarav Sharma", group: "CSE-A", points: 4820, delta: 0, solved: 132, streak: 28 },
    { rank: 2, name: "Rohan Das", group: "CSE-A", points: 4430, delta: 1, solved: 121, streak: 16 },
    { rank: 3, name: "Meera Joshi", group: "CSE-A", points: 3540, delta: -1, solved: 98, streak: 9 },
    { rank: 4, name: "Aditya Kumar", group: "CSE-A", points: 3410, delta: 2, solved: 84, streak: 12, you: true },
    { rank: 5, name: "Kavya Menon", group: "CSE-A", points: 3280, delta: -1, solved: 79, streak: 4 },
    { rank: 6, name: "Sahil Bhat", group: "CSE-A", points: 3120, delta: 0, solved: 76, streak: 7 },
    { rank: 7, name: "Neha Pillai", group: "CSE-A", points: 2980, delta: 3, solved: 71, streak: 21 },
    { rank: 8, name: "Imran Qureshi", group: "CSE-A", points: 2870, delta: -2, solved: 68, streak: 2 },
    { rank: 9, name: "Divya Suresh", group: "CSE-A", points: 2740, delta: 0, solved: 64, streak: 5 },
    { rank: 10, name: "Tanmay Gupta", group: "CSE-A", points: 2610, delta: -1, solved: 61, streak: 3 },
  ],
  Branch: [
    { rank: 1, name: "Aarav Sharma", group: "CSE-A", points: 4820, delta: 0, solved: 132, streak: 28 },
    { rank: 2, name: "Priya Nair", group: "CSE-B", points: 4610, delta: 1, solved: 128, streak: 19 },
    { rank: 3, name: "Rohan Das", group: "CSE-A", points: 4430, delta: -1, solved: 121, streak: 16 },
    { rank: 4, name: "Karthik V", group: "CSE-C", points: 3990, delta: 2, solved: 110, streak: 11 },
    { rank: 5, name: "Vikram Rao", group: "CSE-B", points: 3720, delta: 0, solved: 104, streak: 8 },
    { rank: 6, name: "Meera Joshi", group: "CSE-A", points: 3540, delta: -2, solved: 98, streak: 9 },
    { rank: 7, name: "Aditya Kumar", group: "CSE-A", points: 3410, delta: 3, solved: 84, streak: 12, you: true },
    { rank: 8, name: "Sanjana Iyer", group: "CSE-C", points: 3360, delta: -1, solved: 82, streak: 6 },
    { rank: 9, name: "Kavya Menon", group: "CSE-A", points: 3280, delta: 0, solved: 79, streak: 4 },
    { rank: 10, name: "Harsh Vardhan", group: "CSE-B", points: 3190, delta: 1, solved: 77, streak: 14 },
  ],
  College: [
    { rank: 1, name: "Aarav Sharma", group: "CSE-A", points: 4820, delta: 0, solved: 132, streak: 28 },
    { rank: 2, name: "Priya Nair", group: "CSE-B", points: 4610, delta: 0, solved: 128, streak: 19 },
    { rank: 3, name: "Rohan Das", group: "CSE-A", points: 4430, delta: 1, solved: 121, streak: 16 },
    { rank: 4, name: "Sneha Reddy", group: "IT-A", points: 4180, delta: -1, solved: 115, streak: 22 },
    { rank: 5, name: "Karthik V", group: "CSE-C", points: 3990, delta: 2, solved: 110, streak: 11 },
    { rank: 6, name: "Ananya Iyer", group: "IT-B", points: 3870, delta: 0, solved: 106, streak: 13 },
    { rank: 7, name: "Vikram Rao", group: "CSE-B", points: 3720, delta: -2, solved: 104, streak: 8 },
    { rank: 8, name: "Meera Joshi", group: "CSE-A", points: 3540, delta: 1, solved: 98, streak: 9 },
    { rank: 9, name: "Aditya Kumar", group: "CSE-A", points: 3410, delta: 4, solved: 84, streak: 12, you: true },
    { rank: 10, name: "Farhan Ali", group: "IT-A", points: 3300, delta: -1, solved: 80, streak: 5 },
    { rank: 11, name: "Ritika Shah", group: "ECE-A", points: 3240, delta: 0, solved: 78, streak: 7 },
    { rank: 12, name: "Joel Mathew", group: "IT-B", points: 3150, delta: 2, solved: 75, streak: 10 },
  ],
};

export const SCOPE_META: Record<Scope, { label: string; population: number }> = {
  Section: { label: "CSE-A · 62 students", population: 62 },
  Branch: { label: "Computer Science · 248 students", population: 248 },
  College: { label: "All branches · 1 140 students", population: 1140 },
};
