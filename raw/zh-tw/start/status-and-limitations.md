# 狀態與已知限制

哪些已上線、哪些處於測試、哪些只是提案、哪些尚未開放，以及我們知道且沒有隱瞞的限制。

Page ID: start/status-and-limitations
Applicability: universe-implementation
Authority: universe-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: zh-tw
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/zh-tw/start/status-and-limitations/

---
## ARC-20

| 能力 | 狀態 | 說明 |
| --- | --- | --- |
| 已驗證代號解析與代幣詳情 | Universe 實作 | 發布的是勝出的 Atomical ID，而不只是名稱 |
| 持有者快照 | Universe 實作 | 持有者各列必須與流通供應量完全相符，否則整輪掃描中止 |
| 已確認活動歷程 | Universe 實作 | 部署、直接與去中心化鑄造、轉移、銷毀、協定操作 |
| 待處理活動涵蓋範圍 | 有限 | 沒有能穩定處理待處理生命週期的完整記憶池資料流 |
| 投資組合餘額與著色 UTXO | Universe 實作 | 唯讀檢視，不是結算證明 |
| 從 Universe 產品直接 `mint-ft` 發行 | 未開放 | 協定支援，但沒有任何 Universe 介面提供 |
| Substantiation Factor 資料 | 初步 | 參見 [Substantiation Factor](/protocol/arc20/substantiation-factor/) |

ARC-20 資料來源以明確理由回報 `partial` 涵蓋範圍：已確認的權威歷程與完整且經過證明的持有者快照
均已索引，但交付的轉接器沒有能穩定處理待處理生命週期與消失情形的完整記憶池資料流。該限制僅適用於
待處理活動，不會削弱已確認掃描或持有者證明要求。

## Atomicals NFT、Realm 與 Subrealm

| 能力 | 狀態 | 說明 |
| --- | --- | --- |
| 一般 NFT、Realm 與 Subrealm 唯讀模型 | Universe 實作 | 共用一次掃描、一個世代、一個檢查點與一個作用中指標 |
| Realm 解析、階層與 Subrealm 清單 | Universe 實作 | 依資產保留候選與付款證據 |
| 依交易、區塊與 UTXO 查詢 | Universe 實作 | 限定在作用中的世代內 |
| 帶完整性檢查的媒體傳遞 | Universe 實作 | 適用 MIME 限制與大小上限 |
| 該投影中的同質代幣 | 依設計排除 | 由 ARC-20 端提供 |
| 該投影中的 Container 與 DMINT 項目 | 依設計排除 | 已在索引的來源清單中宣告 |
| 寫入操作 | 無 | 該投影為唯讀 |

## 市集

| 能力 | 狀態 | 說明 |
| --- | --- | --- |
| 四個彼此隔離的協定權威 | Universe 實作 | `arc20`、`atomicals_nft`、`realms`、`subrealms` |
| 掛單、預留、購買、報價、結算 | Universe 實作 | 每個操作開關預設關閉 |
| 所有權證明 | Universe 實作 | 針對 P2WPKH 與金鑰路徑 P2TR 的 BIP-322 simple 證明 |
| 混合擔保、銷毀、已花費輸出、檢查點偏移 | 拒絕 | 四條通道皆以關閉方式失敗 |
| 舊別名 `/buys` 與 `/orders/{orderId}/reconcile` | 已淘汰 | 請改用 `/reservations`、`/purchases`、`/settlements` |

## AVM

| 層級 | 狀態 |
| --- | --- |
| 白皮書中的架構概念 | 提案 |
| 官方測試版直譯器 | 實驗或測試 |
| Universe 執行環境整合 | 未開放 |
| Universe 執行環境證明 | 未發布 |

本站關於 AVM 的任何內容，都不應被理解為主網正式環境支援。參見
[AVM 狀態與限制](/protocol/avm/status-and-limitations/)。

## 我們已知的限制

1. 待處理的 ARC-20 活動沒有完整涵蓋，已確認的歷程則有。
2. Container 與 DMINT 以協定行為的形式記錄。目前沒有任何 Universe 唯讀投影提供它們。
3. 直接 FT 發行屬於協定行為，沒有對應的 Universe 產品介面。
4. AVM 在上游處於測試階段，此處未開放。任何實作宣稱都需要我們尚未發布的證明。
5. [登錄檔](/ecosystem/)中列出的部分 Atomicals 生態服務，無法透過可存取的來源查證。這些項目標示
   為 `unknown`，而不是猜測。
6. 速率限制只在確實存在之處記載。若某服務沒有速率限制，頁面會據實說明，而不是編造一套政策。

## 如何回報錯誤

請在[文件儲存庫](https://github.com/bitcoinuniverseio/atomicals-and-arc-20/issues)建立 issue。
使用 **incorrect protocol claim** 或 **API mismatch** 範本，並附上來源面板中的 page ID。
