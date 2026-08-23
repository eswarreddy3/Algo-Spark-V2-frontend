import type { Exercise } from "../labs/types";

/**
 * The practice bank. Problems use the same `Exercise` shape as lab coding
 * tasks, so the practice page and the labs share one editor, one runner and
 * one results panel.
 */
export type PracticeProblem = {
  exercise: Exercise;
  tags: string[];
  companies: string[];
  /** Percentage of submissions accepted — shown as a difficulty signal. */
  acceptance: number;
  /** Problems the demo student has already cleared. */
  solvedSeed: boolean;
};

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    tags: ["Arrays", "Hash Map"],
    companies: ["Amazon", "Google"],
    acceptance: 54,
    solvedSeed: true,
    exercise: {
      id: "two-sum",
      title: "Two Sum",
      difficulty: "Easy",
      points: 40,
      targetComplexity: "O(n) time, O(n) space",
      statement: [
        "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up to the target.",
        "Exactly one answer exists and you may not use the same element twice. A hash map of value → index turns the nested loop into a single pass.",
      ],
      constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹", "Exactly one valid answer exists"],
      examples: [
        { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "nums[0] + nums[1] = 9." },
        { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["for", "return"],
      starter: {
        python: `def two_sum(nums, target):
    """Return the indices of the two values that add up to target."""
    # TODO: remember each value you have seen and look for target - value
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // TODO: remember each value you have seen and look for target - value
    return {};
}`,
        java: `import java.util.*;

class Solution {
    int[] twoSum(int[] nums, int target) {
        // TODO: remember each value you have seen and look for target - value
        return new int[0];
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "nums = [2,7,11,15], target = 9", expected: "[0, 1]" },
        { id: "t2", name: "Answer in the middle", input: "nums = [3,2,4], target = 6", expected: "[1, 2]" },
        { id: "t3", name: "Duplicate values", input: "nums = [3,3], target = 6", expected: "[0, 1]" },
        { id: "t4", name: "Negative numbers", input: "nums = [-3,4,3,90], target = 0", expected: "[0, 2]", hidden: true },
        { id: "t5", name: "10⁴ elements", input: "large input", expected: "accepted under 0.3s", hidden: true },
      ],
    },
  },
  {
    tags: ["Stack", "String"],
    companies: ["Microsoft"],
    acceptance: 61,
    solvedSeed: true,
    exercise: {
      id: "valid-parentheses",
      title: "Valid Parentheses",
      difficulty: "Easy",
      points: 40,
      targetComplexity: "O(n) time, O(n) space",
      statement: [
        "Given a string containing only the characters `()[]{}`, decide whether the brackets are closed in the correct order.",
        "Push every opening bracket and pop on every closing one. The string is valid only if each pop matches and the stack ends empty.",
      ],
      constraints: ["1 ≤ s.length ≤ 10⁴", "s contains bracket characters only"],
      examples: [
        { input: 's = "()[]{}"', output: "true" },
        { input: 's = "([)]"', output: "false", note: "The brackets overlap instead of nesting." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["pop", "return"],
      starter: {
        python: `def is_valid(s):
    """Return True when every bracket in s closes in the right order."""
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    # TODO: push openers, match closers against the top of the stack
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

bool isValid(string s) {
    stack<char> st;
    // TODO: push openers, match closers against the top of the stack
    return false;
}`,
        java: `import java.util.*;

class Solution {
    boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        // TODO: push openers, match closers against the top of the stack
        return false;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: 's = "()[]{}"', expected: "true" },
        { id: "t2", name: "Crossed brackets", input: 's = "([)]"', expected: "false" },
        { id: "t3", name: "Single opener", input: 's = "("', expected: "false" },
        { id: "t4", name: "Closer first", input: 's = "]"', expected: "false", hidden: true },
      ],
    },
  },
  {
    tags: ["Arrays", "Sorting"],
    companies: ["Adobe", "Uber"],
    acceptance: 46,
    solvedSeed: false,
    exercise: {
      id: "merge-intervals",
      title: "Merge Intervals",
      difficulty: "Medium",
      points: 60,
      targetComplexity: "O(n log n)",
      statement: [
        "Given a list of intervals `[start, end]`, merge every pair that overlaps and return the resulting list.",
        "Sort by start time first — then a single sweep can extend the current interval or begin a new one.",
      ],
      constraints: ["1 ≤ intervals.length ≤ 10⁴", "start ≤ end", "Output must be sorted by start"],
      examples: [
        { input: "[[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", note: "[1,3] and [2,6] overlap." },
        { input: "[[1,4],[4,5]]", output: "[[1,5]]", note: "Touching intervals count as overlapping." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["sort", "for"],
      starter: {
        python: `def merge(intervals):
    """Merge every overlapping interval and return the result."""
    # TODO: sort by start, then sweep once extending or appending
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& intervals) {
    // TODO: sort by start, then sweep once extending or appending
    return {};
}`,
        java: `import java.util.*;

class Solution {
    int[][] merge(int[][] intervals) {
        // TODO: sort by start, then sweep once extending or appending
        return new int[0][];
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]" },
        { id: "t2", name: "Touching intervals", input: "[[1,4],[4,5]]", expected: "[[1,5]]" },
        { id: "t3", name: "Already disjoint", input: "[[1,2],[5,6]]", expected: "[[1,2],[5,6]]" },
        { id: "t4", name: "Fully contained", input: "[[1,10],[2,3]]", expected: "[[1,10]]", hidden: true },
      ],
    },
  },
  {
    tags: ["Hash Map", "Strings"],
    companies: ["Amazon", "Flipkart"],
    acceptance: 58,
    solvedSeed: false,
    exercise: {
      id: "group-anagrams",
      title: "Group Anagrams",
      difficulty: "Medium",
      points: 60,
      targetComplexity: "O(n · k log k)",
      statement: [
        "Given an array of strings, group the anagrams together. Each group may be returned in any order.",
        "Two words are anagrams when their sorted letters match — that sorted string makes a natural hash-map key.",
      ],
      constraints: ["1 ≤ words.length ≤ 10⁴", "0 ≤ word.length ≤ 100", "Lowercase letters only"],
      examples: [
        { input: '["eat","tea","tan","ate","nat","bat"]', output: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["sorted", "return"],
      starter: {
        python: `def group_anagrams(words):
    """Group words that are anagrams of one another."""
    # TODO: key each word by its sorted letters
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& words) {
    // TODO: key each word by its sorted letters
    return {};
}`,
        java: `import java.util.*;

class Solution {
    List<List<String>> groupAnagrams(String[] words) {
        // TODO: key each word by its sorted letters
        return new ArrayList<>();
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: '["eat","tea","tan","ate","nat","bat"]', expected: "3 groups" },
        { id: "t2", name: "Empty string", input: '[""]', expected: "1 group" },
        { id: "t3", name: "No anagrams", input: '["abc","def"]', expected: "2 groups" },
        { id: "t4", name: "10⁴ words", input: "large input", expected: "accepted under 1.0s", hidden: true },
      ],
    },
  },
  {
    tags: ["Design", "Hash Map", "Linked List"],
    companies: ["Amazon", "Meta"],
    acceptance: 39,
    solvedSeed: false,
    exercise: {
      id: "lru-cache",
      title: "LRU Cache",
      difficulty: "Medium",
      points: 70,
      targetComplexity: "O(1) per operation",
      statement: [
        "Design a cache with a fixed capacity supporting `get(key)` and `put(key, value)` in O(1).",
        "When the cache is full, evict the least recently used entry. A hash map plus a doubly linked list gives constant-time lookup and reordering.",
      ],
      constraints: ["1 ≤ capacity ≤ 3000", "Up to 10⁵ calls", "Both operations must be O(1)"],
      examples: [
        {
          input: "capacity = 2; put(1,1); put(2,2); get(1); put(3,3); get(2)",
          output: "1, -1",
          note: "Adding key 3 evicts key 2, the least recently used.",
        },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["capacity", "def get"],
      starter: {
        python: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        # TODO: pick structures that give O(1) lookup and reordering

    def get(self, key):
        # TODO
        pass

    def put(self, key, value):
        # TODO: evict the least recently used entry when full
        pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {
        // TODO: pick structures that give O(1) lookup and reordering
    }

    int get(int key) {
        // TODO
        return -1;
    }

    void put(int key, int value) {
        // TODO: evict the least recently used entry when full
    }
};`,
        java: `import java.util.*;

class LRUCache {
    LRUCache(int capacity) {
        // TODO: pick structures that give O(1) lookup and reordering
    }

    int get(int key) {
        // TODO
        return -1;
    }

    void put(int key, int value) {
        // TODO: evict the least recently used entry when full
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample sequence", input: "capacity = 2, 5 operations", expected: "1, -1" },
        { id: "t2", name: "Update existing key", input: "put(1,1); put(1,5); get(1)", expected: "5" },
        { id: "t3", name: "Capacity one", input: "capacity = 1", expected: "evicts on every put" },
        { id: "t4", name: "10⁵ operations", input: "stress test", expected: "accepted under 1.5s", hidden: true },
      ],
    },
  },
  {
    tags: ["Heap", "Sorting"],
    companies: ["Google", "Zoho"],
    acceptance: 51,
    solvedSeed: false,
    exercise: {
      id: "kth-largest",
      title: "Kth Largest Element",
      difficulty: "Medium",
      points: 60,
      targetComplexity: "O(n log k)",
      statement: [
        "Return the k-th largest element in an unsorted array. This is the k-th largest by value, not the k-th distinct value.",
        "Sorting is O(n log n); a min-heap of size k gets you to O(n log k) and uses only O(k) memory.",
      ],
      constraints: ["1 ≤ k ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
      examples: [
        { input: "nums = [3,2,1,5,6,4], k = 2", output: "5" },
        { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["heap", "return"],
      starter: {
        python: `import heapq


def find_kth_largest(nums, k):
    """Return the k-th largest value in nums."""
    # TODO: keep a min-heap of the k largest values seen so far
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

int findKthLargest(vector<int>& nums, int k) {
    // TODO: keep a min-heap of the k largest values seen so far
    return 0;
}`,
        java: `import java.util.*;

class Solution {
    int findKthLargest(int[] nums, int k) {
        // TODO: keep a min-heap of the k largest values seen so far
        return 0;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "nums = [3,2,1,5,6,4], k = 2", expected: "5" },
        { id: "t2", name: "Duplicates count", input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", expected: "4" },
        { id: "t3", name: "k equals length", input: "nums = [7,6,5], k = 3", expected: "5" },
        { id: "t4", name: "10⁵ elements", input: "large input", expected: "accepted under 1.0s", hidden: true },
      ],
    },
  },
  {
    tags: ["Graph", "BFS"],
    companies: ["Google"],
    acceptance: 32,
    solvedSeed: false,
    exercise: {
      id: "word-ladder",
      title: "Word Ladder",
      difficulty: "Hard",
      points: 90,
      targetComplexity: "O(n · L · 26)",
      statement: [
        "Given `begin`, `end` and a word list, return the number of words in the shortest transformation sequence, changing one letter at a time. Every intermediate word must be in the list.",
        "Model it as an unweighted graph and run BFS from `begin` — the first time you reach `end`, you are on the shortest path.",
      ],
      constraints: ["1 ≤ word length ≤ 10", "1 ≤ wordList.length ≤ 5000", "Return 0 when no sequence exists"],
      examples: [
        { input: 'begin = "hit", end = "cog", list = ["hot","dot","dog","lot","log","cog"]', output: "5", note: "hit → hot → dot → dog → cog." },
        { input: 'begin = "hit", end = "cog", list = ["hot","dot","dog","lot","log"]', output: "0", note: "end is not in the list." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["queue", "while"],
      starter: {
        python: `from collections import deque


def ladder_length(begin, end, word_list):
    """Return the length of the shortest transformation sequence, or 0."""
    # TODO: BFS over words that differ by exactly one letter
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

int ladderLength(string begin, string end, vector<string>& wordList) {
    // TODO: BFS over words that differ by exactly one letter
    return 0;
}`,
        java: `import java.util.*;

class Solution {
    int ladderLength(String begin, String end, List<String> wordList) {
        // TODO: BFS over words that differ by exactly one letter
        return 0;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: 'hit → cog with cog in list', expected: "5" },
        { id: "t2", name: "Unreachable target", input: "cog missing from list", expected: "0" },
        { id: "t3", name: "Single step", input: 'hit → hot', expected: "2" },
        { id: "t4", name: "5000 words", input: "large word list", expected: "accepted under 2.0s", hidden: true },
      ],
    },
  },
  {
    tags: ["Binary Search", "Arrays"],
    companies: ["Apple", "Google"],
    acceptance: 28,
    solvedSeed: false,
    exercise: {
      id: "median-two-arrays",
      title: "Median of Two Sorted Arrays",
      difficulty: "Hard",
      points: 100,
      targetComplexity: "O(log(min(m, n)))",
      statement: [
        "Given two sorted arrays, return the median of the combined array without merging them.",
        "Binary search the partition point of the smaller array so that everything on the left is ≤ everything on the right.",
      ],
      constraints: ["0 ≤ m, n ≤ 1000", "m + n ≥ 1", "Merging is O(m + n) and will not pass the last case"],
      examples: [
        { input: "a = [1,3], b = [2]", output: "2.0" },
        { input: "a = [1,2], b = [3,4]", output: "2.5", note: "Even total length averages the middle pair." },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["while", "//"],
      starter: {
        python: `def find_median(a, b):
    """Return the median of two sorted arrays in logarithmic time."""
    # TODO: binary search the partition of the smaller array
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

double findMedian(vector<int>& a, vector<int>& b) {
    // TODO: binary search the partition of the smaller array
    return 0.0;
}`,
        java: `class Solution {
    double findMedian(int[] a, int[] b) {
        // TODO: binary search the partition of the smaller array
        return 0.0;
    }
}`,
      },
      tests: [
        { id: "t1", name: "Odd total length", input: "a = [1,3], b = [2]", expected: "2.0" },
        { id: "t2", name: "Even total length", input: "a = [1,2], b = [3,4]", expected: "2.5" },
        { id: "t3", name: "One array empty", input: "a = [], b = [1]", expected: "1.0" },
        { id: "t4", name: "Logarithmic time required", input: "1000 + 1000 elements", expected: "accepted, O(log n)", hidden: true },
      ],
    },
  },
];

export function getProblem(id: string) {
  return PRACTICE_PROBLEMS.find((p) => p.exercise.id === id);
}
