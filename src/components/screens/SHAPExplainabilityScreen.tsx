import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Lightbulb, Microscope } from 'lucide-react';
import {
  MetricBadge,
  PageLayout,
  PrimaryButton,
  SectionTitle,
  SurfaceCard,
} from '../ui/dashboard';
import { cx } from '../ui/dashboardStyles';
import type { ShapFeature } from '../../types';

interface SHAPExplainabilityScreenProps {
  features: ShapFeature[];
  onContinue: () => void;
}

const featureDetails: Record<
  string,
  { summary: string; clinical: string; effect: string; signal: string }
> = {
  'U1-NA Angle': {
    summary: 'Incisor proclination is the strongest contributor to the final recommendation.',
    clinical: 'The upper incisor inclination materially influenced both diagnosis and treatment mechanics.',
    effect: 'High impact on Class II Division 1 characterization.',
    signal: 'Sagittal dental compensation',
  },
  'ANB Angle': {
    summary: 'Skeletal anteroposterior relationship strongly shaped the diagnostic confidence profile.',
    clinical: 'ANB supported a mild discrepancy without shifting the case beyond a Class I skeletal base.',
    effect: 'High impact on skeletal classification stability.',
    signal: 'Skeletal relationship',
  },
  'Tongue Thrust Habit': {
    summary: 'Functional habit increases treatment complexity and retention planning importance.',
    clinical: 'The habit introduces risk for relapse and can prolong finishing requirements.',
    effect: 'Moderate impact on duration and retention strategy.',
    signal: 'Functional modifier',
  },
  'Interincisal Angle': {
    summary: 'Incisor interplay refines the appliance and torque control recommendation.',
    clinical: 'The value supports the need for careful detailing mechanics during finishing.',
    effect: 'Moderate impact on treatment control planning.',
    signal: 'Incisal coupling',
  },
  'Growth Pattern': {
    summary: 'Growth tendency reinforces the vertical control strategy for treatment planning.',
    clinical: 'Horizontal growth reduces vertical risk while favoring certain anchorage choices.',
    effect: 'Supportive impact on mechanics selection.',
    signal: 'Growth behavior',
  },
  'Scissor Bite': {
    summary: 'Transverse discrepancy influences complexity more than diagnosis certainty.',
    clinical: 'It adds targeted correction needs but is not the main diagnostic driver.',
    effect: 'Low-to-moderate impact on finishing complexity.',
    signal: 'Transverse modifier',
  },
};

const barPalette = [
  'from-sky-400 to-blue-500',
  'from-cyan-400 to-sky-500',
  'from-blue-500 to-indigo-500',
  'from-sky-300 to-cyan-500',
  'from-slate-400 to-sky-500',
  'from-slate-500 to-blue-400',
];

export default function SHAPExplainabilityScreen({
  features,
  onContinue,
}: SHAPExplainabilityScreenProps) {
  const [activeFeature, setActiveFeature] = useState(features[0]?.feature ?? '');
  const active = useMemo(
    () => features.find((feature) => feature.feature === activeFeature) ?? features[0],
    [activeFeature, features],
  );

  const maxImportance = Math.max(...features.map((feature) => feature.importance));
  const activeDetails = featureDetails[active.feature] ?? {
    summary: 'This parameter contributes to the overall orthodontic classification profile.',
    clinical: 'Clinical interpretation should be validated against the complete record.',
    effect: 'Supportive model signal.',
    signal: 'Feature driver',
  };

  return (
    <PageLayout
      screen="shap"
      eyebrow="Explainability Layer"
      title="SHAP Explainability Review"
      subtitle="Feature-level reasoning that clarifies why the AI recommended this clinical pathway"
      icon={Microscope}
      rightSlot={
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricBadge label="Top Driver" value={features[0].feature} tone="sky" />
          <MetricBadge label="Model Confidence" value="89.2%" tone="green" />
          <MetricBadge label="Explanation Quality" value="Clinical grade" />
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard className="p-6">
          <SectionTitle
            eyebrow="Feature Importance"
            title="Ranked contribution profile"
            description="Hover across the chart to inspect how each feature shaped the model recommendation."
          />

          <div className="mt-6 space-y-4">
            {features.map((feature, index) => {
              const width = (feature.importance / maxImportance) * 100;
              const selected = active.feature === feature.feature;

              return (
                <motion.button
                  key={feature.feature}
                  type="button"
                  onMouseEnter={() => setActiveFeature(feature.feature)}
                  onFocus={() => setActiveFeature(feature.feature)}
                  whileHover={{ x: 4 }}
                  className={cx(
                    'w-full rounded-2xl border p-4 text-left transition-all',
                    selected
                      ? 'border-sky-400/35 bg-sky-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.12)]'
                      : 'border-slate-700 bg-slate-950/55 hover:border-slate-600',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Rank {index + 1}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-slate-50">{feature.feature}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-right">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Impact</p>
                      <p className="mono mt-1 text-xl font-semibold text-slate-50">
                        {feature.importance}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-900">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${barPalette[index % barPalette.length]}`}
                    />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    {featureDetails[feature.feature]?.summary ??
                      'This clinical parameter contributes to the model decision profile.'}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="p-6">
            <SectionTitle
              eyebrow="Focused Explanation"
              title={active.feature}
              description={activeDetails.summary}
            />

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Clinical interpretation</p>
                <p className="mt-2 text-base text-slate-300">{activeDetails.clinical}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Effect on output</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">{activeDetails.effect}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Signal family</p>
                  <p className="mt-2 text-sm font-medium text-slate-100">{activeDetails.signal}</p>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-sky-400/25 bg-sky-500/10 p-3 text-sky-300">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Clinical interpretation card</p>
                <p className="mt-2 text-sm text-slate-400">
                  The current case is driven primarily by incisor inclination and skeletal AP
                  relationship, while functional habits add complexity rather than changing the core
                  diagnosis.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-sky-300">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">Hover emphasis behavior</p>
                <p className="mt-2 text-sm text-slate-400">
                  The side panel updates on hover to make feature interpretation immediately useful
                  during clinician walkthroughs or demo presentations.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>

      <SurfaceCard className="mt-6 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300/80">Next Step</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Transition to clinician review</h2>
            <p className="mt-2 text-base text-slate-400">
              Deliver the diagnosis, duration, and explainability package into the final clinical
              approval workflow.
            </p>
          </div>
          <PrimaryButton onClick={onContinue} className="h-14 min-w-[220px] justify-center text-base">
            Clinician Review
            <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
