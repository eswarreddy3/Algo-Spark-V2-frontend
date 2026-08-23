import type { Week } from "../types";
import { upcoming } from "./shared";

export const OS_WEEKS: Week[] = [
  {
    n: 1,
    title: "Process Basics & System Calls",
    summary: "What a process is made of and how it asks the kernel for help.",
    objectives: [
      "Describe the segments of a process image and the fields of a PCB",
      "Trace a process through its five states",
      "Explain what fork() returns and to whom",
    ],
    points: 150,
    published: true,
    readingMinutes: 19,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 1 slides — Processes & System Calls", kind: "pdf", meta: "PDF · 2.0 MB" },
      { label: "Lab setup — running the sample C programs", kind: "link", meta: "Handout" },
    ],
    slides: [
      {
        title: "Program vs process",
        bullets: [
          "A program is a file on disk; a process is that program running",
          "One program can back many processes, each with its own memory",
          "The kernel tracks each process in a Process Control Block",
        ],
      },
      {
        title: "The process image",
        bullets: [
          "Text — the compiled instructions, read-only",
          "Data / BSS — globals, initialised and uninitialised",
          "Heap grows up from the data segment; stack grows down from the top",
        ],
      },
      {
        title: "Process states",
        bullets: [
          "New → Ready → Running → Waiting → Terminated",
          "Ready means runnable but not scheduled; Waiting means blocked on I/O",
          "Only one process per core is Running at any instant",
        ],
      },
      {
        title: "System calls",
        bullets: [
          "The controlled doorway from user mode into kernel mode",
          "fork() creates a child; exec() replaces the image; wait() reaps the child",
          "fork() returns 0 in the child and the child's PID in the parent",
        ],
        code: {
          language: "cpp",
          source: "pid_t pid = fork();\nif (pid == 0) {\n    // child\n    execlp(\"ls\", \"ls\", \"-l\", NULL);\n} else {\n    // parent\n    wait(NULL);\n}",
        },
      },
      {
        title: "Context switching",
        bullets: [
          "Save the registers and program counter into the PCB, load the next process's",
          "Pure overhead — no user work happens during the switch",
          "Cost rises with cache and TLB pollution, not just register copying",
        ],
        note: "Bring the fork/exec listing from the handout; the viva starts there.",
      },
    ],
    mcqs: [
      {
        id: "os1-1",
        q: "fork() returns which value in the child process?",
        opts: ["The child's PID", "0", "-1", "The parent's PID"],
        a: 1,
        explain: "The parent receives the child's PID; the child receives 0, which is how each knows who it is.",
      },
      {
        id: "os1-2",
        q: "A process blocked waiting for disk I/O is in which state?",
        opts: ["Ready", "Running", "Waiting", "Terminated"],
        a: 2,
        explain: "It cannot use the CPU until the I/O completes, so it leaves the ready queue.",
      },
      {
        id: "os1-3",
        q: "Which segment holds dynamically allocated memory?",
        opts: ["Text", "Heap", "Stack", "BSS"],
        a: 1,
        explain: "malloc / new carve memory out of the heap, which grows upward.",
      },
      {
        id: "os1-4",
        q: "A context switch is considered:",
        opts: ["Useful work", "Pure overhead", "An I/O operation", "A system call made by the user"],
        a: 1,
        explain: "No user instructions execute while the kernel saves and restores state.",
      },
    ],
    exercise: {
      id: "os1-table",
      title: "Process Table Summary",
      difficulty: "Easy",
      points: 50,
      targetComplexity: "O(n)",
      statement: [
        "You are given a snapshot of the process table: a list of (pid, state, burst) records.",
        "Return the total burst time of all READY processes and the pid with the largest burst among them. If no process is READY, return (0, -1).",
      ],
      constraints: ["1 ≤ processes ≤ 10⁴", "state is one of READY, RUNNING, WAITING", "Ties go to the smaller pid"],
      examples: [
        {
          input: "[(1,'READY',5), (2,'WAITING',9), (3,'READY',7)]",
          output: "(12, 3)",
          note: "5 + 7 = 12, and pid 3 has the larger burst.",
        },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["for", "return"],
      starter: {
        python: `def ready_summary(processes):
    """processes: list of (pid, state, burst). Return (total_burst, max_pid)."""
    # TODO: scan once, summing READY bursts and tracking the largest
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

struct Proc { int pid; string state; int burst; };

pair<int,int> readySummary(vector<Proc>& processes) {
    // TODO: scan once, summing READY bursts and tracking the largest
    return {0, -1};
}`,
        java: `class Solution {
    int[] readySummary(int[] pids, String[] states, int[] bursts) {
        // TODO: scan once, summing READY bursts and tracking the largest
        return new int[]{0, -1};
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "[(1,READY,5),(2,WAITING,9),(3,READY,7)]", expected: "(12, 3)" },
        { id: "t2", name: "No ready processes", input: "[(1,WAITING,4)]", expected: "(0, -1)" },
        { id: "t3", name: "Single ready process", input: "[(4,READY,8)]", expected: "(8, 4)" },
        { id: "t4", name: "Tie on burst", input: "[(7,READY,6),(2,READY,6)]", expected: "(12, 2)", hidden: true },
      ],
    },
  },

  {
    n: 2,
    title: "Process Scheduling",
    summary: "FCFS, SJF and round robin — and the numbers that separate them.",
    objectives: [
      "Compute waiting and turnaround time for a given schedule",
      "Draw the Gantt chart for FCFS, SJF and round robin",
      "Explain starvation and how round robin avoids it",
    ],
    points: 150,
    published: true,
    readingMinutes: 21,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 2 slides — CPU Scheduling", kind: "pdf", meta: "PDF · 2.4 MB" },
      { label: "Recorded lecture — Gantt charts worked through", kind: "video", meta: "Video · 24:10" },
    ],
    slides: [
      {
        title: "The scheduling question",
        bullets: [
          "Many ready processes, one CPU — who runs next?",
          "Metrics: waiting time, turnaround time, response time, throughput",
          "Turnaround = completion − arrival; waiting = turnaround − burst",
        ],
      },
      {
        title: "First Come First Served",
        bullets: [
          "Non-preemptive, trivially fair in arrival order",
          "One long job at the front delays everyone — the convoy effect",
          "Simple to implement with a plain queue",
        ],
      },
      {
        title: "Shortest Job First",
        bullets: [
          "Provably optimal average waiting time",
          "Requires knowing burst lengths, which you rarely do",
          "Long jobs can starve when short ones keep arriving",
        ],
      },
      {
        title: "Round Robin",
        bullets: [
          "Each process gets one time quantum, then goes to the back of the queue",
          "Preemptive and starvation-free; response time is bounded",
          "Quantum too small → context-switch overhead dominates; too large → it becomes FCFS",
        ],
        code: {
          language: "python",
          source: "while queue:\n    p = queue.popleft()\n    slice_ = min(quantum, p.remaining)\n    clock += slice_\n    p.remaining -= slice_\n    if p.remaining:\n        queue.append(p)   # back of the line\n    else:\n        p.completion = clock",
        },
      },
      {
        title: "Priority scheduling",
        bullets: [
          "Run the highest priority ready process",
          "Low-priority work can starve indefinitely",
          "Ageing raises priority with waiting time to fix that",
        ],
        note: "The exercise implements round robin; the exam asks you to compare its averages with SJF.",
      },
    ],
    mcqs: [
      {
        id: "os2-1",
        q: "Which algorithm gives the minimum average waiting time?",
        opts: ["FCFS", "Shortest Job First", "Round Robin", "Priority with ageing"],
        a: 1,
        explain: "SJF is provably optimal — its drawback is needing the burst lengths in advance.",
      },
      {
        id: "os2-2",
        q: "Round robin with a very large quantum behaves like:",
        opts: ["SJF", "FCFS", "Priority", "Multilevel queue"],
        a: 1,
        explain: "If the quantum exceeds every burst, no preemption ever happens.",
      },
      {
        id: "os2-3",
        q: "Turnaround time is:",
        opts: [
          "Completion − arrival",
          "Completion − burst",
          "Waiting + arrival",
          "Burst − waiting",
        ],
        a: 0,
        explain: "It measures the total time the process spent in the system.",
      },
      {
        id: "os2-4",
        q: "Starvation in priority scheduling is addressed by:",
        opts: ["Larger quanta", "Ageing", "Disabling preemption", "Shorter bursts"],
        a: 1,
        explain: "Ageing gradually raises the priority of long-waiting processes.",
      },
    ],
    exercise: {
      id: "os2-rr",
      title: "Round Robin Completion Times",
      difficulty: "Medium",
      points: 60,
      targetComplexity: "O(total burst / quantum)",
      statement: [
        "Given burst times for processes that all arrive at time 0, simulate round-robin scheduling with the given quantum and return each process's completion time in input order.",
        "Processes are served in index order; a process that still has work left rejoins the back of the queue.",
      ],
      constraints: ["1 ≤ processes ≤ 10³", "1 ≤ burst ≤ 10⁴", "1 ≤ quantum ≤ 10³"],
      examples: [
        { input: "bursts = [5, 3, 1], quantum = 2", output: "[9, 8, 5]" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["while", "quantum"],
      starter: {
        python: `from collections import deque


def round_robin(bursts, quantum):
    """Return the completion time of each process, in input order."""
    # TODO: keep a queue of (index, remaining) and advance a clock
    pass`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

vector<int> roundRobin(vector<int>& bursts, int quantum) {
    // TODO: keep a queue of (index, remaining) and advance a clock
    return {};
}`,
        java: `import java.util.*;

class Solution {
    int[] roundRobin(int[] bursts, int quantum) {
        // TODO: keep a queue of (index, remaining) and advance a clock
        return new int[0];
    }
}`,
      },
      tests: [
        { id: "t1", name: "Sample", input: "bursts = [5,3,1], quantum = 2", expected: "[9, 8, 5]" },
        { id: "t2", name: "Quantum larger than every burst", input: "bursts = [2,1], quantum = 5", expected: "[2, 3]" },
        { id: "t3", name: "Single process", input: "bursts = [7], quantum = 3", expected: "[7]" },
        { id: "t4", name: "1000 processes", input: "large input", expected: "accepted under 1.0s", hidden: true },
      ],
    },
  },

  {
    n: 3,
    title: "Threads & Synchronization",
    summary: "Shared memory, race conditions and the critical section.",
    objectives: [
      "Distinguish a thread from a process in terms of what is shared",
      "Reproduce a race condition and fix it with a mutex",
      "State the three requirements of a correct critical-section solution",
    ],
    points: 150,
    published: true,
    readingMinutes: 20,
    mcqPassRatio: 0.6,
    resources: [
      { label: "Week 3 slides — Threads & Synchronization", kind: "pdf", meta: "PDF · 2.1 MB" },
      { label: "Sample code — racing counters", kind: "link", meta: "Repository" },
    ],
    slides: [
      {
        title: "Threads share, processes do not",
        bullets: [
          "Threads of one process share text, data and heap",
          "Each thread keeps its own stack, registers and program counter",
          "Sharing is what makes threads fast and what makes them dangerous",
        ],
      },
      {
        title: "Race conditions",
        bullets: [
          "counter++ is read, add, write — three steps, interruptible between any two",
          "Two threads interleaving those steps lose an increment",
          "The bug is timing-dependent, so it hides in testing",
        ],
      },
      {
        title: "Critical sections",
        bullets: [
          "Mutual exclusion — at most one thread inside",
          "Progress — a thread outside must not block one that wants in",
          "Bounded waiting — no thread waits forever",
        ],
        code: {
          language: "cpp",
          source: "mutex m;\n\nvoid increment() {\n    lock_guard<mutex> guard(m);  // acquire\n    counter++;                   // critical section\n}                                // released on scope exit",
        },
      },
      {
        title: "Mutexes and semaphores",
        bullets: [
          "Mutex — binary lock with an owner; only the owner unlocks",
          "Counting semaphore — permits for N interchangeable resources",
          "wait() / signal() are the classic operations",
        ],
      },
      {
        title: "Classic problems",
        bullets: [
          "Producer–consumer with a bounded buffer",
          "Readers–writers, where readers may share but writers may not",
          "Dining philosophers, the standard deadlock demonstration (next week)",
        ],
        note: "The exercise asks for the safe increment; the viva asks why volatile alone does not fix it.",
      },
    ],
    mcqs: [
      {
        id: "os3-1",
        q: "Threads of the same process share:",
        opts: ["Their stacks", "The heap and global data", "Their registers", "Nothing"],
        a: 1,
        explain: "Shared heap and globals are the point of threads; stacks and registers stay private.",
      },
      {
        id: "os3-2",
        q: "counter++ from two threads can lose an update because it is:",
        opts: ["Atomic", "A read-modify-write sequence", "A system call", "Cached"],
        a: 1,
        explain: "The three steps can interleave, so both threads write back the same value.",
      },
      {
        id: "os3-3",
        q: "Which is NOT a requirement of a critical-section solution?",
        opts: ["Mutual exclusion", "Progress", "Bounded waiting", "Fair CPU scheduling"],
        a: 3,
        explain: "Scheduling fairness is a separate concern from correctness of the critical section.",
      },
      {
        id: "os3-4",
        q: "A counting semaphore initialised to 3 allows:",
        opts: ["One thread in", "Three threads in", "Unlimited threads", "No threads"],
        a: 1,
        explain: "It hands out three permits before the next wait() blocks.",
      },
    ],
    exercise: {
      id: "os3-safe-counter",
      title: "Safe Shared Counter",
      difficulty: "Medium",
      points: 60,
      statement: [
        "The harness starts eight threads, each incrementing a shared counter 100000 times. The starter code races and loses updates.",
        "Guard the increment so the final value is exactly 800000, and keep the lock as small as possible — locking the whole loop passes correctness but fails the contention check.",
      ],
      constraints: ["8 threads × 100000 increments", "Final value must be exact", "Hold the lock only around the shared write"],
      examples: [
        { input: "8 threads, 100000 increments each", output: "800000" },
      ],
      languages: ["python", "cpp", "java"],
      signals: ["lock", "counter"],
      starter: {
        python: `import threading

counter = 0


def worker(n):
    global counter
    for _ in range(n):
        # TODO: make this increment safe under concurrency
        counter += 1`,
        cpp: `#include <bits/stdc++.h>
using namespace std;

long long counter = 0;

void worker(int n) {
    for (int i = 0; i < n; ++i) {
        // TODO: make this increment safe under concurrency
        counter++;
    }
}`,
        java: `class Counter {
    static long counter = 0;

    static void worker(int n) {
        for (int i = 0; i < n; i++) {
            // TODO: make this increment safe under concurrency
            counter++;
        }
    }
}`,
      },
      tests: [
        { id: "t1", name: "Exact total", input: "8 threads × 100000", expected: "800000" },
        { id: "t2", name: "Repeat run is stable", input: "same input, 20 runs", expected: "800000 every time" },
        { id: "t3", name: "Lock scope", input: "contention profile", expected: "lock held only around the write" },
        { id: "t4", name: "No deadlock", input: "threads joined", expected: "process exits cleanly", hidden: true },
      ],
    },
  },

  upcoming(4, "Deadlocks", "Coffman conditions, detection, avoidance and the banker's algorithm.", "26 Aug 2026", [
    "State the four Coffman conditions and break one of them",
    "Run the banker's algorithm on a resource table",
  ]),
  upcoming(5, "Memory Management", "Contiguous allocation, fragmentation and compaction.", "2 Sep 2026", [
    "Compare first-fit, best-fit and worst-fit allocation",
    "Distinguish internal from external fragmentation",
  ]),
  upcoming(6, "Paging & Virtual Memory", "Page tables, TLBs and replacement policies.", "9 Sep 2026", [
    "Translate a virtual address by hand",
    "Simulate FIFO, LRU and optimal page replacement",
  ]),
  upcoming(7, "File Systems", "Inodes, directories and allocation strategies.", "16 Sep 2026", [
    "Compare contiguous, linked and indexed allocation",
    "Explain what an inode stores",
  ]),
  upcoming(8, "Disk Scheduling", "Seek time and the algorithms that reduce it.", "23 Sep 2026", [
    "Compute total head movement for FCFS, SSTF, SCAN and C-SCAN",
  ]),
  upcoming(9, "Shell Scripting", "Automating the lab machine.", "30 Sep 2026", [
    "Write a script with arguments, conditionals and loops",
    "Chain commands with pipes and redirection",
  ]),
  upcoming(10, "Mini Project", "A small systems utility, built and demonstrated.", "7 Oct 2026", [
    "Deliver a working utility with a short design note",
  ]),
];
