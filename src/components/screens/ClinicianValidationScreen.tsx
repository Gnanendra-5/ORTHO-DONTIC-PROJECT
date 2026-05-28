import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  FileText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';
import type { PatientData, PredictionData } from '../../types';

interface ClinicianValidationScreenProps {
  patientData: PatientData;
  predictions: PredictionData;
  onRestart: () => void;
}

export default function ClinicianValidationScreen({
  patientData,
  predictions,
  onRestart,
}: ClinicianValidationScreenProps) {
  const [isApproved, setIsApproved] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageLayout
      screen="clinician"
      eyebrow="Clinician Review"
      title="Final Clinical Decision"
      subtitle="Modular review workspace for diagnosis, recommendations, confidence, and explainability"
      icon={ShieldCheck}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBadge label="Patient" value={patientData.name} tone="sky" />
          <MetricBadge
            label="Review State"
            value={isApproved ? 'Approved' : 'Pending approval'}
            tone={isApproved ? 'green' : 'amber'}
          />
          <MetricBadge label="Report" value="Ready to generate" />
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Patient Summary"
            title="Case overview"
            description="Demographics and principal intake markers used across all AI modules."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoRow label="Patient name" value={patientData.name} />
            <InfoRow label="Age / sex" value={`${patientData.age} years / ${patientData.sex}`} />
            <InfoRow label="Skeletal class" value={patientData.skeletalClass} />
            <InfoRow label="Growth pattern" value={patientData.growthPattern} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {patientData.tongueThrustHabit ? <Tag label="Tongue thrust habit" /> : null}
            {patientData.scissorBite ? <Tag label="Scissor bite" /> : null}
            <Tag label="Imaging set complete" />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Final Diagnosis"
            title="Orthodontic classification"
            description="AI-supported diagnosis packaged for clinician confirmation."
          />
          <div className="mt-5 space-y-4 text-base text-slate-300">
            <DiagnosisLine
              label="Primary classification"
              value="Class I malocclusion with Class II Division 1 incisor relation"
            />
            <DiagnosisLine
              label="Growth pattern"
              value="Horizontal growth tendency with controlled vertical dimensions"
            />
            <DiagnosisLine
              label="Associated findings"
              value="Proclined incisors, tongue thrust habit, and transverse scissor bite component"
            />
            <DiagnosisLine
              label="Skeletal relationship"
              value="Mild AP discrepancy supported by ANB = 4 degrees"
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Treatment Recommendation"
            title="Proposed clinical pathway"
            description="The recommended approach is aligned with the AI's diagnosis and duration models."
          />
          <div className="mt-5 space-y-4 text-base text-slate-300">
            <DiagnosisLine label="Treatment type" value="Non-extraction fixed mechanotherapy" />
            <DiagnosisLine label="Appliance choice" value='0.022" slot fixed appliance system' />
            <DiagnosisLine label="Predicted duration" value={`${predictions.tdpsDuration} months`} />
            <DiagnosisLine
              label="Special considerations"
              value="Myofunctional therapy support, transverse monitoring, and extended retention planning"
            />
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="AI Confidence"
            title="Prediction confidence profile"
            description="Confidence scores remain visible for fast clinician validation."
          />
          <div className="mt-5 space-y-4">
            {predictions.dsdPredictions.map((prediction) => (
              <div key={prediction.label} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-100">{prediction.label}</span>
                  <span className="mono text-sm text-sky-200">{prediction.confidence}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidence}%` }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6 lg:col-span-2">
          <SectionTitle
            eyebrow="Explainability Summary"
            title="Why the AI recommended this plan"
            description="Top SHAP features reinforce the diagnostic direction and treatment duration logic."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-3 text-sky-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Top explainability drivers</p>
                  <p className="mt-1 text-sm text-slate-400">
                    These parameters most strongly shaped the final recommendation.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {predictions.shapFeatures.slice(0, 4).map((feature) => (
                  <Tag key={feature.feature} label={`${feature.feature} (${feature.importance}%)`} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-emerald-300">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Clinical interpretation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    U1-NA angle and ANB angle dominate the diagnostic explanation, while tongue
                    thrust habit adds complexity to the treatment duration and retention plan rather
                    than changing the core classification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="mt-6 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Approval Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">
              {isApproved ? 'Clinician approval recorded' : 'Awaiting clinician approval'}
            </h2>
            <p className="mt-2 text-base text-slate-400">
              AI output remains decision support only until a qualified orthodontist validates the
              recommendation and report.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton
              onClick={() => setIsApproved(true)}
              className="h-14 min-w-[200px] justify-center text-base"
            >
              <BadgeCheck className="h-4 w-4" />
              Clinician Approved
            </PrimaryButton>
            <SecondaryButton
              onClick={() => setShowReport(true)}
              className="h-14 min-w-[180px] justify-center text-base"
            >
              <FileText className="h-4 w-4" />
              Generate Report
            </SecondaryButton>
            <SecondaryButton
              onClick={onRestart}
              className="h-14 min-w-[170px] justify-center text-base"
            >
              <RotateCcw className="h-4 w-4" />
              New Analysis
            </SecondaryButton>
          </div>
        </div>

        {isApproved ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-100">Clinician sign-off complete</p>
                <p className="mt-2 text-sm text-emerald-50/80">
                  The case has been approved for clinical use. The report can now be shared as a
                  conference-ready summary or patient chart attachment.
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </SurfaceCard>

      <AnimatePresence>
        {showReport ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-6 backdrop-blur-md"
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900/88 shadow-[0_32px_100px_-32px_rgba(15,23,42,0.98)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Generated Report</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-50">Orthodontic AI Clinical Summary</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Structured investor-demo style report with diagnosis, duration, and explainability.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReport(false)}
                  className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-slate-300 transition-colors hover:border-slate-600 hover:text-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
                <ReportSection
                  title="Patient Overview"
                  rows={[
                    ['Patient', patientData.name],
                    ['Demographics', `${patientData.age} years / ${patientData.sex}`],
                    ['Date', reportDate],
                    ['Workflow', 'Orthodontic AI decision support'],
                  ]}
                />
                <ReportSection
                  title="AI Findings"
                  rows={[
                    ['Primary diagnosis', predictions.dsdPredictions[0].label],
                    ['Treatment duration', `${predictions.tdpsDuration} months`],
                    ['Model confidence', '89.2%'],
                    ['Top SHAP feature', predictions.shapFeatures[0].feature],
                  ]}
                />
                <ReportSection
                  title="Treatment Recommendation"
                  rows={[
                    ['Approach', 'Non-extraction fixed mechanotherapy'],
                    ['Appliance', '0.022 inch slot appliance system'],
                    ['Complexity', 'Moderate plus'],
                    ['Retention strategy', 'Extended retention and habit management'],
                  ]}
                />
                <ReportSection
                  title="Governance Note"
                  rows={[
                    ['Clinician status', isApproved ? 'Approved' : 'Pending clinician approval'],
                    ['Safeguard', 'Final plan requires orthodontist confirmation'],
                    ['Explainability', 'SHAP summary attached'],
                    ['Use case', 'Conference demo / clinical review / investor showcase'],
                  ]}
                />
              </div>

              <div className="border-t border-slate-800 px-6 py-5">
                <p className="text-sm text-slate-400">
                  This report is designed for clinical decision support. Recommendations must always
                  be reviewed by a qualified orthodontist before implementation.
                </p>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-base font-medium text-slate-100">{value}</p>
    </div>
  );
}

function DiagnosisLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-base text-slate-100">{value}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
      {label}
    </span>
  );
}

function ReportSection({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/55 p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">{title}</p>
      <div className="mt-4 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3 last:border-b-0 last:pb-0">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="max-w-[60%] text-right text-sm font-medium text-slate-100">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
