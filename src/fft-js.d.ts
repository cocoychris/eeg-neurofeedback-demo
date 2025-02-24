declare module "fft-js" {
  export interface ComplexNumber {
    real: number;
    imag: number;
  }

  export function fft(signal: number[]): ComplexNumber[];
  export function fft(signal: ComplexNumber[]): ComplexNumber[];

  export namespace util {
    export function fftMag(complexSpectrum: ComplexNumber[]): number[];
  }
}
