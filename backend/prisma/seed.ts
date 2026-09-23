import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding StudyMate AI database...');

  // Clean existing data
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.note.deleteMany();
  await prisma.studyPlanDay.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Create demo student
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@college.edu',
      passwordHash,
    },
  });

  console.log(`Created demo user: ${user.email} (${user.id})`);

  // Create sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Operating System Process Scheduling',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Explain Round Robin process scheduling in Operating Systems and why time quantum matters.',
          },
          {
            role: 'assistant',
            content: `### Round Robin (RR) Process Scheduling

**Definition**: Round Robin is a preemptive scheduling algorithm where each ready process is assigned a fixed time slot called a **time quantum** (or time slice) in cyclic order.

#### 1. How It Works
- The scheduler maintains a FIFO ready queue.
- The CPU allocates time to the first process for at most the duration of the time quantum ($q$).
- If the process completes within $q$, it terminates or yields.
- If it is still executing when $q$ expires, an interrupt occurs, the OS performs a context switch, and the process is placed at the end of the ready queue.

#### 2. Why Time Quantum Matters
- **If Quantum is too large**: RR degenerates into First-Come First-Served (FCFS), leading to high waiting times for short interactive jobs (convoy effect).
- **If Quantum is too small**: The frequency of context switches spikes dramatically. CPU spends excessive cycles saving/restoring process registers (overhead), reducing overall throughput.
- **Rule of Thumb**: Quantum should be chosen such that approximately 80% of CPU bursts are shorter than the quantum (typically between 10ms and 100ms).`,
          },
        ],
      },
    },
  });

  // Create sample note
  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'Deadlocks in Distributed & Operating Systems',
      topic: 'Deadlock Detection & Prevention',
      difficulty: 'Intermediate',
      length: 'Detailed',
      tags: ['Operating Systems', 'Concurrency', 'Exam Focus'],
      content: `# Deadlocks in Operating Systems

## 1. Topic Overview
A deadlock is a situation where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process in the same set.

## 2. Four Coffman Conditions (Must hold simultaneously)
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process holds at least one resource and is waiting to acquire additional resources held by other processes.
3. **No Preemption**: Resources cannot be preempted; a resource can be released only voluntarily by the process holding it.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.

## 3. Banker's Algorithm (Deadlock Avoidance)
- Developed by Edsger Dijkstra for testing safety state.
- **Formulas**:
  - $Need[i, j] = Max[i, j] - Allocation[i, j]$
  - Safe State Condition: $Need_i \\le Work$
- Time Complexity: $O(m \\times n^2)$ where $n$ is number of processes, $m$ is resource types.

## 4. Exam-Focused Points
- Deadlock Prevention eliminates at least one of the 4 Coffman conditions.
- Deadlock Avoidance dynamically checks resource allocation state (Banker's Algorithm).
- Deadlock Detection & Recovery allows deadlock to occur, detects it via Resource Allocation Graph (RAG) cycle detection, and aborts processes or preempts resources.`,
    },
  });

  // Create sample quiz
  const quiz = await prisma.quiz.create({
    data: {
      userId: user.id,
      title: 'Operating Systems: Process Management & Concurrency',
      topic: 'Operating Systems Process Management',
      difficulty: 'Intermediate',
      questionType: 'MCQ',
      questionsCount: 5,
      questions: {
        create: [
          {
            order: 1,
            question: 'Which of the following is NOT one of Coffman\'s four conditions for deadlock?',
            options: [
              'Mutual exclusion',
              'Hold and wait',
              'Starvation avoidance',
              'Circular wait',
            ],
            correctAnswer: 'Starvation avoidance',
            explanation: 'The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Starvation avoidance is a scheduling goal, not a deadlock condition.',
          },
          {
            order: 2,
            question: 'What happens in Round Robin scheduling if the time quantum is set to an extremely large value?',
            options: [
              'CPU throughput approaches zero',
              'It behaves identical to First-Come First-Served (FCFS)',
              'Context switches occur continuously',
              'Processes are preempted prematurely',
            ],
            correctAnswer: 'It behaves identical to First-Come First-Served (FCFS)',
            explanation: 'When the time quantum exceeds the longest CPU burst, every process finishes before its quantum expires without being preempted, thus behaving like FCFS.',
          },
          {
            order: 3,
            question: 'Which scheduling algorithm is provably optimal with respect to minimizing average waiting time for a given set of processes?',
            options: [
              'Shortest Job First (SJF / SRTF)',
              'Priority Scheduling',
              'Round Robin',
              'First-Come First-Served',
            ],
            correctAnswer: 'Shortest Job First (SJF / SRTF)',
            explanation: 'Shortest Job First (SJF) is provably optimal because moving a short process before a long process decreases the waiting time of the short process more than it increases that of the long process.',
          },
          {
            order: 4,
            question: 'What data structure is utilized in Banker\'s Algorithm to determine the remaining resources required by a process?',
            options: [
              'Available Array',
              'Need Matrix (Max - Allocation)',
              'Allocation Matrix',
              'Wait-For Graph',
            ],
            correctAnswer: 'Need Matrix (Max - Allocation)',
            explanation: 'The Need Matrix is calculated as Need[i, j] = Max[i, j] - Allocation[i, j] and represents the remaining resources process i may request.',
          },
          {
            order: 5,
            question: 'What is the primary role of the Translation Lookaside Buffer (TLB) in virtual memory management?',
            options: [
              'To store dirty pages waiting for disk write',
              'To cache recent virtual-to-physical page table translations in hardware',
              'To swap out victim pages during page faults',
              'To schedule memory bus arbitration requests',
            ],
            correctAnswer: 'To cache recent virtual-to-physical page table translations in hardware',
            explanation: 'The TLB is an associative high-speed hardware cache for page table entries, avoiding two memory accesses for every single virtual address reference.',
          },
        ],
      },
    },
  });

  // Record an initial quiz attempt
  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score: 4,
      totalQuestions: 5,
      userAnswers: {
        '1': 'Starvation avoidance',
        '2': 'It behaves identical to First-Come First-Served (FCFS)',
        '3': 'Shortest Job First (SJF / SRTF)',
        '4': 'Allocation Matrix', // Incorrect (real answer is Need Matrix)
        '5': 'To cache recent virtual-to-physical page table translations in hardware',
      },
    },
  });

  // Create sample study plan
  const plan = await prisma.studyPlan.create({
    data: {
      userId: user.id,
      title: '14-Day Operating Systems Mastery Plan',
      subject: 'Operating Systems',
      knowledgeLevel: 'Beginner',
      difficulty: 'Intermediate',
      dailyTimeMinutes: 120,
      durationDays: 7,
      progressPercent: 28,
      extraTopics: 'Virtual Memory, Page Replacement, Semaphores',
      days: {
        create: [
          {
            dayNumber: 1,
            title: 'OS Architecture & System Calls',
            topics: ['Dual mode operation', 'Trap instructions', 'Monolithic vs Microkernel'],
            durationMinutes: 120,
            learningActivity: 'Study OS architectural diagrams and dual-mode execution (user vs kernel).',
            practiceActivity: 'Trace fork(), exec(), and wait() system calls using C program snippets.',
            revisionActivity: 'Write a 1-page summary of context switching and interrupt handling.',
            quizReview: 'Answer 5 concept check questions on kernel privilege levels.',
            isCompleted: true,
          },
          {
            dayNumber: 2,
            title: 'Process Management & Scheduling Algorithms',
            topics: ['PCB structure', 'FCFS', 'SJF', 'Round Robin', 'Priority Scheduling'],
            durationMinutes: 120,
            learningActivity: 'Understand Gantt chart calculations and turn-around time formulas.',
            practiceActivity: 'Calculate waiting and turnaround times for 4 processes under SJF and RR.',
            revisionActivity: 'Memorize the advantages and disadvantages of preemptive vs non-preemptive scheduling.',
            quizReview: 'Take an online 5-question quiz on Round Robin time quantum impact.',
            isCompleted: true,
          },
          {
            dayNumber: 3,
            title: 'Process Synchronization & Semaphores',
            topics: ['Critical section problem', 'Peterson\'s solution', 'Mutex locks', 'Counting semaphores'],
            durationMinutes: 120,
            learningActivity: 'Review the 3 requirements for critical section solutions: Mutual Exclusion, Progress, Bounded Waiting.',
            practiceActivity: 'Implement producer-consumer problem pseudocode using wait() and signal().',
            revisionActivity: 'Highlight differences between spinlocks and blocking mutexes.',
            quizReview: 'Solve classic Dining Philosophers deadlock scenario.',
            isCompleted: false,
          },
          {
            dayNumber: 4,
            title: 'Deadlocks: Detection & Banker\'s Algorithm',
            topics: ['Coffman conditions', 'Resource Allocation Graph', 'Banker\'s Algorithm'],
            durationMinutes: 120,
            learningActivity: 'Study safety algorithm steps and Need matrix calculation.',
            practiceActivity: 'Solve a complete Banker\'s Algorithm 5-process 3-resource safety problem step-by-step.',
            revisionActivity: 'Create flashcards for Deadlock Prevention vs Avoidance vs Detection.',
            quizReview: 'Verify whether a system state is safe after a new resource request.',
            isCompleted: false,
          },
          {
            dayNumber: 5,
            title: 'Memory Management & Paging',
            topics: ['Logical vs Physical addresses', 'Page tables', 'TLB', 'Internal vs External fragmentation'],
            durationMinutes: 120,
            learningActivity: 'Understand address translation with page size $2^p$ and offset.',
            practiceActivity: 'Calculate physical address given virtual address and 2-level page table structure.',
            revisionActivity: 'Summarize TLB hit ratio and Effective Memory Access Time (EMAT) formula.',
            quizReview: 'Solve 4 EMAT numerical problems.',
            isCompleted: false,
          },
          {
            dayNumber: 6,
            title: 'Virtual Memory & Page Replacement',
            topics: ['Demand paging', 'Page fault service time', 'FIFO', 'LRU', 'Optimal Page Replacement', 'Belady\'s Anomaly'],
            durationMinutes: 120,
            learningActivity: 'Walk through demand paging workflow and page fault trap.',
            practiceActivity: 'Compute page faults for a reference string using FIFO, LRU, and Optimal algorithms with 3 frames.',
            revisionActivity: 'Explain why LRU does not suffer from Belady\'s Anomaly (stack algorithm property).',
            quizReview: 'Complete 5 MCQs on Thrashing and Working Set Model.',
            isCompleted: false,
          },
          {
            dayNumber: 7,
            title: 'File Systems & Comprehensive Mock Review',
            topics: ['File allocation methods (Contiguous, Linked, Indexed)', 'Inodes', 'I/O scheduling'],
            durationMinutes: 120,
            learningActivity: 'Review Unix inode pointers (direct, single indirect, double indirect).',
            practiceActivity: 'Calculate maximum file size supported by an inode system with given block size.',
            revisionActivity: 'Synthesize all high-yield exam cheat sheet formulas.',
            quizReview: 'Full 20-question comprehensive mock exam across all 6 OS modules.',
            isCompleted: false,
          },
        ],
      },
    },
  });

  // Create sample document
  await prisma.document.create({
    data: {
      userId: user.id,
      filename: 'sample_operating_systems_summary.txt',
      originalName: 'Operating_Systems_Core_Concepts.txt',
      mimeType: 'text/plain',
      sizeBytes: 1540,
      extractedText: `Operating Systems - Core Concepts Summary
Chapter 1: Process and Thread Management
A process is a program in execution containing program counter, stack, data, and heap. Threads are lightweight units of execution within a process sharing the same address space.
Multithreading provides responsiveness, resource sharing, economy, and scalability for multicore systems.
Critical section problems require three conditions: Mutual exclusion, Progress, and Bounded waiting.
Mutex locks and Semaphores are primary synchronization primitives. A counting semaphore can control access to a resource pool with multiple instances.
Chapter 2: Memory & Virtual Memory
Paging eliminates external fragmentation by dividing physical memory into frames and logical memory into pages.
Virtual memory allows execution of processes not entirely in memory, using demand paging and page replacement algorithms like LRU and FIFO.`,
      summary: 'Summary of OS Chapter 1 (Process & Thread Management) and Chapter 2 (Memory & Virtual Memory).',
    },
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
