/**
 * Remote Photoplethysmography (rPPG) Heart Rate Detection
 * Web-based implementation using webcam and JavaScript signal processing
 */

// Bandpass filter using simple IIR implementation
export function bandpassFilter(signal: number[], lowCut: number = 0.7, highCut: number = 4.0, fs: number = 30): number[] {
  const filtered: number[] = [];
  const dt = 1 / fs;
  const RC_low = 1 / (2 * Math.PI * lowCut);
  const RC_high = 1 / (2 * Math.PI * highCut);
  const alpha_low = dt / (RC_low + dt);
  const alpha_high = RC_high / (RC_high + dt);
  
  let lowPrev = signal[0] || 0;
  let highPrev = 0;
  
  for (let i = 0; i < signal.length; i++) {
    // Low-pass filter
    lowPrev = lowPrev + alpha_low * (signal[i] - lowPrev);
    // High-pass filter
    const highFiltered = alpha_high * (highPrev + signal[i] - (i > 0 ? signal[i - 1] : signal[i]));
    highPrev = highFiltered;
    filtered.push(lowPrev * highFiltered);
  }
  
  return filtered;
}

// Smooth signal using moving average
export function smoothSignal(signal: number[], windowSize: number = 5): number[] {
  const result: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(signal.length - 1, i + halfWindow); j++) {
      sum += signal[j];
      count++;
    }
    result.push(sum / count);
  }
  
  return result;
}

// Normalize signal (zero mean, unit variance)
export function normalizeSignal(signal: number[]): number[] {
  const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
  const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
  const std = Math.sqrt(variance) || 1;
  return signal.map(x => (x - mean) / std);
}

// CHROM method for extracting pulse signal from RGB values
export function extractRppgChrom(rgbBuffer: { r: number; g: number; b: number }[]): number[] {
  const r = rgbBuffer.map(x => x.r);
  const g = rgbBuffer.map(x => x.g);
  const b = rgbBuffer.map(x => x.b);
  
  // CHROM algorithm
  const X: number[] = [];
  const Y: number[] = [];
  
  for (let i = 0; i < rgbBuffer.length; i++) {
    X.push(3 * r[i] - 2 * g[i]);
    Y.push(1.5 * r[i] + g[i] - 1.5 * b[i]);
  }
  
  // Compute S = X - Y
  const S = X.map((x, i) => x - Y[i]);
  
  // Normalize
  return normalizeSignal(S);
}

// Find peaks in signal
export function findPeaks(signal: number[], minDistance: number = 10, threshold: number = 0.2): number[] {
  const peaks: number[] = [];
  
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1] && signal[i] > threshold) {
      if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
        peaks.push(i);
      }
    }
  }
  
  return peaks;
}

// Estimate heart rate from signal
export function estimateHeartRate(signal: number[], fps: number = 30): { bpm: number; confidence: string; valid: boolean } {
  if (signal.length < fps * 3) {
    return { bpm: 0, confidence: 'low', valid: false };
  }
  
  // Apply bandpass filter
  const filtered = bandpassFilter(signal, 0.7, 4.0, fps);
  const smoothed = smoothSignal(filtered);
  const normalized = normalizeSignal(smoothed);
  
  // Check signal quality
  const std = Math.sqrt(normalized.reduce((a, b) => a + b * b, 0) / normalized.length);
  if (std < 0.15) {
    return { bpm: 0, confidence: 'low', valid: false };
  }
  
  // Find peaks
  const minPeakDistance = Math.floor(fps / 2.5); // Max 150 bpm
  const peaks = findPeaks(normalized, minPeakDistance, 0.2);
  
  if (peaks.length >= 2) {
    // Calculate BPM from peak intervals
    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round((fps / avgInterval) * 60);
    
    if (bpm >= 40 && bpm <= 180) {
      const confidence = peaks.length >= 5 ? 'high' : peaks.length >= 3 ? 'medium' : 'low';
      return { bpm, confidence, valid: true };
    }
  }
  
  // Fallback to FFT method
  const bpmFromFft = estimateHeartRateFFT(normalized, fps);
  return bpmFromFft;
}

// FFT-based heart rate estimation (fallback)
function estimateHeartRateFFT(signal: number[], fps: number): { bpm: number; confidence: string; valid: boolean } {
  const n = signal.length;
  const paddedLength = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...signal, ...new Array(paddedLength - n).fill(0)];
  
  // Simple DFT (for small signals)
  const real: number[] = [];
  const imag: number[] = [];
  
  for (let k = 0; k < paddedLength; k++) {
    let sumReal = 0;
    let sumImag = 0;
    for (let t = 0; t < paddedLength; t++) {
      const angle = (2 * Math.PI * k * t) / paddedLength;
      sumReal += padded[t] * Math.cos(angle);
      sumImag -= padded[t] * Math.sin(angle);
    }
    real.push(sumReal);
    imag.push(sumImag);
  }
  
  // Calculate magnitudes
  const magnitudes = real.map((r, i) => Math.sqrt(r * r + imag[i] * imag[i]));
  
  // Find peak in heart rate range (40-180 BPM = 0.67-3.0 Hz)
  const freqResolution = fps / paddedLength;
  const minBin = Math.floor(0.67 / freqResolution);
  const maxBin = Math.ceil(3.0 / freqResolution);
  
  let maxMag = 0;
  let maxBin2 = minBin;
  for (let i = minBin; i <= maxBin && i < magnitudes.length / 2; i++) {
    if (magnitudes[i] > maxMag) {
      maxMag = magnitudes[i];
      maxBin2 = i;
    }
  }
  
  const peakFreq = maxBin2 * freqResolution;
  const bpm = Math.round(peakFreq * 60);
  
  if (bpm >= 40 && bpm <= 180) {
    return { bpm, confidence: 'medium', valid: true };
  }
  
  return { bpm: 0, confidence: 'low', valid: false };
}

// Check lighting quality
export function isLightingGood(brightness: number): boolean {
  return brightness > 50 && brightness < 200;
}

// Calculate average brightness from image data
export function calculateBrightness(imageData: ImageData): number {
  const data = imageData.data;
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Use luminance formula
    sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return sum / (data.length / 4);
}

// Extract average RGB from face ROI
export function extractRgbFromRoi(imageData: ImageData): { r: number; g: number; b: number } {
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  
  return {
    r: r / pixelCount,
    g: g / pixelCount,
    b: b / pixelCount,
  };
}
