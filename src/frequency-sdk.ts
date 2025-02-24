import { fft, util } from "fft-js";

/**
 * Service for calculating the magnitude of a frequency band in a signal.
 *
 * This service is created by Andrash Yang (cocoychris@gmail.com).
 * Google Gemini is used to assist in the development of this service.
 *
 * This project is published for research purposes only. Any commercial use is prohibited.
 */
export class FrequencySDK {
  /**
   * Calculate the magnitude of a frequency band in a signal.
   * @param signalData An array of float numbers representing the signal data.
   * @param sampleRate  The sample rate of the sound data in Hz.
   * @param lowerFrequency The lower frequency of the band in Hz.
   * @param upperFrequency The upper frequency of the band in Hz.
   * @param useWindowing Optional. If true, applies a Hamming window. Defaults to true.
   * @returns The magnitude within the specified frequency band.
   */
  public calculateBandMagnitude(
    signalData: number[],
    sampleRate: number,
    lowerFrequency: number,
    upperFrequency: number,
    useWindowing: boolean = true
  ): number {
    /**
     * The Nyquist-Shannon sampling theorem states that to accurately reconstruct a signal,
     * the sampling rate must be at least twice the highest frequency component present in the signal.
     * In other words, the highest frequency you can reliably capture is half the sampling rate.
     */
    const nyquistFrequency = sampleRate / 2;
    // Error handling
    if (
      lowerFrequency < 1 ||
      upperFrequency > nyquistFrequency ||
      lowerFrequency > upperFrequency
    ) {
      throw new Error("Invalid frequency range.");
    }
    const minDataLength = Math.ceil(sampleRate / lowerFrequency);
    if (signalData.length < minDataLength) {
      throw new Error(
        "Signal data length is insufficient to resolve the target frequency band."
      );
    }

    // Apply Hamming window if needed
    const data = useWindowing
      ? this._applyHammingWindow(signalData)
      : signalData;

    // Perform FFT
    const complexSpectrum = fft(data);
    const magnitudes = util.fftMag(complexSpectrum);

    // Calculate frequency bins
    const frequencyResolution = sampleRate / data.length;

    // Map frequencies to bin indices
    const binIndex1 = Math.round(lowerFrequency / frequencyResolution);
    const binIndex2 = Math.round(upperFrequency / frequencyResolution);

    // Calculate magnitude within the band
    let bandMagnitude = 0;
    for (let i = binIndex1; i <= binIndex2; i++) {
      bandMagnitude += magnitudes[i];
    }

    return bandMagnitude;
  }

  /**
   * Normalize the magnitude of a frequency band in a signal.
   *
   * If bandMagnitude is greater than maxBandMagnitude, the normalized magnitude will be 1.
   * @param bandMagnitude The magnitude of the frequency band.
   * @param maxBandMagnitude The maximum magnitude of the frequency band.
   * @returns The normalized magnitude ranging from 0 to 1.
   */
  public normalize(bandMagnitude: number, maxBandMagnitude: number): number {
    if (maxBandMagnitude === 0) {
      return 0; // Avoid division by zero
    }
    return Math.min(bandMagnitude, maxBandMagnitude) / maxBandMagnitude;
  }

  /**
   * Generate a sine wave signal.
   *
   * Useful for calculating theoretical max band magnitude
   * @param maxAmplitude
   * @param dataLength
   * @param sampleRate
   * @param frequency
   * @returns
   */
  public generateSineWaveSignal(
    maxAmplitude: number,
    dataLength: number,
    sampleRate: number,
    frequency: number
  ): number[] {
    const time = Array.from({ length: dataLength }, (_, i) => i / sampleRate);
    return time.map(
      (t) => Math.sin(2 * Math.PI * frequency * t) * maxAmplitude
    );
  }

  /**
   * Applies a Hamming window to the input data for spectral leakage reduction.
   *
   * The Hamming window's shape tapers off towards the edges of the data window.
   *
   * This means:
   * - Data points in the center of the window are given more weight.
   * - Data points at the beginning and end are given less weight.
   * @param {number[]} data - The input data.
   * @returns {number[]} - The windowed data.
   */
  private _applyHammingWindow(data: number[]): number[] {
    const window = hammingWindow(data.length);
    return data.map((value, index) => value * window[index]);
  }
}

function hammingWindow(length: number): number[] {
  const window: number[] = new Array(length);
  for (let n = 0; n < length; n++) {
    window[n] = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (length - 1));
  }
  return window;
}
