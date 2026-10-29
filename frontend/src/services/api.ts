import type {
  DatasetOverview,
  SegmentProfile,
  EvaluationResponse,
  VisualizationResponse,
  PredictRequest,
  PredictResponse,
} from '../types/api';

export const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchOverview(): Promise<DatasetOverview> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) {
    throw new Error(`Failed to load dataset overview: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSegments(): Promise<SegmentProfile[]> {
  const res = await fetch(`${API_BASE}/segments`);
  if (!res.ok) {
    throw new Error(`Failed to load segment profiles: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchEvaluation(): Promise<EvaluationResponse> {
  const res = await fetch(`${API_BASE}/evaluation`);
  if (!res.ok) {
    throw new Error(`Failed to load evaluation metrics: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchVisualization(sampleLimit: number = 1000): Promise<VisualizationResponse> {
  const res = await fetch(`${API_BASE}/visualization?sample_limit=${sampleLimit}`);
  if (!res.ok) {
    throw new Error(`Failed to load visualization data: ${res.statusText}`);
  }
  return res.json();
}

export async function predictPersonality(data: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const detail = errorData.detail;
    throw new Error(typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((item: { msg: string }) => item.msg).join("; ") : `Prediction failed: ${res.statusText}`);
  }
  return res.json();
}
