import { motion } from 'framer-motion';
import {
  BarChart3,
  BrainCircuit,
  Clock3,
  Microscope,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Screen } from '../../types';
import { cx } from './dashboardStyles';

const workflowSteps: Array<{ key: Screen; label: string; icon: LucideIcon }> = [
  { key: 'input', label: 'Patient Intake', icon: ScanSearch },
  { key: 'processing', label: 'AI Processing', icon: BrainCircuit },
  { key: 'dsd', label: 'DSD Results', icon: BarChart3 },
  { key: 'tdps', label: 'TDPS Forecast', icon: Clock3 },
  { key: 'shap', label: 'SHAP Insights', icon: Microscope },
  { key: 'clinician', label: 'Final Decision', icon: ShieldCheck },
];

function WorkflowStepper({ current }: { current: Screen }) {
  const activeIndex = workflowSteps.findIndex((step) => step.key === current);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {workflowSteps.map((step, index) => {
        const Icon = step.icon;
        const status =
          index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'upcoming';

        return (
          <div
            key={step.key}
            className={cx(
              'rounded-2xl border px-4 py-3 transition-colors',
              status === 'active' &&
                'border-sky-400/40 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]',
              status === 'complete' && 'border-emerald-400/30 bg-emerald-500/10',
              status === 'upcoming' && 'border-slate-800 bg-slate-950/50',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cx(
                  'flex h-10 w-10 items-center justify-center rounded-xl border',
                  status === 'active' && 'border-sky-400/40 bg-sky-500/15 text-sky-300',
                  status === 'complete' &&
                    'border-emerald-400/40 bg-emerald-500/15 text-emerald-300',
                  status === 'upcoming' && 'border-slate-700 bg-slate-900 text-slate-500',
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </p>
                <p
                  className={cx(
                    'truncate text-sm font-medium',
                    status === 'upcoming' ? 'text-slate-400' : 'text-slate-100',
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DashboardBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_28%),linear-gradient(180deg,#0b1120_0%,#0f172a_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(148,163,184,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.4)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-500/12 blur-3xl" />
      <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-600/12 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
    </div>
  );
}

interface PageLayoutProps {
  screen: Screen;
  title: string;
  subtitle: string;
  eyebrow?: string;
  icon: LucideIcon;
  rightSlot?: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  screen,
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  rightSlot,
  children,
}: PageLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B1120] text-slate-50">
      <DashboardBackdrop />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 space-y-6"
        >
          <div className="rounded-[28px] border border-slate-700/80 bg-slate-900/75 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.95)] backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  {eyebrow ? (
                    <p className="text-xs uppercase tracking-[0.24em] text-sky-300/90">{eyebrow}</p>
                  ) : null}
                  <div>
                    <h1 className="text-5xl font-bold tracking-tight text-slate-50">{title}</h1>
                    <p className="mt-2 text-lg text-slate-400">{subtitle}</p>
                  </div>
                </div>
              </div>
              {rightSlot ? <div className="xl:max-w-sm">{rightSlot}</div> : null}
            </div>
          </div>
          <WorkflowStepper current={screen} />
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function SurfaceCard({ children, className, hover = true }: SurfaceCardProps) {
  return (
    <motion.section
      whileHover={hover ? { y: -4, scale: 1.005 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cx(
        'rounded-2xl border border-slate-700 bg-slate-900/70 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.95)] backdrop-blur-xl transition-all',
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 text-2xl font-semibold text-slate-50">{title}</h2>
        {description ? <p className="mt-2 text-base text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricBadge({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'sky' | 'green' | 'amber';
}) {
  const toneClass =
    tone === 'sky'
      ? 'border-sky-400/30 bg-sky-500/10 text-sky-100'
      : tone === 'green'
        ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
        : tone === 'amber'
          ? 'border-amber-400/30 bg-amber-500/10 text-amber-100'
          : 'border-slate-700 bg-slate-950/60 text-slate-100';

  return (
    <div className={cx('rounded-2xl border px-4 py-3', toneClass)}>
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function PrimaryButton({
  children,
  onClick,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-[linear-gradient(135deg,rgba(56,189,248,0.95),rgba(37,99,235,0.95))] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-20px_rgba(37,99,235,0.75)] transition-all',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/60 px-5 py-3 text-sm font-semibold text-slate-100 transition-all hover:border-slate-600 hover:bg-slate-900/90',
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
