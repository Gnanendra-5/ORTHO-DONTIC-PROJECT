import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  LoaderCircle,
  Orbit,
  Sparkles,
} from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';
import { cx } from '../ui/dashboardStyles';

interface AIProcessingScreenProps {
  onComplete: () => void;
}

const steps = [
  'Analyzing cephalometric parameters',
  'Extracting orthodontic features',
  'Running DSD classification',
  'Running TDPS regression',
  'Generating SHAP explainability',
  'Finalizing recommendation',
];

const particles = [
  { top: '12%', left: '22%', delay: 0 },
  { top: '18%', left: '76%', delay: 0.2 },
  { top: '31%', left: '14%', delay: 0.5 },
  { top: '36%', left: '82%', delay: 0.8 },
  { top: '57%', left: '17%', delay: 0.3 },
  { top: '63%', left: '79%', delay: 0.7 },
  { top: '78%', left: '28%', delay: 0.4 },
  { top: '82%', left: '70%', delay: 0.9 },
];

export default function AIProcessingScreen({ onComplete }: AIProcessingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const finishFlow = useEffectEvent(() => onComplete());

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = window.setTimeout(() => {
        setCurrentStep((value) => value + 1);
      }, 900);

      return () => window.clearTimeout(timer);
    }

    const finishTimer = window.setTimeout(() => {
      finishFlow();
    }, 900);

    return () => window.clearTimeout(finishTimer);
  }, [currentStep]);

  const progress = Math.round((currentStep / steps.length) * 100);
  const completedSteps = Math.min(currentStep, steps.length);
  const activeLabel = currentStep < steps.length ? steps[currentStep] : 'Ready for review';

  const metrics = useMemo(
    () => [
      { label: 'Progress', value: `${progress}%`, tone: 'sky' as const },
      { label: 'Steps Completed', value: `${completedSteps}/${steps.length}`, tone: 'green' as const },
      { label: 'Mode', value: 'Clinical inference', tone: 'default' as const },
    ],
    [completedSteps, progress],
  );

  return (
    <PageLayout
      screen="processing"
      eyebrow="AI Orchestration"
      title="AI Processing Pipeline"
      subtitle="Synchronized model inference across diagnosis, duration, and explainability"
      icon={BrainCircuit}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <MetricBadge key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
          ))}
        </div>
      }
    >
      <SurfaceCard className="overflow-hidden p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_42%),linear-gradient(135deg,rgba(37,99,235,0.14),transparent_60%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/50">
            {particles.map((particle) => (
              <motion.span
                key={`${particle.top}-${particle.left}`}
                animate={{ opacity: [0.18, 0.85, 0.18], y: [0, -10, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: particle.delay }}
                className="absolute h-2 w-2 rounded-full bg-sky-300"
                style={{ top: particle.top, left: particle.left }}
              />
            ))}

            <div className="absolute inset-x-8 top-10 flex items-center justify-between text-xs uppercase tracking-[0.26em] text-slate-500">
              <span>Neural sequence</span>
              <span className="mono">{progress}%</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-sky-400/20"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-5 rounded-full border border-sky-400/20 border-dashed"
                />
                <motion.div
                  animate={{ scale: [0.95, 1.04, 0.95] }}
                  transition={{ duration: 2.6, repeat: Infinity }}
                  className="absolute inset-12 rounded-full border border-slate-700 bg-slate-900/70 shadow-[0_0_80px_rgba(56,189,248,0.18)]"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-16 flex items-center justify-center rounded-full border border-sky-400/15"
                >
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-sky-400/25 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.32),rgba(17,24,39,0.96))]">
                    <motion.div
                      animate={{ scale: [0.9, 1.08, 0.9], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                      className="absolute inset-3 rounded-full border border-sky-300/25"
                    />
                    <BrainCircuit className="h-12 w-12 text-sky-200" />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="absolute bottom-10 left-8 right-8 space-y-4">
              {['Feature scan', 'Regression queue', 'Explainability graph'].map((stream, index) => (
                <div key={stream} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{stream}</span>
                    <span className="mono">{32 + index * 11} ms</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-slate-900">
                    <motion.div
                      animate={{ x: ['-20%', '90%'] }}
                      transition={{
                        duration: 1.8 + index * 0.25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-sky-400/80 to-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <SectionTitle
              eyebrow="Inference Status"
              title="Sequential clinical processing"
              description="Each model stage updates progressively and prepares the next specialist module."
            />

            <div className="rounded-2xl border border-slate-700 bg-slate-950/65 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Current stage</p>
                  <p className="mt-2 text-lg font-semibold text-slate-50">{activeLabel}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Completion</p>
                  <p className="mono mt-1 text-2xl font-semibold text-sky-200">{progress}%</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const complete = index < currentStep;
                const active = index === currentStep && currentStep < steps.length;

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: complete || active ? 1 : 0.45, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cx(
                      'flex items-center gap-4 rounded-2xl border p-4 transition-colors',
                      complete && 'border-emerald-400/25 bg-emerald-500/10',
                      active && 'border-sky-400/30 bg-sky-500/10',
                      !complete && !active && 'border-slate-800 bg-slate-950/55',
                    )}
                  >
                    <div
                      className={cx(
                        'flex h-10 w-10 items-center justify-center rounded-2xl border',
                        complete && 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
                        active && 'border-sky-400/30 bg-sky-500/15 text-sky-300',
                        !complete && !active && 'border-slate-700 bg-slate-900 text-slate-500',
                      )}
                    >
                      {complete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : active ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                        >
                          <LoaderCircle className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <Orbit className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-50">{step}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {complete
                          ? 'Completed and validated for downstream analysis.'
                          : active
                            ? 'Running live against synchronized patient data.'
                            : 'Queued in the clinical inference pipeline.'}
                      </p>
                    </div>
                    {complete ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                        Done
                      </span>
                    ) : active ? (
                      <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] text-sky-100">
                        Live
                      </span>
                    ) : null}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-sky-300" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Feature scan integrity</p>
              <p className="mt-1 text-sm text-slate-400">Cephalometric landmarks verified before inference.</p>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-sky-300" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Explainability prepared</p>
              <p className="mt-1 text-sm text-slate-400">SHAP artifacts generated in the same pass as prediction.</p>
            </div>
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-emerald-300" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Clinician gate active</p>
              <p className="mt-1 text-sm text-slate-400">No recommendation proceeds without final human review.</p>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
