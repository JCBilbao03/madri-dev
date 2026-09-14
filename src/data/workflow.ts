import { PenTool, Rocket, Search, TerminalSquare, type LucideIcon } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  title: string;
  duration: string;
  description: string;
  icon: LucideIcon;
}

export const workflowSteps: WorkflowStep[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    duration: 'Week 1',
    description:
      'We map the problem, the users, and the constraints, then write down what success looks like in numbers you already track.',
    icon: Search,
  },
  {
    id: 'design',
    title: 'Design',
    duration: 'Weeks 2–3',
    description:
      'Wireframes to a clickable prototype. You review real screens and real flows well before anyone writes production code.',
    icon: PenTool,
  },
  {
    id: 'development',
    title: 'Development',
    duration: 'Weeks 4–9',
    description:
      'Two-week sprints in React, Next.js, or Vite with Tailwind — Express APIs and Firestore wired up with a working deploy at the end of each one.',
    icon: TerminalSquare,
  },
  {
    id: 'launch',
    title: 'Launch',
    duration: 'Week 10',
    description:
      'Performance pass, accessibility audit, monitoring, and a handover your team can actually maintain. Then we stay on call.',
    icon: Rocket,
  },
];
