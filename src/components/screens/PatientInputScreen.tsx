import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  ClipboardList,
  FileImage,
  Ruler,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  PrimaryButton,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';
import { cx, inputBaseClassName, labelClassName } from '../ui/dashboardStyles';
import type { PatientData } from '../../types';

interface PatientInputScreenProps {
  patientData: PatientData;
  setPatientData: Dispatch<SetStateAction<PatientData>>;
  onRunAnalysis: () => void;
}

function medicalPlaceholder(base: string, accent: string, shapes: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="240" height="180" rx="28" fill="url(#g)" />
      <rect x="18" y="18" width="204" height="144" rx="20" fill="rgba(15,23,42,0.18)" stroke="rgba(248,250,252,0.12)" />
      <path d="M24 142h192" stroke="rgba(248,250,252,0.08)" stroke-width="1.5" stroke-dasharray="4 6" />
      <path d="M24 34h192" stroke="rgba(248,250,252,0.08)" stroke-width="1.5" stroke-dasharray="4 6" />
      ${shapes}
    </svg>
  `;

  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const imagingCards = [
  {
    key: 'extraoral',
    title: 'Extraoral',
    subtitle: 'Frontal and profile soft-tissue review',
    status: 'Aligned capture',
    background: medicalPlaceholder(
      '#0f172a',
      '#15314f',
      '<ellipse cx="110" cy="92" rx="34" ry="48" fill="rgba(248,250,252,0.22)" /><path d="M104 62c18 5 30 18 35 37 4 17-2 34-16 43-14 9-32 8-45-2" fill="none" stroke="rgba(248,250,252,0.72)" stroke-width="3" stroke-linecap="round"/><path d="M135 77c12 7 17 19 16 33" fill="none" stroke="rgba(56,189,248,0.75)" stroke-width="2" stroke-linecap="round"/><circle cx="119" cy="90" r="2.5" fill="rgba(248,250,252,0.9)" /><path d="M124 104c7 1 12 4 15 10" fill="none" stroke="rgba(248,250,252,0.75)" stroke-width="2" stroke-linecap="round"/>',
    ),
  },
  {
    key: 'intraoral',
    title: 'Intraoral',
    subtitle: 'Occlusal and incisor relationship mapping',
    status: 'High detail',
    background: medicalPlaceholder(
      '#111827',
      '#1d3557',
      '<path d="M46 98c17-26 44-41 74-41s56 15 74 41" fill="none" stroke="rgba(248,250,252,0.85)" stroke-width="4" stroke-linecap="round"/><path d="M56 108c16-18 39-28 64-28s48 10 64 28" fill="none" stroke="rgba(56,189,248,0.72)" stroke-width="3" stroke-linecap="round"/><g fill="rgba(248,250,252,0.4)"><rect x="65" y="84" width="10" height="18" rx="4"/><rect x="80" y="78" width="10" height="22" rx="4"/><rect x="95" y="74" width="10" height="24" rx="4"/><rect x="110" y="73" width="10" height="24" rx="4"/><rect x="125" y="74" width="10" height="24" rx="4"/><rect x="140" y="78" width="10" height="22" rx="4"/><rect x="155" y="84" width="10" height="18" rx="4"/></g>',
    ),
  },
  {
    key: 'cephalometric',
    title: 'Cephalometric',
    subtitle: 'Landmark tracing with angular references',
    status: 'Tracing synced',
    background: medicalPlaceholder(
      '#0f172a',
      '#223e63',
      '<path d="M87 58c29-4 52 8 68 31 11 15 15 30 14 45" fill="none" stroke="rgba(248,250,252,0.78)" stroke-width="3" stroke-linecap="round"/><path d="M90 60c-7 23-9 47-6 70" fill="none" stroke="rgba(148,163,184,0.65)" stroke-width="2"/><path d="M84 131l63-41" stroke="rgba(56,189,248,0.82)" stroke-width="2.2" stroke-dasharray="6 6"/><path d="M75 98h106" stroke="rgba(148,163,184,0.5)" stroke-width="1.5" stroke-dasharray="4 4"/><circle cx="109" cy="115" r="3.5" fill="rgba(248,250,252,0.88)"/><circle cx="148" cy="89" r="3.5" fill="rgba(56,189,248,0.9)"/><circle cx="90" cy="96" r="3.5" fill="rgba(248,250,252,0.7)"/>',
    ),
  },
  {
    key: 'opg',
    title: 'OPG',
    subtitle: 'Panoramic jaw survey and dentition status',
    status: 'Panoramic ready',
    background: medicalPlaceholder(
      '#111827',
      '#1e3a5f',
      '<path d="M34 98c20 28 49 43 86 43s66-15 86-43" fill="none" stroke="rgba(248,250,252,0.82)" stroke-width="4" stroke-linecap="round"/><path d="M44 90c18 18 43 28 76 28s58-10 76-28" fill="none" stroke="rgba(56,189,248,0.74)" stroke-width="3" stroke-linecap="round"/><g fill="rgba(248,250,252,0.38)"><circle cx="68" cy="92" r="6"/><circle cx="87" cy="101" r="6"/><circle cx="106" cy="106" r="6"/><circle cx="125" cy="107" r="6"/><circle cx="144" cy="104" r="6"/><circle cx="163" cy="96" r="6"/></g>',
    ),
  },
];



function parseInteger(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDecimal(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function Field({
  label,
  children,
  unit,
}: {
  label: string;
  children: ReactNode;
  unit?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className={labelClassName}>{label}</span>
        {unit ? <span className="text-xs text-slate-500">{unit}</span> : null}
      </div>
      {children}
    </label>
  );
}

function ToggleChip({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-2xl border p-4 text-left transition-all',
        active
          ? 'border-sky-400/40 bg-sky-500/12 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]'
          : 'border-slate-700 bg-slate-950/50 hover:border-slate-600',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">{label}</p>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <motion.span
          animate={{ scale: active ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.4 }}
          className={cx(
            'h-3 w-3 rounded-full',
            active ? 'bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.6)]' : 'bg-slate-600',
          )}
        />
      </div>
    </button>
  );
}

export default function PatientInputScreen({
  patientData,
  setPatientData,
  onRunAnalysis,
}: PatientInputScreenProps) {
  return (
    <PageLayout
      screen="input"
      eyebrow="Clinical Workflow"
      title="Orthodontic AI Decision Support"
      subtitle="AI-Based Orthodontic Clinical Workflow"
      icon={BrainCircuit}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricBadge label="AI Status" value="Inference Online" tone="sky" />
          <MetricBadge label="Patient Case" value="Case 04-217" />
          <div className="sm:col-span-2 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <div className="flex items-center gap-4">
              <motion.span
                animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(34,197,94,0.75)]"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">Clinical pipeline ready</p>
                <p className="mt-1 text-sm text-slate-400">
                  Imaging inputs synchronized and AI safeguards active.
                </p>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[40%_60%]">
        <SurfaceCard className="relative overflow-hidden p-6">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-500/10 blur-3xl" />
          <SectionTitle
            eyebrow="Imaging Suite"
            title="Medical Image System"
            description="Four synchronized modalities provide the AI with a clinically complete visual record."
            action={
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Record Set</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">4 of 4 modalities captured</p>
              </div>
            }
          />

          <div className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {imagingCards.map((card, index) => (
                <motion.div
                  key={card.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  className="group overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60"
                >
                  {/* Image area — no text overlay */}
                  <div
                    className="aspect-[16/9] bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: card.background }}
                  />
                  {/* Info section below the image */}
                  <div className="border-t border-slate-700/60 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-50">{card.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">{card.subtitle}</p>
                    <span className="mt-2 inline-block rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-medium text-sky-300">
                      {card.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MetricBadge label="Scan Quality" value="Excellent" tone="green" />
            <MetricBadge label="Landmark Sync" value="12 traced" />
            <MetricBadge label="Case Complexity" value="Moderate" tone="amber" />
          </div>
        </SurfaceCard>

        <div className="grid gap-4 lg:grid-cols-2">
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sky-300">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">Patient Demographics</h2>
                <p className="mt-1 text-base text-slate-400">Identity and intake metadata</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Patient name">
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(event) =>
                    setPatientData((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="Age">
                <input
                  type="number"
                  value={patientData.age}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      age: parseInteger(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="Sex">
                <select
                  value={patientData.sex}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      sex: event.target.value as PatientData['sex'],
                    }))
                  }
                  className={inputBaseClassName}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </Field>
              <Field label="Visit context">
                <select className={inputBaseClassName} defaultValue="Initial orthodontic evaluation">
                  <option>Initial orthodontic evaluation</option>
                  <option>Progress review</option>
                  <option>Retention follow-up</option>
                </select>
              </Field>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sky-300">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">Skeletal Classification</h2>
                <p className="mt-1 text-base text-slate-400">Occlusal and growth pattern findings</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Skeletal class">
                <select
                  value={patientData.skeletalClass}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      skeletalClass: event.target.value,
                    }))
                  }
                  className={inputBaseClassName}
                >
                  <option>Class I</option>
                  <option>Class II</option>
                  <option>Class III</option>
                </select>
              </Field>
              <Field label="Growth pattern">
                <select
                  value={patientData.growthPattern}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      growthPattern: event.target.value,
                    }))
                  }
                  className={inputBaseClassName}
                >
                  <option>Horizontal</option>
                  <option>Average</option>
                  <option>Vertical</option>
                </select>
              </Field>
              <Field label="Molar relation">
                <select
                  value={patientData.molarRelation}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      molarRelation: event.target.value,
                    }))
                  }
                  className={inputBaseClassName}
                >
                  <option>Class I</option>
                  <option>Class II</option>
                  <option>Class III</option>
                </select>
              </Field>
              <Field label="Canine relation">
                <select
                  value={patientData.canineRelation}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      canineRelation: event.target.value,
                    }))
                  }
                  className={inputBaseClassName}
                >
                  <option>Class I</option>
                  <option>Class II</option>
                  <option>Class III</option>
                </select>
              </Field>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sky-300">
                <Ruler className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">
                  Cephalometric Measurements
                </h2>
                <p className="mt-1 text-base text-slate-400">
                  Core parameters driving DSD and TDPS models
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Overjet" unit="mm">
                <input
                  type="number"
                  value={patientData.overjet}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      overjet: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="Overbite" unit="%">
                <input
                  type="number"
                  value={patientData.overbite}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      overbite: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="ANB angle" unit="degrees">
                <input
                  type="number"
                  value={patientData.anb}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      anb: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="U1-NA" unit="degrees">
                <input
                  type="number"
                  value={patientData.u1na}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      u1na: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="L1-NB" unit="degrees">
                <input
                  type="number"
                  value={patientData.l1nb}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      l1nb: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
              <Field label="Interincisal angle" unit="degrees">
                <input
                  type="number"
                  value={patientData.interincisalAngle}
                  onChange={(event) =>
                    setPatientData((current) => ({
                      ...current,
                      interincisalAngle: parseDecimal(event.target.value),
                    }))
                  }
                  className={inputBaseClassName}
                />
              </Field>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-5 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sky-300">
                <FileImage className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-50">Clinical Findings</h2>
                <p className="mt-1 text-base text-slate-400">
                  Functional habits and treatment complexity signals
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <ToggleChip
                active={patientData.tongueThrustHabit}
                label="Tongue thrust habit"
                description="Myofunctional therapy support recommended alongside appliance treatment."
                onClick={() =>
                  setPatientData((current) => ({
                    ...current,
                    tongueThrustHabit: !current.tongueThrustHabit,
                  }))
                }
              />
              <ToggleChip
                active={patientData.scissorBite}
                label="Scissor bite"
                description="Monitor transverse correction load and finishing mechanics."
                onClick={() =>
                  setPatientData((current) => ({
                    ...current,
                    scissorBite: !current.scissorBite,
                  }))
                }
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricBadge
                label="Functional risk"
                value={patientData.tongueThrustHabit ? 'Present' : 'Absent'}
                tone={patientData.tongueThrustHabit ? 'amber' : 'green'}
              />
              <MetricBadge
                label="Transverse issue"
                value={patientData.scissorBite ? 'Flagged' : 'Clear'}
                tone={patientData.scissorBite ? 'amber' : 'green'}
              />
              <MetricBadge label="Review status" value="Ready for AI" tone="sky" />
            </div>
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard hover={false} className="mt-6 overflow-hidden p-6">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),transparent_40%,rgba(37,99,235,0.16))]" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/25 bg-sky-500/10 text-sky-300">
                <motion.span
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.7, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl border border-sky-400/30"
                />
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">AI Analysis</p>
                <h2 className="text-2xl font-semibold text-slate-50">
                  Launch the clinical decision workflow
                </h2>
              </div>
            </div>
            <p className="text-base text-slate-400">
              The platform will analyze cephalometric parameters, classify orthodontic features,
              estimate treatment duration, and generate explainability-ready recommendations for
              clinician review.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Protection Layer</p>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Clinician oversight enforced
              </div>
            </div>
            <PrimaryButton
              onClick={onRunAnalysis}
              className="h-14 min-w-[250px] rounded-2xl px-7 text-base tracking-[0.18em]"
            >
              RUN AI ANALYSIS
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
