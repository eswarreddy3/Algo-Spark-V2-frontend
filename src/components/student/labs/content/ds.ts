import type { Week } from "../types";
import { upcoming } from "./shared";

export const DS_WEEKS: Week[] = [
  {
    n: 1,
    title: "Intro & Complexity Analysis",
    summary: "How to reason about the cost of a program before you run it.",
    objectives: [
      "Count the operations of a loop and express them as a growth rate",
      "Compare O(1), O(log n), O(n), O(n log n) and O(n²) on real input sizes",
      "Trade memory for time using a precomputed table",
    ],
    points: 150,
    published: true,
    readingMinutes: 18,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 1 slides — Complexity Analysis", kind: "pdf", meta: "PDF · 2.1 MB" },
      { label: "Recorded lecture — Big-O in 20 minutes", kind: "video", meta: "Video · 21:04" },
      { label: "Growth-rate cheat sheet", kind: "link", meta: "Reference" },
    ],
    slides: [
      {
        title: "Why complexity comes before code",
        bullets: [
          "The same problem solved two ways can differ by hours at n = 10⁶",
          "Hardware gets ~2× faster per generation; an O(n²) → O(n) rewrite is 1000× at n = 1000",
          "Interviewers ask for the complexity before they ask for the code",
        ],
      },
      {
        title: "Big-O, Big-Ω and Big-Θ",
        bullets: [
          "O(f) — upper bound: the algorithm is never slower than f, up to a constant",
          "Ω(f) — lower bound: it is never faster than f",
          "Θ(f) — both bounds match; this is the honest answer when you have it",
          "Constants and lower-order terms are dropped: 3n² + 90n + 7 is Θ(n²)",
        ],
      },
      {
        title: "Counting operations",
        bullets: [
          "One loop over n items → n iterations → O(n)",
          "A loop inside a loop over the same n → O(n²)",
          "Halving the search space each step → O(log n)",
        ],
        code: {
          language: "python",
          source: "total = 0\nfor i in range(n):        # n iterations\n    for j in range(i, n):  # n - i iterations\n        total += 1\n# n + (n-1) + ... + 1 = n(n+1)/2  ->  O(n^2)",
        },
      },
      {
        title: "Space complexity counts too",
        bullets: [
          "Auxiliary space = memory used beyond the input",
          "A prefix-sum table costs O(n) space to make every range query O(1)",
          "Recursion is not free: each frame is a stack entry, so depth d costs O(d)",
        ],
        note: "In lab exams you will be asked for both time and space. Say both, in that order.",
      },
      {
        title: "Growth rates at a glance",
        bullets: [
          "n = 10⁶ · O(n) ≈ instant · O(n log n) ≈ 20× that · O(n²) ≈ 11 days",
          "Rule of thumb: 10⁸ simple operations per second in C++, 10⁷ in Python",
          "If the constraint says n ≤ 10⁵, an O(n²) solution will time out",
        ],
      },
    ],
    mcqs: [
      {
        id: "ds1-1",
        q: "What is the time complexity of accessing an element by index in an array?",
        opts: ["O(n)", "O(1)", "O(log n)", "O(n log n)"],
        a: 1,
        explain: "The address is base + index × element size — one arithmetic step, regardless of length.",
      },
      {
        id: "ds1-2",
        q: "3n² + 90n + 7 belongs to which class?",
        opts: ["O(n)", "O(n log n)", "O(n²)", "O(n³)"],
        a: 2,
        explain: "Constants and lower-order terms drop away; the n² term dominates as n grows.",
      },
      {
        id: "ds1-3",
        q: "An algorithm halves its search range every step. Its time complexity is:",
        opts: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        a: 0,
        explain: "n → n/2 → n/4 … reaches 1 after log₂n steps.",
      },
      {
        id: "ds1-4",
        q: "Building a prefix-sum table to answer range queries trades:",
        opts: ["Time for correctness", "O(n) extra space for O(1) queries", "Space for accuracy", "Nothing — it is free"],
        a: 1,
        explain: "You pay O(n) memory and one O(n) pass up front, then every range query is a single subtraction.",
      },
    ],
    exercise: {
      id: "ds1-prefix",
      title: "Range Sum Queries",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n + q)",
      statement: [
        "You are given an integer array nums and a list of queries. Each query is a pair (l, r) asking for the sum of nums[l] through nums[r], inclusive.",
        "A naive loop per query is O(n·q) and will time out. Precompute a prefix-sum table so every query is answered in constant time.",
      ],
      constraints: ["1 ≤ nums.length ≤ 10⁵", "0 ≤ l ≤ r < nums.length", "1 ≤ queries.length ≤ 10⁵"],
      examples: [
        { input: "nums = [1, 2, 3, 4], queries = [(0, 2), (1, 3)]", output: "[6, 9]", note: "1+2+3 = 6 and 2+3+4 = 9." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["for", "return"],
      starter: {
        python: `def range_sums(nums, queries):
    """Return the sum of nums[l..r] for each (l, r) in queries."""
    # TODO: build a prefix table, then answer each query in O(1)
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<long long> rangeSums(vector<int>& nums, vector<pair<int,int>>& queries) {
    // TODO: build a prefix table, then answer each query in O(1)
    return {};
}`,
        java: `class Solution {
    long[] rangeSums(int[] nums, int[][] queries) {
        // TODO: build a prefix table, then answer each query in O(1)
        return new long[0];
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample — overlapping ranges", input: "nums = [1,2,3,4], queries = [(0,2),(1,3)]", expected: "[6, 9]" },
        { id: "t2", name: "Single element range", input: "nums = [5,-2,7], queries = [(1,1)]", expected: "[-2]" },
        { id: "t3", name: "Whole array", input: "nums = [4,4,4], queries = [(0,2)]", expected: "[12]" },
        { id: "t4", name: "Large input · 10⁵ queries", input: "nums = [1]*100000, queries = 100000 random ranges", expected: "accepted under 1.0s", hidden: true },
      ],
    },
  },

  {
    n: 2,
    title: "Arrays & Two Pointers",
    summary: "Scanning an array from both ends to drop a nested loop.",
    objectives: [
      "Recognise when a sorted array admits a two-pointer scan",
      "Convert an O(n²) pair search into a single O(n) pass",
      "Handle in-place mutation without extra allocation",
    ],
    points: 150,
    published: true,
    readingMinutes: 16,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 2 slides — Arrays & Two Pointers", kind: "pdf", meta: "PDF · 1.8 MB" },
      { label: "Lab walkthrough — in-place removal", kind: "video", meta: "Video · 14:32" },
    ],
    slides: [
      {
        title: "Arrays in memory",
        bullets: [
          "Contiguous block → index arithmetic is O(1) and the CPU cache loves it",
          "Insertion in the middle shifts every later element → O(n)",
          "Dynamic arrays double their capacity; amortised append is O(1)",
        ],
      },
      {
        title: "The two-pointer pattern",
        bullets: [
          "Keep a left and a right index and move them toward each other",
          "Works when the data is sorted or when order does not matter",
          "Each element is visited at most once → O(n) time, O(1) space",
        ],
        code: {
          language: "python",
          source: "lo, hi = 0, len(nums) - 1\nwhile lo < hi:\n    s = nums[lo] + nums[hi]\n    if s == target:\n        return [lo, hi]\n    if s < target:\n        lo += 1   # need a bigger sum\n    else:\n        hi -= 1   # need a smaller sum",
        },
      },
      {
        title: "Fast and slow pointers",
        bullets: [
          "Both pointers move forward, at different speeds",
          "Used for in-place filtering: slow marks the write position",
          "Also detects cycles in linked structures (week 4)",
        ],
      },
      {
        title: "Sliding window",
        bullets: [
          "A window [start, end) that grows on the right and shrinks on the left",
          "Ideal for 'longest / shortest subarray with property P'",
          "Still O(n): every index enters and leaves the window once",
        ],
      },
      {
        title: "Choosing the right scan",
        bullets: [
          "Sorted input + pair condition → two pointers from the ends",
          "In-place removal or partition → fast/slow pointers",
          "Contiguous subarray + constraint → sliding window",
        ],
        note: "If you find yourself writing a nested loop over the same array, stop and ask which of these three applies.",
      },
    ],
    mcqs: [
      {
        id: "ds2-1",
        q: "Two pointers moving inward on a sorted array give what time complexity?",
        opts: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
        a: 2,
        explain: "The pointers only ever move toward each other, so together they take at most n steps.",
      },
      {
        id: "ds2-2",
        q: "Inserting an element at the front of an array of length n costs:",
        opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        a: 2,
        explain: "Every existing element must shift one position right.",
      },
      {
        id: "ds2-3",
        q: "The two-pointer technique requires the input to be sorted when:",
        opts: [
          "Always",
          "Never",
          "The decision to move a pointer depends on comparing sums or values",
          "The array holds negative numbers",
        ],
        a: 2,
        explain: "Sorting is what makes 'too small → move left up' a valid decision.",
      },
      {
        id: "ds2-4",
        q: "Auxiliary space used by an in-place fast/slow pointer filter is:",
        opts: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        a: 0,
        explain: "Only the two indices are stored; the writing happens inside the input array.",
      },
    ],
    exercise: {
      id: "ds2-pair",
      title: "Pair With Target Sum",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n) time, O(1) space",
      statement: [
        "Given a sorted array of integers and a target, return the 0-based indices of the two numbers that add up to the target.",
        "Exactly one pair exists. Solve it in one pass with two pointers — a nested loop will fail the large hidden case.",
      ],
      constraints: ["2 ≤ nums.length ≤ 10⁵", "nums is sorted in non-decreasing order", "Exactly one valid pair exists"],
      examples: [
        { input: "nums = [1, 3, 4, 6, 8], target = 10", output: "[2, 3]", note: "nums[2] + nums[3] = 4 + 6 = 10." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["while", "return"],
      starter: {
        python: `def pair_with_sum(nums, target):
    """Return the indices of the two values that add up to target."""
    # TODO: walk one pointer from the left and one from the right
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> pairWithSum(vector<int>& nums, int target) {
    // TODO: walk one pointer from the left and one from the right
    return {};
}`,
        java: `class Solution {
    int[] pairWithSum(int[] nums, int target) {
        // TODO: walk one pointer from the left and one from the right
        return new int[0];
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "nums = [1,3,4,6,8], target = 10", expected: "[2, 3]" },
        { id: "t2", name: "Pair at the ends", input: "nums = [2,5,9,11], target = 13", expected: "[0, 3]" },
        { id: "t3", name: "Negative values", input: "nums = [-8,-3,0,4], target = -3", expected: "[0, 3]" },
        { id: "t4", name: "Large sorted input", input: "nums = 10⁵ sorted values, target near the end", expected: "accepted under 0.5s", hidden: true },
      ],
    },
  },

  {
    n: 3,
    title: "Strings",
    summary: "Immutability, character counting and the cost of concatenation.",
    objectives: [
      "Explain why repeated string concatenation is quadratic",
      "Use a frequency table to compare strings in O(n)",
      "Normalise input before comparing (case, spacing, punctuation)",
    ],
    points: 150,
    published: true,
    readingMinutes: 15,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 3 slides — Strings", kind: "pdf", meta: "PDF · 1.6 MB" },
      { label: "Practice set — 12 string drills", kind: "link", meta: "Worksheet" },
    ],
    slides: [
      {
        title: "A string is an array of characters",
        bullets: [
          "Indexing is O(1); length is stored, not counted",
          "In Python and Java strings are immutable — every edit builds a new object",
          "In C++ std::string is mutable and grows like a vector",
        ],
      },
      {
        title: "The concatenation trap",
        bullets: [
          "s += ch inside a loop copies the whole string each time → O(n²)",
          "Collect the pieces in a list / StringBuilder and join once → O(n)",
        ],
        code: {
          language: "python",
          source: "# Quadratic\nout = ''\nfor ch in text:\n    out += ch\n\n# Linear\nparts = []\nfor ch in text:\n    parts.append(ch)\nout = ''.join(parts)",
        },
      },
      {
        title: "Frequency tables",
        bullets: [
          "26 counters (or a hash map) turn 'same letters?' into one pass",
          "Anagram check: count up for one string, down for the other, all zero at the end",
          "Space is O(alphabet), which is O(1) for ASCII",
        ],
      },
      {
        title: "Normalising input",
        bullets: [
          "Lowercase before comparing unless case is meaningful",
          "Strip spaces and punctuation for palindrome-style problems",
          "Do it once, up front — not inside the comparison loop",
        ],
      },
      {
        title: "Substring search",
        bullets: [
          "Naive search compares at every offset → O(n·m)",
          "KMP preprocesses the pattern to skip re-comparisons → O(n + m)",
          "Library find() is usually optimised — know the cost before you re-implement it",
        ],
        note: "KMP is covered in the theory paper; the lab expects the frequency-table technique.",
      },
    ],
    mcqs: [
      {
        id: "ds3-1",
        q: "Repeated s += ch inside a loop over n characters costs:",
        opts: ["O(n)", "O(n log n)", "O(n²)", "O(1)"],
        a: 2,
        explain: "Each += copies the accumulated string, so the copies add up to 1 + 2 + … + n.",
      },
      {
        id: "ds3-2",
        q: "Checking whether two ASCII strings are anagrams with a count array is:",
        opts: ["O(n) time, O(1) space", "O(n log n) time", "O(n²) time", "O(n) time, O(n) space"],
        a: 0,
        explain: "One pass over each string; the 26-slot table is constant space.",
      },
      {
        id: "ds3-3",
        q: "Which statement about Java strings is true?",
        opts: [
          "They are mutable",
          "They are immutable — StringBuilder exists for cheap edits",
          "They cannot be indexed",
          "They store their length in O(n)",
        ],
        a: 1,
        explain: "String is immutable; StringBuilder gives an amortised O(1) append.",
      },
      {
        id: "ds3-4",
        q: "Naive substring search of a pattern of length m in text of length n is:",
        opts: ["O(n + m)", "O(n·m)", "O(log n)", "O(m²)"],
        a: 1,
        explain: "Each of the ~n offsets can compare up to m characters before failing.",
      },
    ],
    exercise: {
      id: "ds3-anagram",
      title: "Anagram Check",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n) time, O(1) space",
      statement: [
        "Given two strings, return true if one is an anagram of the other — same letters, same counts, order ignored.",
        "Compare case-insensitively and ignore spaces. Sorting both strings works but costs O(n log n); use a frequency table for O(n).",
      ],
      constraints: ["1 ≤ length ≤ 10⁵", "Input contains letters and spaces only"],
      examples: [
        { input: 'a = "Listen", b = "Silent"', output: "true" },
        { input: 'a = "hello", b = "world"', output: "false" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["for", "return"],
      starter: {
        python: `def is_anagram(a, b):
    """Return True if a and b use exactly the same letters."""
    # TODO: normalise case, drop spaces, then count characters
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

bool isAnagram(string a, string b) {
    // TODO: normalise case, drop spaces, then count characters
    return false;
}`,
        java: `class Solution {
    boolean isAnagram(String a, String b) {
        // TODO: normalise case, drop spaces, then count characters
        return false;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample — mixed case", input: 'a = "Listen", b = "Silent"', expected: "true" },
        { id: "t2", name: "Different letters", input: 'a = "hello", b = "world"', expected: "false" },
        { id: "t3", name: "Spaces ignored", input: 'a = "conversation", b = "voices rant on"', expected: "true" },
        { id: "t4", name: "Same letters, different counts", input: 'a = "aab", b = "abb"', expected: "false", hidden: true },
      ],
    },
  },

  {
    n: 4,
    title: "Linked Lists",
    summary: "Pointer surgery: insert, delete, reverse and detect cycles.",
    objectives: [
      "Compare array and linked-list costs for insert, delete and access",
      "Reverse a singly linked list iteratively in O(1) space",
      "Detect a cycle with Floyd's fast/slow pointers",
    ],
    points: 150,
    published: true,
    readingMinutes: 20,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 4 slides — Linked Lists", kind: "pdf", meta: "PDF · 2.4 MB" },
      { label: "Recorded lecture — pointer reversal, step by step", kind: "video", meta: "Video · 18:47" },
      { label: "Visualiser — linked list operations", kind: "link", meta: "Interactive" },
    ],
    slides: [
      {
        title: "Node and next",
        bullets: [
          "Each node stores a value and a reference to the following node",
          "The list is identified by its head; the last node points at null",
          "No contiguity → no index arithmetic → access is O(n)",
        ],
      },
      {
        title: "Array vs linked list",
        bullets: [
          "Access by index: array O(1), list O(n)",
          "Insert / delete at a known node: array O(n), list O(1)",
          "Memory: array is compact, list pays one pointer per element",
        ],
      },
      {
        title: "Iterative reversal",
        bullets: [
          "Keep three references: prev, curr, next",
          "Re-point curr.next at prev, then slide all three forward",
          "O(n) time, O(1) space — the recursion version costs O(n) stack",
        ],
        code: {
          language: "python",
          source: "prev = None\ncurr = head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\nreturn prev  # new head",
        },
      },
      {
        title: "Floyd's cycle detection",
        bullets: [
          "slow moves one node per step, fast moves two",
          "If they ever meet, the list has a cycle",
          "If fast reaches null, the list is straight — O(n) time, O(1) space",
        ],
      },
      {
        title: "Dummy head nodes",
        bullets: [
          "A dummy node in front removes the 'deleting the head' special case",
          "Common in merge, remove-nth and partition problems",
          "Return dummy.next at the end",
        ],
        note: "Draw the pointers on paper before you write the loop. Every year, most lab marks are lost to a lost reference.",
      },
    ],
    mcqs: [
      {
        id: "ds4-1",
        q: "Accessing the k-th element of a singly linked list costs:",
        opts: ["O(1)", "O(log k)", "O(k)", "O(n log n)"],
        a: 2,
        explain: "You must walk from the head, one next at a time.",
      },
      {
        id: "ds4-2",
        q: "Iterative reversal of a singly linked list uses how much auxiliary space?",
        opts: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
        a: 0,
        explain: "Only the prev / curr / next references, whatever the list length.",
      },
      {
        id: "ds4-3",
        q: "In Floyd's algorithm, the two pointers meet only when:",
        opts: ["The list is sorted", "The list contains a cycle", "The list is empty", "The list has even length"],
        a: 1,
        explain: "Without a cycle the fast pointer runs off the end and the loop stops.",
      },
      {
        id: "ds4-4",
        q: "Why use a dummy head node?",
        opts: [
          "It makes access O(1)",
          "It removes the special case of modifying the real head",
          "It saves memory",
          "It sorts the list",
        ],
        a: 1,
        explain: "Every node then has a predecessor, so insertion and deletion share one code path.",
      },
    ],
    exercise: {
      id: "ds4-reverse",
      title: "Reverse a Linked List",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n) time, O(1) space",
      statement: [
        "Given the head of a singly linked list, reverse it and return the new head.",
        "The list is passed to your function as a chain of nodes; the harness prints the values from the returned head. Solve it iteratively in constant extra space.",
      ],
      constraints: ["0 ≤ number of nodes ≤ 5·10⁴", "Do not allocate a second list"],
      examples: [
        { input: "head = 1 -> 2 -> 3 -> 4", output: "4 -> 3 -> 2 -> 1" },
        { input: "head = null", output: "null", note: "An empty list reverses to itself." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["while", "next"],
      starter: {
        python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


def reverse_list(head):
    """Reverse the list in place and return the new head."""
    # TODO: keep prev / curr / next and re-point each node
    pass`,
        cpp: `struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* reverseList(ListNode* head) {
    // TODO: keep prev / curr / next and re-point each node
    return nullptr;
}`,
        java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    ListNode reverseList(ListNode head) {
        // TODO: keep prev / curr / next and re-point each node
        return null;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "1 -> 2 -> 3 -> 4", expected: "4 -> 3 -> 2 -> 1" },
        { id: "t2", name: "Single node", input: "7", expected: "7" },
        { id: "t3", name: "Empty list", input: "null", expected: "null" },
        { id: "t4", name: "5·10⁴ nodes", input: "long chain", expected: "accepted, no stack overflow", hidden: true },
      ],
    },
  },

  {
    n: 5,
    title: "Recursion & Backtracking",
    summary: "Base cases, the call stack, and undoing a choice.",
    objectives: [
      "Write a recursive function with a provably terminating base case",
      "Trace the call stack and state the space cost of recursion depth",
      "Generate combinations by choosing, recursing and undoing",
    ],
    points: 150,
    published: true,
    readingMinutes: 19,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 5 slides — Recursion & Backtracking", kind: "pdf", meta: "PDF · 2.0 MB" },
      { label: "Recursion tree worksheet", kind: "link", meta: "Worksheet" },
    ],
    slides: [
      {
        title: "Two parts of every recursion",
        bullets: [
          "Base case — the input small enough to answer directly",
          "Recursive case — reduce the input and call yourself",
          "If the input does not strictly shrink, you get a stack overflow",
        ],
      },
      {
        title: "The call stack",
        bullets: [
          "Each call pushes a frame holding parameters and locals",
          "Depth d costs O(d) memory even when the work is O(1) per call",
          "Python's default recursion limit is 1000 frames",
        ],
      },
      {
        title: "Recursion trees",
        bullets: [
          "Fibonacci by naive recursion branches twice per call → O(2ⁿ)",
          "Memoising the results collapses it to O(n)",
          "Draw the tree to read off both the time and the depth",
        ],
        code: {
          language: "python",
          source: "from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef fib(n):\n    if n < 2:          # base case\n        return n\n    return fib(n - 1) + fib(n - 2)",
        },
      },
      {
        title: "Backtracking = choose, explore, undo",
        bullets: [
          "Append the candidate to the current path",
          "Recurse on the remaining choices",
          "Pop the candidate before trying the next one",
        ],
      },
      {
        title: "Pruning",
        bullets: [
          "Abandon a branch as soon as it cannot lead to a valid answer",
          "N-Queens: stop the moment two queens share a diagonal",
          "Pruning does not change the worst case; it changes the practical run time",
        ],
        note: "Every backtracking solution in the lab exam must print the path length as well as the paths.",
      },
    ],
    mcqs: [
      {
        id: "ds5-1",
        q: "A recursive function without a reachable base case will:",
        opts: ["Return null", "Loop forever until the stack overflows", "Run in O(1)", "Be optimised away"],
        a: 1,
        explain: "Each call pushes a frame and none ever returns, exhausting the stack.",
      },
      {
        id: "ds5-2",
        q: "Naive recursive Fibonacci runs in:",
        opts: ["O(n)", "O(n log n)", "O(2ⁿ)", "O(n²)"],
        a: 2,
        explain: "Each call spawns two more, so the tree has roughly 2ⁿ nodes.",
      },
      {
        id: "ds5-3",
        q: "Recursion of depth d uses how much extra space?",
        opts: ["O(1)", "O(d)", "O(d²)", "O(log d)"],
        a: 1,
        explain: "One stack frame stays live per level until the deepest call returns.",
      },
      {
        id: "ds5-4",
        q: "The 'undo' step in backtracking exists to:",
        opts: [
          "Free memory",
          "Restore the shared state before trying the next candidate",
          "Speed up the base case",
          "Sort the results",
        ],
        a: 1,
        explain: "The path is shared across branches, so a choice must be removed before the sibling branch runs.",
      },
    ],
    exercise: {
      id: "ds5-subsets",
      title: "Generate All Subsets",
      difficulty: "Medium",
      points: 60,
      targetComplexity: "O(n · 2ⁿ)",
      statement: [
        "Given an array of distinct integers, return every possible subset (the power set). Subsets may appear in any order.",
        "Use backtracking: at each index either include the element or skip it, and undo the choice on the way back up.",
      ],
      constraints: ["1 ≤ nums.length ≤ 12", "Elements are distinct"],
      examples: [
        { input: "nums = [1, 2]", output: "[[], [1], [1,2], [2]]", note: "2ⁿ = 4 subsets for two elements." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["append", "return"],
      starter: {
        python: `def subsets(nums):
    """Return every subset of nums."""
    out, path = [], []

    def backtrack(i):
        # TODO: record the current path, then choose / recurse / undo
        pass

    backtrack(0)
    return out`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

void backtrack(int i, vector<int>& nums, vector<int>& path, vector<vector<int>>& out) {
    // TODO: record the current path, then choose / recurse / undo
}

vector<vector<int>> subsets(vector<int>& nums) {
    vector<vector<int>> out;
    vector<int> path;
    backtrack(0, nums, path, out);
    return out;
}`,
        java: `import java.util.*;

class Solution {
    List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> out = new ArrayList<>();
        // TODO: record the current path, then choose / recurse / undo
        return out;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample — two elements", input: "nums = [1,2]", expected: "4 subsets" },
        { id: "t2", name: "Single element", input: "nums = [9]", expected: "2 subsets" },
        { id: "t3", name: "Three elements", input: "nums = [1,2,3]", expected: "8 subsets" },
        { id: "t4", name: "Maximum size", input: "nums = 12 distinct values", expected: "4096 subsets, no duplicates", hidden: true },
      ],
    },
  },

  {
    n: 6,
    title: "Stacks & Queues",
    summary: "LIFO and FIFO — the two orderings behind undo, parsing and scheduling.",
    objectives: [
      "Implement push / pop / peek and reason about their O(1) cost",
      "Use a stack to validate nested structures",
      "Explain where a queue beats a stack, and build one from two stacks",
    ],
    points: 150,
    published: true,
    readingMinutes: 17,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 6 slides — Stacks & Queues", kind: "pdf", meta: "PDF · 1.9 MB" },
      { label: "Recorded lecture — expression parsing", kind: "video", meta: "Video · 16:20" },
      { label: "Lab sheet — 8 stack drills", kind: "link", meta: "Worksheet" },
    ],
    slides: [
      {
        title: "What is a stack? (LIFO)",
        bullets: [
          "Last in, first out — the most recent item leaves first",
          "push, pop and peek are all O(1)",
          "Backed by an array or a linked list; the array version is cache-friendlier",
        ],
      },
      {
        title: "Stack operations in practice",
        bullets: [
          "push(x) — add to the top",
          "pop() — remove and return the top; error if empty",
          "peek() — read the top without removing it",
          "Always check isEmpty() before popping",
        ],
        code: {
          language: "python",
          source: "stack = []\nstack.append('(')   # push\ntop = stack[-1]     # peek\nstack.pop()         # pop\nempty = not stack   # isEmpty",
        },
      },
      {
        title: "Queues and FIFO ordering",
        bullets: [
          "First in, first out — a fair waiting line",
          "enqueue at the rear, dequeue from the front, both O(1)",
          "A naive array queue drifts rightwards; a circular buffer fixes that",
        ],
      },
      {
        title: "Circular queues and deques",
        bullets: [
          "Circular queue wraps the rear index with modulo capacity",
          "Deque allows push and pop at both ends",
          "Deques back sliding-window maxima and undo/redo pairs",
        ],
      },
      {
        title: "Where they show up",
        bullets: [
          "Stack — undo history, browser back, expression parsing, DFS, call frames",
          "Queue — print spooling, CPU scheduling, BFS, message buffers",
          "Two stacks can simulate a queue with amortised O(1) dequeue",
        ],
        note: "Bracket matching is the classic viva question: expect it in the lab exam.",
      },
    ],
    mcqs: [
      {
        id: "ds6-1",
        q: "Which data structure uses FIFO ordering?",
        opts: ["Stack", "Queue", "Tree", "Heap"],
        a: 1,
        explain: "A queue serves the earliest arrival first; a stack serves the most recent.",
      },
      {
        id: "ds6-2",
        q: "push, pop and peek on an array-backed stack cost:",
        opts: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        a: 0,
        explain: "All three touch only the top index.",
      },
      {
        id: "ds6-3",
        q: "Validating nested brackets is naturally solved with:",
        opts: ["A queue", "A stack", "A heap", "A hash map alone"],
        a: 1,
        explain: "The most recently opened bracket must close first — exactly LIFO order.",
      },
      {
        id: "ds6-4",
        q: "A circular queue exists to:",
        opts: [
          "Sort elements on insert",
          "Reuse the array slots freed at the front",
          "Make access by index O(1)",
          "Allow duplicate values",
        ],
        a: 1,
        explain: "Wrapping the rear index with modulo capacity stops the queue drifting off the end of the array.",
      },
    ],
    exercise: {
      id: "ds6-balanced",
      title: "Balanced Parentheses",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n) time, O(n) space",
      statement: [
        "Given a string containing (), [] and {}, return true if every bracket is closed by the matching type and correctly nested.",
        "Push every opening bracket; on a closing bracket, pop and compare. The string is balanced only if the stack is empty at the end.",
      ],
      constraints: ["0 ≤ s.length ≤ 10⁴", "s contains only the six bracket characters"],
      examples: [
        { input: 's = "{[()]}"', output: "true" },
        { input: 's = "(]"', output: "false", note: "The closing bracket does not match the top of the stack." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["pop", "return"],
      starter: {
        python: `def is_balanced(s):
    """Return True when every bracket in s is correctly closed and nested."""
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    # TODO: push openers, pop and compare on closers, then check the stack is empty
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

bool isBalanced(string s) {
    stack<char> st;
    // TODO: push openers, pop and compare on closers, then check the stack is empty
    return false;
}`,
        java: `import java.util.*;

class Solution {
    boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        // TODO: push openers, pop and compare on closers, then check the stack is empty
        return false;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample — nested", input: 's = "{[()]}"', expected: "true" },
        { id: "t2", name: "Mismatched types", input: 's = "(]"', expected: "false" },
        { id: "t3", name: "Unclosed opener", input: 's = "((()"', expected: "false" },
        { id: "t4", name: "Closer with empty stack", input: 's = ")("', expected: "false", hidden: true },
        { id: "t5", name: "10⁴ characters", input: "s = deep nesting", expected: "accepted under 0.2s", hidden: true },
      ],
    },
  },

  {
    n: 7,
    title: "Trees",
    summary: "Hierarchies, traversals and the binary search tree invariant.",
    objectives: [
      "Traverse a binary tree in pre-, in- and post-order",
      "State the BST invariant and use it to search in O(h)",
      "Compute height and explain why balance matters",
    ],
    points: 150,
    published: true,
    readingMinutes: 22,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 7 slides — Trees", kind: "pdf", meta: "PDF · 2.6 MB" },
      { label: "Recorded lecture — traversals visualised", kind: "video", meta: "Video · 23:11" },
    ],
    slides: [
      {
        title: "Tree vocabulary",
        bullets: [
          "Root, parent, child, leaf, subtree",
          "Height = longest root-to-leaf edge count; depth is measured from the root",
          "A binary tree gives each node at most two children",
        ],
      },
      {
        title: "Depth-first traversals",
        bullets: [
          "Pre-order: node, left, right — copies the structure",
          "In-order: left, node, right — sorted output for a BST",
          "Post-order: left, right, node — frees or evaluates children first",
        ],
        code: {
          language: "python",
          source: "def inorder(node, out):\n    if not node:\n        return\n    inorder(node.left, out)\n    out.append(node.val)\n    inorder(node.right, out)",
        },
      },
      {
        title: "Breadth-first traversal",
        bullets: [
          "Level order, driven by a queue — the week 6 structure earns its keep",
          "Used for shortest path on unweighted graphs and level-wise printing",
          "O(n) time, O(width) space",
        ],
      },
      {
        title: "Binary search trees",
        bullets: [
          "Invariant: everything in the left subtree < node < everything in the right",
          "Search, insert and delete are O(h) where h is the height",
          "Balanced h = log n; a sorted insert order degrades the tree to a list with h = n",
        ],
      },
      {
        title: "Keeping it balanced",
        bullets: [
          "AVL rotates on insert to keep height difference ≤ 1",
          "Red-black trees relax that slightly for cheaper insertion",
          "Library maps (std::map, TreeMap) are red-black trees",
        ],
        note: "The lab exam asks for in-order traversal plus a height calculation — practise both recursively and iteratively.",
      },
    ],
    mcqs: [
      {
        id: "ds7-1",
        q: "In-order traversal of a binary search tree produces values in:",
        opts: ["Random order", "Sorted ascending order", "Reverse insertion order", "Level order"],
        a: 1,
        explain: "Left subtree < node < right subtree, applied recursively, yields ascending output.",
      },
      {
        id: "ds7-2",
        q: "Searching a BST of height h costs:",
        opts: ["O(1)", "O(h)", "O(n log n)", "O(n²)"],
        a: 1,
        explain: "Each comparison drops one level, so the cost follows the height, not the node count.",
      },
      {
        id: "ds7-3",
        q: "Inserting already-sorted keys into an unbalanced BST gives a height of:",
        opts: ["log n", "n", "n log n", "√n"],
        a: 1,
        explain: "Every key goes to the right, degenerating the tree into a linked list.",
      },
      {
        id: "ds7-4",
        q: "Level-order traversal is implemented with:",
        opts: ["A stack", "A queue", "A heap", "Recursion only"],
        a: 1,
        explain: "Nodes are visited in arrival order, which is exactly FIFO.",
      },
    ],
    exercise: {
      id: "ds7-height",
      title: "Maximum Depth of a Binary Tree",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n) time, O(h) space",
      statement: [
        "Given the root of a binary tree, return its maximum depth — the number of nodes along the longest path from the root down to a leaf.",
        "An empty tree has depth 0. Recursion is the natural fit: the depth of a node is one more than the deeper of its two subtrees.",
      ],
      constraints: ["0 ≤ number of nodes ≤ 10⁴", "Node values fit in a 32-bit integer"],
      examples: [
        { input: "root = [3, 9, 20, null, null, 15, 7]", output: "3" },
        { input: "root = []", output: "0" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["max", "return"],
      starter: {
        python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def max_depth(root):
    """Return the number of nodes on the longest root-to-leaf path."""
    # TODO: base case for the empty node, then recurse on both children
    pass`,
        cpp: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

int maxDepth(TreeNode* root) {
    // TODO: base case for the empty node, then recurse on both children
    return 0;
}`,
        java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

class Solution {
    int maxDepth(TreeNode root) {
        // TODO: base case for the empty node, then recurse on both children
        return 0;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "[3,9,20,null,null,15,7]", expected: "3" },
        { id: "t2", name: "Empty tree", input: "[]", expected: "0" },
        { id: "t3", name: "Single node", input: "[1]", expected: "1" },
        { id: "t4", name: "Left-skewed, 10⁴ nodes", input: "long left chain", expected: "10000", hidden: true },
      ],
    },
  },

  upcoming(8, "Graphs", "Adjacency lists, BFS and DFS on real networks.", "26 Aug 2026", [
    "Represent a graph as an adjacency list and reason about the space cost",
    "Traverse with BFS and DFS and know which one answers which question",
    "Detect a cycle in a directed graph",
  ]),
  upcoming(9, "Sorting", "Comparison sorts, stability and when to stop writing your own.", "2 Sep 2026", [
    "Trace merge sort and quicksort and state their best / worst cases",
    "Explain stability and why it matters for multi-key sorting",
    "Pick the right library sort for the data at hand",
  ]),
  upcoming(10, "Hashing", "Hash functions, collisions and the O(1) average case.", "9 Sep 2026", [
    "Explain how chaining and open addressing resolve collisions",
    "Reason about load factor and rehashing",
    "Use a hash map to turn a nested loop into a single pass",
  ]),
  upcoming(11, "Dynamic Programming", "Overlapping subproblems, memoisation and tabulation.", "16 Sep 2026", [
    "Spot overlapping subproblems and optimal substructure",
    "Convert a recursive solution into a memoised one",
    "Write the bottom-up table and reduce its space",
  ]),
  upcoming(12, "Mock Round", "A timed placement-style round over the whole syllabus.", "23 Sep 2026", [
    "Solve two unseen problems under a 90-minute clock",
    "Justify your complexity choices in a short viva",
  ]),
];
