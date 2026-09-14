/**
 * The signed-in student. Institutional fields are set by the Super Admin at
 * onboarding and are read-only in the student app; the real app loads this
 * from the profile endpoint.
 */
export const STUDENT = {
  name: "Aditya Kumar",
  firstName: "Aditya",
  initials: "AK",
  roll: "21CS042",
  email: "21cs042@college.edu",
  joined: "Aug 2023",
  mentor: "Dr. Meera Raghavan",
  college: "Sri Vasavi Institute of Technology",
  collegeShort: "SVIT",
  branch: "Computer Science & Engineering",
  branchShort: "CSE",
  year: "3rd year",
  section: "CSE-A",
} as const;
