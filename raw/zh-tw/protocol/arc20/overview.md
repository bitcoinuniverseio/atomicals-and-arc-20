# ARC-20

一頁看完完整的 ARC-20 模型，從發行到配置再到安全邊界，並連結到每一部分的確切規則。

Page ID: protocol/arc20/overview
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: zh-tw
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/zh-tw/protocol/arc20/overview/

---
ARC-20 是 Atomicals 在比特幣上的同質代幣模型。一個單位等於一個著色聰，其餘一切都由此推導而來。

## 七句話說完整個模型

1. 一個單位就是驗證器針對某個代幣認定為著色的輸出中的一個聰。
2. 因此供應量以聰計量，並受真實比特幣的約束。
3. 發行要嘛一次性直接完成，要嘛透過一次部署由他人反覆鑄造。
4. 代號是全域配發的名稱，解析到且僅解析到一個 Atomical。
5. 轉移是對交易輸入與輸出依序進行的配置。
6. 無法放入可用輸出的價值會被銷毀。
7. 著色輸出總額永遠不能超過著色輸入總額。

在建構或簽署任何東西之前，請閱讀[銷毀](/protocol/arc20/burns/)。

## 每條規則在哪裡說明

| 領域 | 頁面 |
| --- | --- |
| 單位模型，以及小數位為何不產生分數 | [單位模型](/protocol/arc20/unit-model/) |
| 代號配發、候選與已驗證勝出者 | [代號與候選](/protocol/arc20/tickers-and-candidates/) |
| 一步發行完整供應量 | [直接發行](/protocol/arc20/direct-issuance/) |
| 鑄造次數固定的部署 | [固定 DFT](/protocol/arc20/fixed-dft/) |
| 針對部署申領一次鑄造 | [去中心化鑄造](/protocol/arc20/decentralized-mint/) |
| 受啟用條件約束的遞進式部署 | [永續 DFT](/protocol/arc20/perpetual-dft/) |
| 對 commit 與 reveal 的工作量要求 | [Bitwork 要求](/protocol/arc20/bitwork-requirements/) |
| 選用中繼資料與顯示用小數位 | [中繼資料與小數位](/protocol/arc20/metadata-and-decimals/) |
| 價值如何放入輸出 | [配置](/protocol/arc20/allocation/) |
| 拆分與合併著色批次 | [拆分與合併](/protocol/arc20/split-and-combine/) |
| 價值如何被銷毀 | [銷毀](/protocol/arc20/burns/) |
| 移動代幣與原子化交換 | [轉移與互換](/protocol/arc20/transfers-and-swaps/) |
| PSBT 必須包含什麼 | [PSBT 要求](/protocol/arc20/psbt-requirements/) |
| 錢包要做到什麼才算安全 | [錢包安全](/protocol/arc20/wallet-safety/) |
| Substantiation Factor 資料的狀態 | [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

## ARC-20 不是什麼

- 它不是 ERC-20 合約。既沒有合約，也沒有帳戶。
- 它不是銘文餘額。價值是輸出的聰面額，而不是寫在文字裡的一個數字。
- 它不是對任何事物的請求權。除非另有法律安排，否則沒有任何東西為一個單位背書，而鑄造本身也不會
  建立這種安排。
- 它不是 ARC-721 標準。審閱中未找到任何確立該標準的官方來源。

## Universe 產品邊界

協定支援直接 `mint-ft` 發行。目前沒有任何 Universe 產品介面提供它。Universe 提供的是已驗證代號
解析、代幣詳情、持有者、已確認活動、投資組合餘額、著色 UTXO，以及 Marketplace v1 流程。
參見[狀態與已知限制](/start/status-and-limitations/)。
