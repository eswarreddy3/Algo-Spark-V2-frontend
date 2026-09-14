import { C } from "../../theme/tokens";
import type { EmailPrompt } from "./emailFeedback";
import type { Mcq, Slide } from "../labs/types";
import type { Course, MaterialFormat, Topic } from "./courses";

export const EMAIL_PROMPTS: EmailPrompt[] = [
  {
    id: "interview-status",
    title: "Follow up on an interview",
    brief:
      "You interviewed with Zentra Systems for a Software Engineer role on 12 August and have not heard back. Write to the recruiter, Nisha Menon, asking for an update.",
    mustMention: ["Zentra", "Software Engineer", "12 August"],
    idealWords: [70, 150],
    model: `Subject: Following up — Software Engineer interview, 12 August

Dear Ms. Menon,

I interviewed for the Software Engineer role at Zentra Systems on 12 August and wanted to follow up on the outcome. The conversation about your payments platform was genuinely interesting, and I remain keen to join the team.

Could you share where my application currently stands, and when I might expect a decision? I am happy to provide any further information you need.

Thank you for your time.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
  {
    id: "internship-request",
    title: "Request an internship referral",
    brief:
      "Write to a senior alumnus, Rahul Verma, asking for a referral for the summer internship programme at his company, Northwind Labs. Mention your Data Structures coursework.",
    mustMention: ["Northwind", "internship", "referral"],
    idealWords: [80, 160],
    model: `Subject: Referral request — Northwind Labs summer internship

Dear Rahul,

I am a third-year CSE student at our college and I am applying to the summer internship programme at Northwind Labs. Having finished the Data Structures lab with a focus on graph and dynamic-programming problems, I believe I would contribute quickly to your backend team.

Would you be willing to refer me? I have attached my resume and can share my project repository if that helps.

Thank you for considering it.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
  {
    id: "deadline-extension",
    title: "Ask for a deadline extension",
    brief:
      "Write to your faculty, Dr. Meera Raghavan, requesting a two-day extension on the Week 6 lab submission because of a college hackathon. Offer a concrete new date.",
    mustMention: ["Week 6", "extension", "hackathon"],
    idealWords: [60, 130],
    model: `Subject: Request for a two-day extension — Week 6 lab submission

Respected Ma'am,

I am representing the college at the inter-college hackathon on 22 and 23 August, which overlaps with the Week 6 lab submission deadline.

Could I request a two-day extension, submitting by 25 August instead? The theory and MCQ components are already complete; only the coding task remains.

Thank you for considering my request.

Best regards,
Aditya Kumar
CSE-A · Roll 21CS042`,
  },
];

export type ReadingQuestion = { id: string; q: string; opts: string[]; a: number; explain: string };

export type Passage = {
  id: string;
  title: string;
  minutes: number;
  words: number;
  text: string[];
  questions: ReadingQuestion[];
  /** Ideas a good summary should capture; each lists words that signal it. The AI grader checks coverage. */
  keyIdeas: { idea: string; signals: string[] }[];
};

export const PASSAGES: Passage[] = [
  {
    id: "spaced-repetition",
    title: "How spaced repetition works",
    keyIdeas: [
      { idea: "Reviews are spaced at increasing intervals", signals: ["interval", "spaced", "increasing", "over time"] },
      { idea: "Reviewing just before forgetting strengthens memory", signals: ["forget", "recall", "memory", "retention"] },
      { idea: "Ebbinghaus's forgetting curve", signals: ["ebbinghaus", "forgetting curve", "curve"] },
      { idea: "Software focuses time on weak material", signals: ["software", "flashcard", "weak", "shaky", "efficient"] },
    ],
    minutes: 3,
    words: 168,
    text: [
      "Spaced repetition is a learning technique in which material is reviewed at increasing intervals. Rather than cramming the night before an exam, learners revisit a concept just as they are about to forget it — the point at which recall takes effort and therefore strengthens memory.",
      "The effect was first measured by Hermann Ebbinghaus in the 1880s. His forgetting curve showed that recall drops sharply within days of learning something new, but that each successful review flattens the curve, so the next review can be scheduled further out.",
      "Modern flashcard software automates the scheduling. A card answered easily is pushed weeks ahead; a card answered wrongly returns within minutes. The learner spends most of their time on the small fraction of material that is actually shaky, which is what makes the method efficient rather than merely thorough.",
    ],
    questions: [
      {
        id: "sr-1",
        q: "According to the passage, what is the main benefit of spaced repetition?",
        opts: ["It is faster to set up", "It improves long-term retention", "It removes the need for practice", "It replaces exams"],
        a: 1,
        explain: "Reviewing just before forgetting is what strengthens memory and flattens the forgetting curve.",
      },
      {
        id: "sr-2",
        q: "What did Ebbinghaus's forgetting curve demonstrate?",
        opts: [
          "Recall improves without review",
          "Recall drops sharply soon after learning",
          "Cramming outperforms review",
          "Memory is unrelated to time",
        ],
        a: 1,
        explain: "The curve showed a sharp drop within days, which each review then flattens.",
      },
      {
        id: "sr-3",
        q: "Why is the method described as efficient rather than merely thorough?",
        opts: [
          "It reviews everything equally often",
          "It concentrates time on the material the learner is shaky on",
          "It shortens every study session",
          "It avoids difficult topics",
        ],
        a: 1,
        explain: "Easy cards are pushed far ahead, so most study time lands on weak material.",
      },
    ],
  },
  {
    id: "code-review",
    title: "Why teams review code",
    keyIdeas: [
      { idea: "A second engineer reads a change before merge", signals: ["review", "second", "before", "merge", "read"] },
      { idea: "Bug-catching is real but not the main value", signals: ["bug", "defect"] },
      { idea: "Reviews spread shared understanding", signals: ["knowledge", "understanding", "shared", "spread", "learn"] },
      { idea: "Reviews push teams toward smaller changes", signals: ["small", "smaller", "size", "shrink", "large"] },
    ],
    minutes: 3,
    words: 154,
    text: [
      "Code review is the practice of having a second engineer read a change before it is merged. Teams adopt it expecting to catch bugs, and it does catch some — but studies of industrial projects consistently find that defect detection is not where most of the value sits.",
      "The larger effect is on shared understanding. A reviewer who reads a change learns the part of the system it touches, which spreads knowledge that would otherwise stay with one author. When that author leaves, or is simply on holiday, someone else can work in the same code.",
      "Reviews also apply quiet pressure toward smaller changes. A four-line change is read carefully; a four-hundred-line change is skimmed and approved. Teams that measure review quality usually end up shrinking their changes rather than lengthening their reviews.",
    ],
    questions: [
      {
        id: "cr-1",
        q: "What does the passage identify as the larger benefit of code review?",
        opts: ["Catching every bug", "Spreading understanding of the system", "Reducing meetings", "Enforcing style rules"],
        a: 1,
        explain: "The passage says defect detection is real but secondary to shared understanding.",
      },
      {
        id: "cr-2",
        q: "What happens to very large changes, according to the passage?",
        opts: ["They are rejected", "They are skimmed and approved", "They are split automatically", "They are reviewed twice"],
        a: 1,
        explain: "Four-hundred-line changes get skimmed, which is why teams shrink their changes.",
      },
      {
        id: "cr-3",
        q: "What do teams that measure review quality tend to do?",
        opts: ["Lengthen reviews", "Shrink their changes", "Add more reviewers", "Skip reviews for small fixes"],
        a: 1,
        explain: "The last line states they shrink changes rather than lengthen reviews.",
      },
    ],
  },
];

/** Non-tech topics have material and MCQs; there are no coding questions. */
function topic(
  id: string,
  title: string,
  summary: string,
  format: MaterialFormat,
  minutes: number,
  objectives: string[],
  slides: Slide[],
  mcqs: Mcq[],
): Topic {
  return {
    id, title, summary, objectives, minutes, points: 50,
    material: { format, slides, resources: [{ label: `${title} — practice sheet`, kind: "pdf", meta: "PDF · worksheet" }] },
    mcqs, mcqPassRatio: 0.6, exercises: [],
  };
}

export const COURSES: Course[] = [
  {
    id: "aptitude",
    scope: "nontech",
    title: "Aptitude Foundations",
    blurb: "Percentages, ratios, time-and-work and the shortcuts that fit in 60 seconds.",
    accent: C.royal,
    level: "Beginner",
    instructor: "Kavya Iyer",
    completedSeed: 2,
    sections: [
      {
        id: "apt-numbers",
        title: "Numbers & Percentages",
        topics: [
          topic("apt-percent", "Percentages", "Percent change, successive changes and the base trap.", "ppt", 20,
            ["Convert fractions and percentages quickly", "Chain successive percentage changes", "Pick the right base for a change"],
            [
              { title: "Percent means per hundred", bullets: ["x% of y = x × y / 100", "Memorise 1/8 = 12.5%, 1/6 ≈ 16.67%, 1/12 ≈ 8.33%", "Percent change = (new − old) / old × 100"] },
              { title: "Successive changes", bullets: ["Two changes a% and b%: net = a + b + ab/100", "+20% then −20% is a net −4%, not zero"] },
              { title: "The base trap", bullets: ["A is 25% more than B ⇒ B is 20% less than A", "Always divide by the value you compare against"], note: "Three of the four quiz questions test the base trap." },
            ],
            [
              { id: "ap1-1", q: "A price rises 20% and then falls 20%. Net change?", opts: ["0%", "−4%", "+4%", "−2%"], a: 1, explain: "20 − 20 + (20 × −20)/100 = −4." },
              { id: "ap1-2", q: "A is 25% more than B. B is what percent less than A?", opts: ["25%", "20%", "15%", "30%"], a: 1, explain: "25 / 125 = 20%." },
              { id: "ap1-3", q: "What is 12.5% of 640?", opts: ["64", "80", "72", "96"], a: 1, explain: "12.5% = 1/8, and 640 / 8 = 80." },
            ]),
          topic("apt-ratio", "Ratio & Proportion", "Splitting quantities and combining ratios without algebra.", "pdf", 18,
            ["Split a total in a given ratio", "Combine two ratios with a common term"],
            [
              { title: "Splitting a total", bullets: ["Ratio a:b of total T ⇒ parts aT/(a+b) and bT/(a+b)", "Add the ratio terms first, then scale"] },
              { title: "Combining ratios", bullets: ["A:B = 2:3 and B:C = 4:5", "Make B common: 8:12 and 12:15", "So A:B:C = 8:12:15"] },
            ],
            [
              { id: "ap2-1", q: "Split 360 in the ratio 4:5. The larger part is:", opts: ["160", "200", "180", "220"], a: 1, explain: "360 × 5/9 = 200." },
              { id: "ap2-2", q: "A:B = 2:3 and B:C = 4:5. A:C = ?", opts: ["8:15", "2:5", "4:9", "10:12"], a: 0, explain: "A:B:C = 8:12:15, so A:C = 8:15." },
              { id: "ap2-3", q: "If 6 pens cost ₹90, 10 pens cost:", opts: ["₹140", "₹150", "₹160", "₹135"], a: 1, explain: "₹15 each, so ₹150." },
            ]),
        ],
      },
      {
        id: "apt-work",
        title: "Time, Speed & Work",
        topics: [
          topic("apt-tsd", "Time, Speed & Distance", "Relative speed, trains and average speed.", "web", 22,
            ["Use relative speed for trains and chases", "Compute average speed correctly"],
            [
              { title: "The core relation", bullets: ["Distance = Speed × Time", "km/h to m/s: multiply by 5/18"] },
              { title: "Relative speed", bullets: ["Same direction: subtract speeds", "Opposite directions: add speeds", "A train crossing a pole covers its own length"] },
              { title: "Average speed", bullets: ["Total distance ÷ total time — never the mean of speeds", "Equal distances at x and y ⇒ 2xy / (x + y)"] },
            ],
            [
              { id: "ap3-1", q: "72 km/h in m/s is:", opts: ["15", "20", "25", "18"], a: 1, explain: "72 × 5/18 = 20." },
              { id: "ap3-2", q: "Equal distances at 40 and 60 km/h. Average speed?", opts: ["50", "48", "45", "52"], a: 1, explain: "2 × 40 × 60 / 100 = 48." },
              { id: "ap3-3", q: "Two trains at 50 and 70 km/h approach each other. Relative speed?", opts: ["20", "120", "60", "35"], a: 1, explain: "Opposite directions add: 120 km/h." },
            ]),
          topic("apt-work-rate", "Time & Work", "Work rates, pipes and cisterns using the LCM method.", "ppt", 20,
            ["Solve combined-work problems with the LCM method", "Treat leaks as negative work"],
            [
              { title: "The LCM method", bullets: ["Take total work = LCM of the days", "Each worker's rate = total ÷ their days", "Add rates for people working together"] },
              { title: "Pipes and leaks", bullets: ["A filling pipe adds work; a leak subtracts it", "Net rate = sum of fills − sum of leaks"] },
            ],
            [
              { id: "ap4-1", q: "A does a job in 10 days, B in 15. Together?", opts: ["5", "6", "7.5", "12.5"], a: 1, explain: "Total 30 units; rates 3 + 2 = 5 per day, so 6 days." },
              { id: "ap4-2", q: "A pipe fills a tank in 6 h; a leak empties it in 12 h. Net time to fill?", opts: ["8 h", "12 h", "9 h", "18 h"], a: 1, explain: "Rates 2 − 1 = 1 unit/h on 12 units: 12 h." },
              { id: "ap4-3", q: "In the LCM method, total work is usually taken as:", opts: ["1", "The LCM of the days", "The sum of the days", "100"], a: 1, explain: "It keeps every rate a whole number." },
            ]),
        ],
      },
    ],
  },
  {
    id: "verbal",
    scope: "nontech",
    title: "Verbal Ability",
    blurb: "Sentence correction, para-jumbles and vocabulary that shows up in aptitude rounds.",
    accent: C.cyan,
    level: "Beginner",
    instructor: "Ananya Rao",
    completedSeed: 1,
    sections: [
      {
        id: "verb-grammar",
        title: "Grammar",
        topics: [
          topic("verb-sva", "Subject–Verb Agreement", "The five agreement rules that decide most correction questions.", "ppt", 15,
            ["Match verbs to tricky subjects", "Handle either/or and neither/nor"],
            [
              { title: "Find the real subject", bullets: ["Ignore phrases between subject and verb", "“The list of items is on the desk” — list is singular"] },
              { title: "Either / neither", bullets: ["With or / nor, the verb agrees with the nearer subject", "“Neither the manager nor the interns were told”"] },
              { title: "Collective nouns", bullets: ["Team, jury, committee are usually singular", "Each, every, everyone take a singular verb"] },
            ],
            [
              { id: "vb1-1", q: "The box of chocolates ___ on the table.", opts: ["are", "is", "were", "have been"], a: 1, explain: "The subject is box, which is singular." },
              { id: "vb1-2", q: "Neither the teacher nor the students ___ ready.", opts: ["was", "were", "is", "has"], a: 1, explain: "The verb agrees with the nearer subject, students." },
              { id: "vb1-3", q: "Everyone in the teams ___ a badge.", opts: ["get", "gets", "are getting", "have"], a: 1, explain: "Everyone takes a singular verb." },
            ]),
          topic("verb-correction", "Sentence Correction", "A four-step scan for spotting the error fast.", "web", 18,
            ["Scan a sentence for the common error types", "Eliminate options in order"],
            [
              { title: "The four-step scan", bullets: ["1. Subject–verb agreement", "2. Tense consistency", "3. Pronoun reference", "4. Modifier placement"] },
              { title: "Modifiers", bullets: ["A modifier sits next to what it describes", "“Walking home, the rain started” — the rain was not walking"] },
            ],
            [
              { id: "vb2-1", q: "Which sentence has a dangling modifier?", opts: ["Walking home, I saw a fox.", "Walking home, the rain began.", "I walked home in the rain.", "The rain began as I walked home."], a: 1, explain: "The rain cannot be the one walking home." },
              { id: "vb2-2", q: "“She said she will come yesterday.” The error is in:", opts: ["Pronoun", "Tense", "Article", "Preposition"], a: 1, explain: "Reported speech about the past needs “would come”." },
              { id: "vb2-3", q: "Check first in the scan:", opts: ["Articles", "Subject–verb agreement", "Punctuation", "Spelling"], a: 1, explain: "Agreement errors are the most frequent in placement tests." },
            ]),
        ],
      },
      {
        id: "verb-reading",
        title: "Reading",
        topics: [
          topic("verb-parajumble", "Para-jumbles", "Opening sentences, link words and pairs that must stay together.", "pdf", 16,
            ["Find the opening sentence", "Use pronouns and link words to fix pairs"],
            [
              { title: "The opener", bullets: ["Introduces a subject without pronouns referring back", "Rarely starts with however, this or it"] },
              { title: "Mandatory pairs", bullets: ["A pronoun follows the sentence naming its noun", "However / therefore follow the idea they respond to"] },
            ],
            [
              { id: "vb3-1", q: "A good opening sentence usually:", opts: ["Starts with “However”", "Introduces the subject", "Uses “it” to refer back", "Gives the conclusion"], a: 1, explain: "Openers set up the topic without referring to earlier text." },
              { id: "vb3-2", q: "A sentence starting with “This approach” must come:", opts: ["First", "After the approach is described", "Last", "Anywhere"], a: 1, explain: "The pronoun needs its noun earlier." },
              { id: "vb3-3", q: "Link words like “therefore” signal:", opts: ["A new topic", "A consequence of the previous idea", "A contrast", "An example"], a: 1, explain: "Therefore follows the reason it concludes from." },
            ]),
        ],
      },
    ],
  },
  {
    id: "logical",
    scope: "nontech",
    title: "Logical Reasoning",
    blurb: "Seating arrangements, syllogisms and puzzle patterns that repeat across companies.",
    accent: C.violet,
    level: "Intermediate",
    instructor: "Kavya Iyer",
    completedSeed: 0,
    sections: [
      {
        id: "log-deduction",
        title: "Deduction",
        topics: [
          topic("log-syllogism", "Syllogisms", "Venn diagrams for all, some and no statements.", "ppt", 20,
            ["Draw the minimal Venn diagram for each statement", "Tell definite conclusions from possible ones"],
            [
              { title: "Three statement types", bullets: ["All A are B — A inside B", "Some A are B — circles overlap", "No A are B — circles apart"] },
              { title: "Definite vs possible", bullets: ["A conclusion follows only if it holds in every diagram", "“Some” never gives you “all”"] },
            ],
            [
              { id: "lg1-1", q: "All cats are animals. Some animals are pets. Conclusion: some cats are pets.", opts: ["Follows", "Does not follow", "Only if all pets are cats", "Cannot be drawn"], a: 1, explain: "The pets may overlap only with non-cat animals." },
              { id: "lg1-2", q: "No A is B. All C are A. Then:", opts: ["Some C are B", "No C is B", "All B are C", "Some B are A"], a: 1, explain: "C sits inside A, which is disjoint from B." },
              { id: "lg1-3", q: "“Some A are B” is drawn as:", opts: ["A inside B", "Overlapping circles", "Separate circles", "B inside A"], a: 1, explain: "Overlap is the minimal case for some." },
            ]),
          topic("log-blood", "Blood Relations", "Family-tree notation that turns word puzzles into diagrams.", "web", 15,
            ["Draw a family tree with gender and generation", "Decode “pointing to a photograph” questions"],
            [
              { title: "Notation", bullets: ["Square for male, circle for female", "Horizontal line for spouses, vertical for generations"] },
              { title: "Photograph questions", bullets: ["Start from the speaker, not the photo", "“My father's only son” is the speaker, if male"] },
            ],
            [
              { id: "lg2-1", q: "Pointing to a man, Ravi says “His mother is my mother's only daughter.” The man is Ravi's:", opts: ["Brother", "Nephew", "Son", "Cousin"], a: 1, explain: "Mother's only daughter is Ravi's sister, so the man is her son." },
              { id: "lg2-2", q: "A's father is B's son. B is A's:", opts: ["Father", "Grandparent", "Uncle", "Brother"], a: 1, explain: "B is the parent of A's father." },
              { id: "lg2-3", q: "In a family tree, a vertical line shows:", opts: ["Marriage", "A generation step", "Siblings", "Gender"], a: 1, explain: "Vertical lines connect parents and children." },
            ]),
        ],
      },
      {
        id: "log-puzzles",
        title: "Puzzles",
        topics: [
          topic("log-seating", "Seating Arrangements", "Linear and circular seating with a fixed anchor.", "pdf", 25,
            ["Fix an anchor before placing anyone else", "Handle facing-centre versus facing-out circles"],
            [
              { title: "Start with certainty", bullets: ["Place definite clues first", "Branch into cases only when forced"] },
              { title: "Circles", bullets: ["Facing the centre: left is clockwise", "Facing outward: left and right swap"] },
            ],
            [
              { id: "lg3-1", q: "In a circle facing the centre, a person's left is:", opts: ["Anticlockwise", "Clockwise", "Opposite", "Undefined"], a: 1, explain: "Facing the centre, your left runs clockwise." },
              { id: "lg3-2", q: "The first clue to place is usually:", opts: ["The longest", "The definite one", "The last one", "A negative clue"], a: 1, explain: "Definite placements cut the case count." },
              { id: "lg3-3", q: "Six people in a row: A is third from the left. From the right A is:", opts: ["Third", "Fourth", "Second", "Fifth"], a: 1, explain: "6 − 3 + 1 = 4." },
            ]),
        ],
      },
    ],
  },
  {
    id: "interview",
    scope: "nontech",
    title: "Interview Skills",
    blurb: "Tell-me-about-yourself, project deep-dives and the questions to ask back.",
    accent: C.goldDeep,
    level: "Beginner",
    instructor: "Nisha Menon",
    completedSeed: 0,
    sections: [
      {
        id: "int-intro",
        title: "Introducing Yourself",
        topics: [
          topic("int-tmay", "Tell Me About Yourself", "A 90-second answer built as present, past, future.", "ppt", 14,
            ["Structure the answer as present, past, future", "Cut anything the role does not need"],
            [
              { title: "Present · Past · Future", bullets: ["Present: who you are and what you study", "Past: one or two achievements with numbers", "Future: why this role, at this company"] },
              { title: "What to leave out", bullets: ["Your full résumé read aloud", "Hobbies unless they connect to the role", "Anything longer than 90 seconds"] },
            ],
            [
              { id: "iv1-1", q: "The best order for the answer is:", opts: ["Hobbies, family, goals", "Present, past, future", "Marks, projects, salary", "Future, past, present"], a: 1, explain: "It leads with relevance and ends on fit." },
              { id: "iv1-2", q: "An ideal length is about:", opts: ["15 seconds", "90 seconds", "5 minutes", "As long as needed"], a: 1, explain: "Long enough for substance, short enough to invite questions." },
              { id: "iv1-3", q: "Which detail strengthens the past section?", opts: ["“I worked hard”", "“Cut API latency by 40% in my internship”", "“I like coding”", "“My CGPA is good”"], a: 1, explain: "Specific, measured outcomes are memorable." },
            ]),
        ],
      },
      {
        id: "int-behavioural",
        title: "Behavioural Rounds",
        topics: [
          topic("int-star", "The STAR Method", "Situation, task, action, result — with the weight on action.", "web", 16,
            ["Answer behavioural questions with STAR", "Spend most of the answer on your own actions"],
            [
              { title: "STAR", bullets: ["Situation — the context in one line", "Task — what you were responsible for", "Action — what you did (the bulk)", "Result — the outcome, with a number"] },
              { title: "Common mistakes", bullets: ["Saying “we” for everything", "No result, or a result without evidence"] },
            ],
            [
              { id: "iv2-1", q: "Which STAR part deserves the most time?", opts: ["Situation", "Task", "Action", "Result"], a: 2, explain: "Interviewers are assessing what you did." },
              { id: "iv2-2", q: "Saying “we” throughout mainly hides:", opts: ["The team size", "Your own contribution", "The deadline", "The result"], a: 1, explain: "Use “I” for your actions." },
              { id: "iv2-3", q: "A strong result is:", opts: ["“It went well”", "“Shipped two days early; bugs fell by half”", "“Everyone was happy”", "“We finished”"], a: 1, explain: "It is specific and measurable." },
            ]),
        ],
      },
    ],
  },
];
