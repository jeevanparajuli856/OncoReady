import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  MlCheckpointName,
  MlFactor,
  parseMlInsights,
  savedMlInsightsArtifact,
} from '../data/mlInsights';

interface ReadinessInsightsProps {
  artifact?: unknown;
}

const FEATURE_LABELS: Record<string, string> = {
  transport_available: 'Transportation available',
  callback_requested: 'Supportive callback requested',
  unresolved_barriers: 'Unresolved practical barriers',
  hours_to_treatment: 'Hours to treatment',
};

const formatFeatureValue = (feature: string, value: number): string => {
  if (feature === 'transport_available' || feature === 'callback_requested') return value === 1 ? 'Yes' : 'No';
  if (feature === 'hours_to_treatment') return `${value} hours`;
  return String(value);
};

const FactorList: React.FC<{
  checkpoint: MlCheckpointName;
  factors: MlFactor[];
  suggestion: string;
}> = ({ checkpoint, factors, suggestion }) => (
  <div
    id={`ml-factors-${checkpoint.toLowerCase()}`}
    role="region"
    aria-label={`${checkpoint} factors`}
    className="mt-3 pt-3 border-t border-line space-y-3"
  >
    {factors.length > 0 ? (
      <ul className="space-y-2">
        {factors.map((factor) => {
          const DirectionIcon = factor.direction === 'higher' ? ArrowUpRight : ArrowDownRight;
          return (
            <li key={`${checkpoint}-${factor.feature}`} className="flex items-start gap-2 text-sm">
              <DirectionIcon className="w-4 h-4 mt-0.5 text-accent shrink-0" aria-hidden="true" />
              <span>
                <strong className="font-heading">{FEATURE_LABELS[factor.feature] ?? factor.feature}</strong>
                {`: ${formatFeatureValue(factor.feature, factor.featureValue)} · associated with ${factor.direction} model output`}
              </span>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-sm text-muted-fg">No exported factors are available for this checkpoint.</p>
    )}
    <div className="rounded-xl border border-line bg-muted/70 p-3">
      <p className="label-caps">Workflow suggestion · not model-derived</p>
      <p className="text-sm mt-1">{suggestion}</p>
    </div>
  </div>
);

const displayModelVersion = (version: string) => version.replace(/^synthetic-/, '');

export const ReadinessInsights: React.FC<ReadinessInsightsProps> = ({
  artifact = savedMlInsightsArtifact,
}) => {
  const result = useMemo(() => parseMlInsights(artifact), [artifact]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<MlCheckpointName>('T-7');
  const [expandedCheckpoint, setExpandedCheckpoint] = useState<MlCheckpointName | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'baseline' | 'transportation_available'>('baseline');
  const [announcement, setAnnouncement] = useState('');

  if (result.status === 'unavailable') {
    return (
      <section className="card-sticker p-6 space-y-3" role="alert" aria-labelledby="ml-unavailable-title">
        <AlertTriangle className="w-6 h-6 text-sun" aria-hidden="true" />
        <div>
          <h2 id="ml-unavailable-title" className="font-heading font-bold">Insights unavailable</h2>
          <p className="text-sm text-muted-fg mt-1">
            Readiness model output could not be verified. The staff workflow remains available in the other case tabs.
          </p>
          <p className="text-xs text-muted-fg mt-2">Evidence check: {result.reason}</p>
        </div>
      </section>
    );
  }

  const { data } = result;
  const comparison = data.whatIf;
  const selectedComparison = comparisonMode === 'baseline'
    ? comparison?.baseline
    : comparison?.transportationAvailable;

  const selectCheckpoint = (checkpoint: MlCheckpointName, score: number) => {
    setSelectedCheckpoint(checkpoint);
    setAnnouncement(`${checkpoint} saved model output ${score} selected`);
  };

  const toggleFactors = (checkpoint: MlCheckpointName, score: number) => {
    selectCheckpoint(checkpoint, score);
    setExpandedCheckpoint((current) => current === checkpoint ? null : checkpoint);
  };

  const selectComparison = (mode: 'baseline' | 'transportation_available') => {
    setComparisonMode(mode);
    setAnnouncement(
      mode === 'baseline'
        ? 'Actual comparison row selected'
        : 'Transportation available comparison selected',
    );
  };

  return (
    <div className="space-y-5">
      <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="ml-trajectory-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="icon-bubble w-10 h-10 bg-accent/15 text-accent">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <span className="chip chip-accent mb-2">Readiness model</span>
              <h2 id="ml-trajectory-title" className="font-heading font-extrabold text-lg">Saved readiness trajectory</h2>
              <p className="text-sm text-muted-fg mt-1 max-w-3xl">
                Supports staff review; does not determine clinical urgency, treatment eligibility, or workflow closure.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="label-caps">Model version</p>
            <p className="font-mono text-xs mt-1">{displayModelVersion(data.modelVersion)}</p>
          </div>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start" aria-label="Saved model checkpoints">
          {data.checkpoints.map((checkpoint) => {
            const selected = selectedCheckpoint === checkpoint.checkpoint;
            const expanded = expandedCheckpoint === checkpoint.checkpoint;
            return (
              <li
                key={checkpoint.checkpoint}
                className={`metric-tile min-w-0 ${selected ? 'ring-2 ring-accent/30' : ''}`}
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${checkpoint.checkpoint} saved model score ${checkpoint.score}`}
                  onClick={() => selectCheckpoint(checkpoint.checkpoint, checkpoint.score)}
                  className="w-full text-left rounded-lg"
                >
                  <span className="label-caps">{checkpoint.checkpoint} checkpoint</span>
                  <span className="block font-display text-2xl font-extrabold tabular-nums mt-1">{checkpoint.score}</span>
                  <span className="block text-xs text-muted-fg">Saved model score</span>
                </button>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`ml-factors-${checkpoint.checkpoint.toLowerCase()}`}
                  aria-label={`Why flagged at ${checkpoint.checkpoint}?`}
                  onClick={() => toggleFactors(checkpoint.checkpoint, checkpoint.score)}
                  className="btn-ghost btn-compact w-full mt-3"
                >
                  Why flagged?
                </button>
                {expanded && (
                  <FactorList
                    checkpoint={checkpoint.checkpoint}
                    factors={checkpoint.factors}
                    suggestion={checkpoint.suggestedNextAction.text}
                  />
                )}
              </li>
            );
          })}
        </ol>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
      </section>

      <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="ml-evidence-title">
        <div>
          <p className="label-caps">Inspectable offline evidence</p>
          <h2 id="ml-evidence-title" className="font-heading font-bold flex items-center gap-2 mt-1">
            <BarChart3 className="w-4 h-4 text-accent" aria-hidden="true" />
            Evaluation and limitations
          </h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="metric-tile">
            <dt className="label-caps">Held-out model accuracy</dt>
            <dd className="font-display text-xl font-extrabold mt-1">{(data.evaluation.modelAccuracy * 100).toFixed(1)}%</dd>
          </div>
          <div className="metric-tile">
            <dt className="label-caps">Majority baseline</dt>
            <dd className="font-display text-xl font-extrabold mt-1">{(data.evaluation.baselineAccuracy * 100).toFixed(1)}%</dd>
          </div>
          <div className="metric-tile">
            <dt className="label-caps">Held-out validation sample</dt>
            <dd className="font-heading font-bold mt-1">{data.evaluation.testPatients.toLocaleString()} patients</dd>
            <dd className="text-xs text-muted-fg">{data.evaluation.testRows.toLocaleString()} checkpoint rows</dd>
          </div>
        </dl>
        <ul className="list-disc pl-5 text-sm text-muted-fg space-y-1">
          {data.limitations.filter((limitation) => !/synthetic/i.test(limitation)).map((limitation) => <li key={limitation}>{limitation}</li>)}
        </ul>
      </section>

      <section className="card-sticker p-5 sm:p-6 space-y-4" aria-labelledby="transport-comparison-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-caps">Saved two-state sensitivity</p>
            <h2 id="transport-comparison-title" className="font-heading font-bold mt-1">Transportation what-if</h2>
            <p className="text-sm text-muted-fg mt-1 max-w-3xl">
              Comparison only: transportation availability is the single changed input. The actual case, plan, graph, tasks, outreach, and acknowledgments stay unchanged.
            </p>
          </div>
          {comparison && <span className="chip">Same model · {displayModelVersion(comparison.modelVersion)}</span>}
        </div>

        {comparison && selectedComparison ? (
          <>
            <div role="group" aria-label="Transportation comparison state" className="flex flex-col sm:flex-row gap-1 p-1 rounded-xl bg-white/95 border border-line shadow-glass w-full sm:w-fit">
              <button
                type="button"
                aria-pressed={comparisonMode === 'baseline'}
                onClick={() => selectComparison('baseline')}
                className={`filter-pill flex-1 ${comparisonMode === 'baseline' ? 'filter-pill-active' : ''}`}
              >
                Actual comparison · model score {comparison.baseline.score}
              </button>
              <button
                type="button"
                aria-pressed={comparisonMode === 'transportation_available'}
                onClick={() => selectComparison('transportation_available')}
                className={`filter-pill flex-1 ${comparisonMode === 'transportation_available' ? 'filter-pill-active' : ''}`}
              >
                Transportation available · model score {comparison.transportationAvailable.score}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="metric-tile">
                <p className="label-caps">Selected saved output</p>
                <p className="font-display text-2xl font-extrabold tabular-nums mt-1">{selectedComparison.score}</p>
                <p className="text-xs text-muted-fg">Model score · not a calibrated probability</p>
              </div>
              <div className="metric-tile">
                <p className="label-caps">Saved difference</p>
                <p className="font-display text-2xl font-extrabold tabular-nums mt-1">{comparison.scoreDelta}</p>
                <p className="text-xs text-muted-fg">Saved difference: {comparison.scoreDelta} model-score points · model sensitivity only</p>
              </div>
            </div>
            {comparisonMode !== 'baseline' && (
              <button type="button" onClick={() => selectComparison('baseline')} className="btn-ghost btn-compact">
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Reset comparison
              </button>
            )}
          </>
        ) : (
          <div className="metric-tile flex items-start gap-3" aria-describedby="transport-comparison-unavailable">
            <AlertTriangle className="w-5 h-5 text-sun shrink-0" aria-hidden="true" />
            <div>
              <h3 className="font-heading font-bold">Comparison unavailable</h3>
              <p id="transport-comparison-unavailable" className="text-sm text-muted-fg mt-1">
                Transportation comparison unavailable in the saved model output. Checkpoint insights and the staff workflow remain available.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
