import { FrequencySDK } from "./frequency-sdk";
import { io } from "socket.io-client";

type DataPoint = {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  c6: number;
  c7: number;
  c8: number;
  c9: number;
  c10: number;
  c11: number;
  c12: number;
  c13: number;
  c14: number;
  c15: number;
  c16: number;
  c17: number;
  c18: number;
  c19: number;
};

const socket = io("https://data-simulation.kkhomelab.site");
const frequencyService = new FrequencySDK();

// ==== 手動設置的設定值 ====
// 採樣頻率
const sampleRate = 250;
// 分析頻率範圍 4~8 Hz 為 Theta 波
const lowerFrequency = 4;
const upperFrequency = 8;
// 最大振幅
const maxAmplitude = 40;
// 期望採樣大小(資料長度)，並非實際採樣大小。如果此值低於自動計算的最低有效採樣大小，則不予採用。
const preferSampleSize = 256;
// 每秒採樣次數
const fps = 30;

console.log("sampleRate", sampleRate);
console.log("frequency", lowerFrequency, upperFrequency);
console.log("maxAmplitude", maxAmplitude);
console.log("preferSampleSize", preferSampleSize);
console.log("fps", fps);

// ==== 自動計算出的設定值 ====
// 每次採樣後的資料位移量
const bufferFlushSize = Math.round(sampleRate / fps);
// 自動計算的最低有效採樣大小(資料長度)
const minBufferReadSize = Math.ceil(sampleRate / lowerFrequency);
// 實際採樣大小(資料長度)
const sampleSize = getBufferReadSize(
  Math.max(minBufferReadSize, preferSampleSize)
);
// 緩衝區大小，若緩衝區陣列長度超過此值，則視為溢出
const bufferSize = sampleSize * 2;

console.log("bufferFlushSize", bufferFlushSize);
console.log("minBufferReadSize", minBufferReadSize);
console.log("sampleSize", sampleSize);
console.log("bufferSize", bufferSize);

// ==== 建立頻帶強度的比較基準 ====
// 生成指定頻率的正弦信號資料作為比較基準
const sineWaveData = frequencyService.generateSineWaveSignal(
  maxAmplitude,
  sampleSize,
  sampleRate,
  lowerFrequency
);
// 計算理論上的最大頻帶強度
const theoreticalMaxBandMagnitude = frequencyService.calculateBandMagnitude(
  sineWaveData,
  sampleRate,
  lowerFrequency,
  upperFrequency
);

// ==== 開始接收並處理資料 ====
const buffer: number[] = [];
let maxValue = 0;
const channel = "c1"; // 使用的資料通道

// 接收到資料時的處理函數
socket.on("data", (jsonString) => {
  const data: DataPoint = JSON.parse(jsonString);
  maxValue = Math.max(maxValue, data[channel]);

  // 檢視收到的資料與目前為止的最大值
  // console.log(`value: ${data[channel]} max: ${maxValue}`);

  buffer.push(data[channel]);
  if (buffer.length >= sampleSize) {
    const overflow = Math.max(buffer.length - bufferSize, 0);
    if (overflow > 0) {
      // 用於檢查是否溢出 buffer
      console.log("overflow", overflow);
    }
    // 採樣
    const dataBatch = buffer.slice(0, sampleSize);
    // 位移 buffer 中的資料 (同時會將溢出的部分移除)
    buffer.splice(0, bufferFlushSize + overflow);

    // 計算頻帶強度
    const bandMagnitude = frequencyService.calculateBandMagnitude(
      dataBatch,
      sampleRate,
      lowerFrequency,
      upperFrequency
    );
    // 已轉為 0~1 之間的比率 (與理論最大頻帶強度比較)
    const magnitudeRatio = frequencyService.normalize(
      bandMagnitude,
      theoreticalMaxBandMagnitude
    );
    // 顯示頻帶強度比率 與 頻帶強度
    console.log(
      `ratio: ${magnitudeRatio}\tmag: ${bandMagnitude} \ttmag: ${theoreticalMaxBandMagnitude}`
    );
  }
});
// 開始接收資料
socket.emit("simulation:start");

/**
 * 工具函數：用於計算 buffer 的讀取大小
 *
 * 受限於 fft 的計算方式，buffer 的大小必須是 2 的次方
 * @param minBufferSize 最低的 buffer 大小
 * @returns 2 的次方：2, 4, 8, 16, 32, 64, 128, 256, 512...
 */
function getBufferReadSize(minBufferSize: number): number {
  let readSize = 2;
  while (readSize < minBufferSize) {
    readSize = readSize * 2;
  }
  return readSize;
}
