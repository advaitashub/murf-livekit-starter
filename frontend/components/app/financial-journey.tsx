'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/shadcn/utils';
import { Compass3D } from './compass-3d';

export interface LifeStage {
  id: string;
  title: string;
  question: string;
  description: string;
  imagePath: string;
}

interface FinancialJourneyProps {
  activeStage: LifeStage;
  className?: string;
}

export function FinancialJourney({ activeStage, className }: FinancialJourneyProps) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full flex-col items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Central 3D Compass (Anchor) */}
      <div className="absolute inset-0 z-0 flex scale-125 items-center justify-center opacity-70 blur-[2px] transition-all duration-1000 md:scale-150">
        <Compass3D agentState="idle" className="aspect-square w-[80vw] max-w-[800px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
        {/* Left Side: Storytelling Image */}
        <div className="relative h-[300px] w-full flex-1 overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/40 shadow-2xl backdrop-blur-sm md:h-[400px] lg:h-[500px]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10, z: -100 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
              exit={{ opacity: 0, scale: 1.1, rotateY: 10, z: 100 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full"
            >
              <div
                className="h-full w-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${activeStage.imagePath})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Text & Context */}
        <div className="flex w-full flex-1 flex-col items-start rounded-3xl border border-zinc-700/50 bg-zinc-900/60 p-8 text-left shadow-xl backdrop-blur-md md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex w-max items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold tracking-wide text-emerald-400 uppercase">
                {activeStage.title}
              </div>
              <h3 className="text-3xl leading-tight font-semibold text-white md:text-4xl">
                {activeStage.question}
              </h3>
              <p className="text-lg leading-relaxed text-zinc-400">{activeStage.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
