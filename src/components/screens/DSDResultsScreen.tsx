import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  PrimaryButton,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';
import { cx } from '../ui/dashboardStyles';
import type { DSDPrediction } from '../../types';

interface DSDResultsScreenProps {
  predictions: DSDPrediction[];
  onContinue: () => void;
}

const predictionNotes: Record<string, string> = {
  'Class I Malocclusion': 'Primary diagnosis supported by molar base and cephalometric harmony.',
  'Class II Division 1': 'Incisor inclination and soft-tissue profile indicate sagittal compensation.',
  'Horizontal Growth Pattern': 'Vertical control metrics favor a restrained lower facial growth tendency.',
  'Non-Extraction Treatment': 'Arch relationships and crowding profile favor conservative mechanics.',
};

export default function DSDResultsScreen({ predictions, onContinue }: DSDResultsScreenProps) {
  const topPrediction = predictions[0];
  const averageConfidence = Math.round(
    predictions.reduce((total, prediction) => total + prediction.confidence, 0) / predictions.length,
  );

  return (
    <PageLayout
      screen="dsd"
      eyebrow="Diagnostic Support"
      title="DSD Classification Results"
      subtitle="Structured diagnosis output from the orthodontic decision support model"
      icon={BarChart3}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBadge label="Top Diagnosis" value={topPrediction.label} tone="sky" />
          <MetricBadge label="Avg Confidence" value={`${averageConfidence}%`} tone="green" />
          <MetricBadge label="Review State" value="Ready for TDPS" />
        </div>
      }
    >
      <SurfaceCard className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionTitle
              eyebrow="Primary Outcome"
              title={topPrediction.label}
              description="The AI model identifies a Class I base with a strong secondary Class II Division 1 signature, informing both treatment selection and complexity scoring."
            />
            <div className="mt-6 rounded-3xl border border-slate-700 bg-slate-950/60 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Primary confidence</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="mono text-5xl font-semibold text-sky-200">{topPrediction.confidence}%</span>
                    <span className="pb-2 text-base text-slate-400">high-confidence clinical match</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-sky-300/80">Decision summary</p>
                  <p className="mt-2 text-sm text-slate-100">
                    Diagnostic features align with a non-extraction treatment direction.
                  </p>
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${topPrediction.confidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <SurfaceCard className="p-5" hover={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-emerald-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Diagnostic guardrails</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Output packaged for downstream duration and explainability models.
                  </p>
                </div>
              </div>
            </SurfaceCard>
            <SurfaceCard className="p-5" hover={false}>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-3 text-sky-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Clinical narrative</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Incisor proclination and sagittal pattern drive the treatment mechanics plan.
                  </p>
                </div>
              </div>
            </SurfaceCard>
            <PrimaryButton onClick={onContinue} className="h-14 w-full justify-center text-base">
              Continue to TDPS Analysis
              <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </div>
      </SurfaceCard>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {predictions.map((prediction, index) => (
          <SurfaceCard key={prediction.label} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Prediction {index + 1}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-50">{prediction.label}</h2>
                <p className="mt-2 text-base text-slate-400">
                  {predictionNotes[prediction.label] ?? 'AI confidence mapped to the current clinical record.'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Confidence</p>
                <p className="mono mt-1 text-2xl font-semibold text-sky-200">{prediction.confidence}%</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 0.85, delay: index * 0.08, ease: 'easeOut' }}
                  className={cx(
                    'h-full rounded-full',
                    prediction.confidence >= 90
                      ? 'bg-gradient-to-r from-emerald-400 to-sky-400'
                      : prediction.confidence >= 80
                        ? 'bg-gradient-to-r from-sky-400 to-blue-500'
                        : 'bg-gradient-to-r from-amber-400 to-sky-400',
                  )}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                  {prediction.confidence >= 90 ? 'Primary match' : prediction.confidence >= 80 ? 'Secondary signal' : 'Supportive finding'}
                </span>
                <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                  Investor-demo ready insight
                </span>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-400">Model Confidence</p>
          <p className="mono mt-3 text-4xl font-semibold text-slate-50">{averageConfidence}%</p>
          <p className="mt-2 text-sm text-slate-400">Average confidence across all diagnostic classes.</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-400">Classification Accuracy</p>
          <p className="mono mt-3 text-4xl font-semibold text-slate-50">96.1%</p>
          <p className="mt-2 text-sm text-slate-400">Internal validation benchmark for the deployed classifier.</p>
        </SurfaceCard>
        <SurfaceCard className="p-5">
          <p className="text-sm text-slate-400">AI Reliability</p>
          <p className="mt-3 text-4xl font-semibold text-slate-50">High</p>
          <p className="mt-2 text-sm text-slate-400">Output quality supports clinician-facing treatment planning.</p>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
