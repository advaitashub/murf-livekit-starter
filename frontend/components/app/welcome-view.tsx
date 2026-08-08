import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';
import { Compass3D } from './compass-3d';
import { FinancialJourney, type LifeStage } from './financial-journey';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

const LIFE_STAGES: LifeStage[] = [
  {
    id: 'first_salary',
    title: 'First Salary',
    question: '"Where should my ₹35,000 salary go?"',
    description: 'Learn how to budget and give every rupee a purpose from day one.',
    imagePath: '/assets/cashcompass/salary/visual.jpg',
  },
  {
    id: 'managing_money',
    title: 'Managing Money',
    question: '"Why am I running out of money before the end of the month?"',
    description: 'Track your spending and build healthy financial habits.',
    imagePath: '/assets/cashcompass/budgeting/visual.jpg',
  },
  {
    id: 'family_goals',
    title: 'Family & Goals',
    question: '"Can I afford this home without hurting my savings?"',
    description: 'Plan for major life milestones with confidence.',
    imagePath: '/assets/cashcompass/family/visual.jpg',
  },
  {
    id: 'building_wealth',
    title: 'Building Wealth',
    question: '"How should I start investing?"',
    description: 'Grow your wealth through smart, long-term investment strategies.',
    imagePath: '/assets/cashcompass/wealth/visual.jpg',
  },
  {
    id: 'retirement',
    title: 'Planning Retirement',
    question: '"Am I saving enough for the future?"',
    description: 'Ensure a secure and comfortable retirement.',
    imagePath: '/assets/cashcompass/retirement/visual.jpg',
  },
];

export const WelcomeView = React.forwardRef<HTMLDivElement, WelcomeViewProps>(
  ({ startButtonText, onStartCall, ...props }, ref) => {
    const [activeStage, setActiveStage] = useState<LifeStage>(LIFE_STAGES[0]);

    return (
      <div
        ref={ref}
        className="flex min-h-screen flex-col items-center overflow-x-hidden bg-zinc-950 text-white"
        {...props}
      >
        {/* SECTION 1: HERO */}
        <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-between px-6 pt-20 md:flex-row md:px-16 lg:px-24">
          <div className="z-10 mt-10 flex max-w-2xl flex-1 flex-col items-start text-left md:mt-0">
            <div className="mb-6 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-blue-400">
              Meet CashCompass
            </div>
            <h1 className="mb-6 bg-gradient-to-r from-blue-400 via-emerald-400 to-emerald-200 bg-clip-text text-5xl leading-tight font-extrabold tracking-tight text-transparent md:text-7xl">
              Your money.
              <br />
              Your journey.
              <br />
              Your Compass.
            </h1>
            <p className="mb-10 max-w-lg text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
              Financial guidance for every stage of life — from your first salary to retirement.
            </p>

            <Button
              size="lg"
              onClick={onStartCall}
              className="transform rounded-full bg-blue-600 px-8 py-7 text-lg font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 hover:bg-blue-500"
            >
              {startButtonText}
            </Button>
          </div>

          <div className="relative mt-12 h-[50vh] min-h-[400px] w-full flex-1 md:mt-0 md:h-full">
            <div className="absolute inset-0 origin-center scale-125 md:scale-150">
              <Compass3D agentState="idle" className="h-full w-full" />
            </div>
          </div>
        </section>

        {/* SECTION 2: FINANCIAL JOURNEY (INTERACTIVE) */}
        <section className="relative w-full border-t border-zinc-900 bg-zinc-950 py-24">
          <div className="mx-auto mb-16 max-w-7xl px-6 text-center">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">A Journey Tailored to You</h2>
            <p className="mx-auto max-w-2xl text-xl text-zinc-400">
              Select a stage below to see how CashCompass adapts to your evolving financial needs.
            </p>
          </div>

          {/* Stage Selector */}
          <div className="hide-scrollbar mx-auto mb-12 w-full max-w-5xl overflow-x-auto px-4 pb-4">
            <div className="mx-auto flex min-w-max items-center justify-center gap-3">
              {LIFE_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage)}
                  className={cn(
                    'rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-300',
                    activeStage.id === stage.id
                      ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  )}
                >
                  {stage.title}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[600px] w-full md:h-[700px]">
            <FinancialJourney activeStage={activeStage} />
          </div>
        </section>

        {/* SECTION 3: VOICE ASSISTANT EXPERIENCE */}
        <section className="relative w-full overflow-hidden border-t border-zinc-900 bg-zinc-900/20 py-32">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
            <div className="relative mb-8 h-32 w-32">
              <Compass3D agentState="listening" className="h-full w-full" />
              <div className="absolute inset-0 z-[-1] rounded-full bg-emerald-500/10 blur-2xl"></div>
            </div>

            <h2 className="mb-8 text-4xl font-bold md:text-5xl">Just talk to CashCompass.</h2>

            <div className="mb-12 flex max-w-3xl flex-wrap justify-center gap-4">
              {[
                '"What should I do with my first salary?"',
                '"How can I save more every month?"',
                '"Can I afford a home?"',
                '"How much should I save for retirement?"',
              ].map((q, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-3 text-sm text-zinc-300 shadow-sm md:text-base"
                >
                  {q}
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={onStartCall}
              className="transform rounded-full bg-emerald-600 px-10 py-7 text-lg font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:bg-emerald-500"
            >
              Start Talking Now
            </Button>
          </div>
        </section>
      </div>
    );
  }
);
WelcomeView.displayName = 'WelcomeView';
