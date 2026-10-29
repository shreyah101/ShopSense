import type {
  DatasetOverview,
  SegmentProfile,
  EvaluationResponse,
  VisualizationResponse,
  PredictRequest,
  PredictResponse,
} from '../types/api';

import fallbackData from '../data/fallbackData.json';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      signal: AbortSignal.timeout(3000),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return (await res.json()) as T;
    }
  } catch {
    // If backend is offline or returns HTML (Vercel SPA rewrite), seamlessly fallback
  }
  return null;
}

export async function fetchOverview(): Promise<DatasetOverview> {
  const remote = await safeFetch<DatasetOverview>('/overview');
  if (remote) return remote;

  const a = fallbackData.audit;
  return {
    total_customers: a.unique_customers,
    total_revenue_gbp: a.total_revenue_gbp,
    total_orders: a.total_orders,
    total_raw_rows: a.raw_rows,
    total_clean_rows: a.total_clean_rows,
    retention_rate_pct: a.retention_rate_pct,
    discovered_segments_count: fallbackData.profiles.length,
    time_period_start: a.min_date,
    time_period_end: a.max_date,
    reference_date: a.reference_date,
    cleaning_steps: a.steps,
  };
}

export async function fetchSegments(): Promise<SegmentProfile[]> {
  const remote = await safeFetch<SegmentProfile[]>('/segments');
  if (remote) return remote;
  return fallbackData.profiles as SegmentProfile[];
}

export async function fetchEvaluation(): Promise<EvaluationResponse> {
  const remote = await safeFetch<EvaluationResponse>('/evaluation');
  if (remote) return remote;
  return fallbackData.metrics as unknown as EvaluationResponse;
}

export async function fetchVisualization(sampleLimit: number = 5000): Promise<VisualizationResponse> {
  const remote = await safeFetch<VisualizationResponse>(`/visualization?sample_limit=${sampleLimit}`);
  if (remote) return remote;

  const clusters = fallbackData.profiles.map((p) => ({
    cluster_id: p.cluster_id,
    name: p.name,
    badge: p.badge,
    color: p.color,
    count: p.count,
    percentage: p.percentage,
  }));

  return {
    total_customers: fallbackData.audit.unique_customers,
    pca_explained_variance_ratio: fallbackData.metrics.pca_explained_variance_ratio,
    total_points: fallbackData.points.length,
    pca_variance_pct: fallbackData.metrics.pca_total_variance_pct,
    points: fallbackData.points,
    clusters,
  };
}

export async function predictPersonality(data: PredictRequest): Promise<PredictResponse> {
  const remote = await safeFetch<PredictResponse>('/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (remote) return remote;

  // Exact client-side K-Means prediction using fitted model parameters
  const { recency, frequency, monetary } = data;
  const isOutlier = recency > 375 || frequency > 210 || monetary > 285000;
  const outlierWarning = isOutlier
    ? 'Input values exceed historical training distribution bounds.'
    : undefined;

  // Log1p transformation & StandardScaler
  const mean = fallbackData.scaler_mean;
  const scale = fallbackData.scaler_scale;
  const xLog = [
    Math.log1p(Math.max(recency, 0)),
    Math.log1p(Math.max(frequency, 0)),
    Math.log1p(Math.max(monetary, 0)),
  ];
  const xScaled = [
    (xLog[0] - mean[0]) / scale[0],
    (xLog[1] - mean[1]) / scale[1],
    (xLog[2] - mean[2]) / scale[2],
  ];

  // Nearest Centroid Euclidean Distance
  const centers = fallbackData.cluster_centers;
  let bestCluster = 0;
  let minDistance = Infinity;
  for (let c = 0; c < centers.length; c++) {
    const center = centers[c];
    const dist =
      Math.pow(xScaled[0] - center[0], 2) +
      Math.pow(xScaled[1] - center[1], 2) +
      Math.pow(xScaled[2] - center[2], 2);
    if (dist < minDistance) {
      minDistance = dist;
      bestCluster = c;
    }
  }

  const profile =
    fallbackData.profiles.find((p) => p.cluster_id === bestCluster) ||
    fallbackData.profiles[0];

  const rMed = profile.Recency_median;
  const fMed = profile.Frequency_median;
  const mMed = profile.Monetary_median;

  const rComp =
    recency < rMed
      ? 'More recent than typical'
      : recency === rMed
      ? 'Similar to segment median'
      : 'Less recent than typical';
  const fComp =
    frequency > fMed
      ? 'Higher order count than median'
      : frequency === fMed
      ? 'Matches segment median'
      : 'Lower order count than median';
  const mRatio = mMed > 0 ? monetary / mMed : 1.0;
  const mComp = `${mRatio.toFixed(1)}x of segment median spend (£${mMed.toFixed(2)})`;

  return {
    cluster_id: bestCluster,
    segment_name: profile.name,
    badge: profile.badge,
    color: profile.color,
    description: profile.description,
    business_insight: profile.business_insight,
    characteristics: profile.characteristics,
    input_values: {
      recency,
      frequency,
      monetary,
    },
    cluster_medians: {
      recency: rMed,
      frequency: fMed,
      monetary: mMed,
    },
    comparison: {
      recency_comparison: rComp,
      frequency_comparison: fComp,
      monetary_comparison: mComp,
    },
    is_outlier: isOutlier,
    outlier_warning: outlierWarning,
  };
}
