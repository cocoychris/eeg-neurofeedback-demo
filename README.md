# 使用傅立葉轉換 分析腦波頻譜 並 建立視覺化回饋

※ 這是一個尚未完成的專案。受限於本次較緊迫的執行時間，僅實作了部分的功能。若有機會能有更充裕的時間。會將此專案完善後提交。

## 專案進度

- [v] 充分閱讀文件及觀看[影片](https://www.youtube.com/watch?v=7VQCj7_oAao)了解 EEG neurofeedback therapy 的基本概念
- [v] 研究傅立葉轉換的原理，尋找適當套件並實作轉換函數
  - 由於 Brainbit 並未提供 Node.js (TypeScript) 版本的 SDK 套件，因此決定自行實作
  - 自行實作的 SDK 套件請見： [frequency-sdk.ts](./src/frequency-sdk.ts)
- [v] 以 Socket.io 串接，接收來源 EEG 資料
- [v] 將 EEG 資料進行傅立葉轉換。取得位於 Theta 及 Alpha 等不同波段的能量值(強度)
- [v] 建立可供比較的 Theta (及 Alpha 等) Sine 理論波形，與實際波型比較以算出比較值
  - 請見 [index.ts](./src/index.ts) 中的實作
- [未完成] 將算出的比較值轉為視覺化的圖形顯示，以提供使用者即時回饋
- [未完成] 將取得的資料以有效率的方式傳送並儲存於後端伺服器

※ 如欲運行此專案，請參考後面的安裝及執行方式

## 補充資料

雖然專案尚未完成，但您可透過以下補充資料了解我實作遊戲化回饋機制的能力：

1. 我過去的遊戲作品

- 《拯救婚禮大作戰》[YouTube 遊玩影片](https://www.youtube.com/watch?v=Pczn3wK7Za4)
- 《警匪追逐》[YouTube 遊玩影片](https://www.youtube.com/watch?v=4Q0rJBbIV5o)

2. 我的網站 (andrash.dev)[https://andrash.dev/]

- 一個遊戲化的網站。必須操縱遊戲腳色在畫面中移動才能瀏覽網站。
- 以 React.js 建構渲染引擎，且未使用任何第三方遊戲引擎或框架
- 以 Socket.io 建構多人連線功能，可與朋友連線並看見彼此腳色在網站中移動

## 安裝及執行方式
1. 從 GitHub 上下載此專案。或執行：
```bash
git clone https://github.com/cocoychris/eeg-neurofeedback-demo.git
```

2. 安裝 - 進入專案資料夾，執行：
```bash
npm i
```

3. 執行專案
```bash
npm run dev
```

4. 現在你會在 console (終端機) 看到 EEG 資料的傅立葉轉換結果。但目前尚未實作視覺化回饋功能。
```
ratio: 0.14722339064352905  mag: 613.1538351168836  tmag: 4164.78544908335
```
其中：
- `ratio` 代表 `實際資料 Theta 波強度` 除以 `理論 Theta 正弦波的強度` 的比值。
- `mag` 代表 `實際資料 Theta 波強度`。
- `tmag` 代表 `理論 Theta 正弦波的強度`。因為是預先計算的固定值，故不會變化。
