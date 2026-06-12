const BASE_SPEED = 0.5;
const SPEED_MULTIPLIER = 1.5;

export function calculateScrollSpeed(speedLevel: number): number {
  const clampedSpeed = Math.max(1, Math.min(10, speedLevel));
  return BASE_SPEED * Math.pow(SPEED_MULTIPLIER, clampedSpeed - 1);
}

export function formatProgress(current: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
