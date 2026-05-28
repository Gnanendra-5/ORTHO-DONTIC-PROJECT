import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  LineChart,
  ShieldCheck,
  TimerReset,
} from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  PrimaryButton,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';

interface TDPSResultsScreenProps {
  duration: string;
  factors: string[];
  onContinue: () => void;
}

const phasePlan = [
  { label: 'Alignment', window: '0-5 mo', width: '26%', tone: 'bg-sky-400' },
  { label: 'Sagittal correction', window: '6-11 mo', width: '28%', tone: 'bg-blue-500' },
  { label: 'Finishing', window: '12-18 mo', width: '24%', tone: 'bg-cyan-400' },
  { label: 'Retention prep', window: '19-24 mo', width: '22%', tone: 'bg-emerald-400' },
];

const factorNotes: Record<string, string> = {
  'Adult Patient': 'Biomechanics and retention tend to require a longer controlled schedule.',
  'Tongue Thrust Habit': 'Habit correction increases interdisciplinary coordination during treatment.',
  'Scissor Bite': 'Transverse correction and finishing mechanics may extend active treatment.',
  Gingivitis: 'Soft tissue health can affect adjustment cadence and treatment efficiency.',
  'Detailed Finishing Mechanics': 'Precision detailing adds time to optimize occlusion and aesthetics.',
};

export default function TDPSResultsScreen({
  duration,
  factors,
  onContinue,
}: TDPSResultsScreenProps) {
  const [low, high] = duration.split('-').map((value) => Number.parseInt(value, 10));
  const midpoint = Math.round((low + high) / 2);
  const ringProgress = Math.min(Math.round((midpoint / 30) * 100), 100);
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * ringProgress) / 100;

  return (
    <PageLayout
      screen="tdps"
      eyebrow="Treatment Forecast"
      title="TDPS Duration Forecast"
      subtitle="Treatment duration prediction with phase-level planning and complexity drivers"
      icon={Clock3}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBadge label="Predicted Window" value={`${duration} months`} tone="sky" />
          <MetricBadge label="Median Estimate" value={`${midpoint} months`} tone="green" />
          <MetricBadge label="Complexity Tier" value="Moderate +" tone="amber" />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Duration Indicator"
            title="Projected active treatment"
            description="The TDPS model predicts a balanced but slightly extended timeline due to functional and finishing demands."
          />

          <div className="mt-6 flex flex-col items-center gap-6 rounded-[28px] border border-slate-800 bg-slate-950/55 px-6 py-8 text-center">
            <div className="relative flex h-56 w-56 items-center justify-center">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  stroke="rgba(51,65,85,0.9)"
                  strokeWidth="12"
                  fill="none"
                />
                <motion.circle
                  cx="70"
                  cy="70"
                  r="54"
                  stroke="url(#tdpsRing)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                  strokeDasharray={circumference}
                />
                <defs>
                  <linearGradient id="tdpsRing" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="mono text-5xl font-semibold text-slate-50">{midpoint}</span>
                <span className="mt-1 text-sm text-slate-400">months median</span>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Forecast range</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{duration} months</p>
              <p className="mt-2 text-sm text-slate-400">
                Estimated active treatment duration before retention handoff.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Phase Timeline"
            title="Planned treatment progression"
            description="The timeline balances alignment, sagittal correction, detailing, and retention preparation."
          />

          <div className="mt-6 rounded-[28px] border border-slate-800 bg-slate-950/55 p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Treatment span</p>
                <p className="mt-2 text-3xl font-semibold text-slate-50">{duration} months</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Forecast confidence</p>
                <p className="mono mt-1 text-xl font-semibold text-sky-200">89%</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {phasePlan.map((phase) => (
                <div key={phase.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-100">{phase.label}</span>
                    <span className="text-slate-400">{phase.window}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: phase.width }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${phase.tone}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SurfaceCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <TimerReset className="h-5 w-5 text-sky-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Chairside cadence</p>
                  <p className="mt-1 text-sm text-slate-400">4-6 week review interval</p>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <LineChart className="h-5 w-5 text-sky-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Control load</p>
                  <p className="mt-1 text-sm text-slate-400">Moderate anchorage demand</p>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-4" hover={false}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-slate-100">Retention risk</p>
                  <p className="mt-1 text-sm text-slate-400">Extended monitoring advised</p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </SurfaceCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {factors.map((factor) => (
          <SurfaceCard key={factor} className="p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-3 text-amber-300">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-50">{factor}</p>
                <p className="mt-2 text-base text-slate-400">
                  {factorNotes[factor] ?? 'This finding increases treatment planning complexity and follow-up needs.'}
                </p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>

      <SurfaceCard className="mt-6 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Next Module</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Open SHAP explainability</h2>
            <p className="mt-2 text-base text-slate-400">
              Review which anatomical and functional features most strongly influenced duration and diagnostic outputs.
            </p>
          </div>
          <PrimaryButton onClick={onContinue} className="h-14 min-w-[230px] justify-center text-base">
            View SHAP Explainability
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
