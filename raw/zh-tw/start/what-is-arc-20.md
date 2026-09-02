# 什麼是 ARC-20

Atomicals 的同質代幣模型，一個單位等於一個著色聰，轉移是一個配置問題，而不是帳戶更新。

Page ID: start/what-is-arc-20
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: zh-tw
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/zh-tw/start/what-is-arc-20/

---
ARC-20 是 Atomicals 內部的同質代幣模型。它的規則很短：

> **一個 ARC-20 單位，就是驗證器認定為著色的比特幣輸出中的一個聰。**

這一句話決定了其餘的一切。供應量以聰計量。轉移是一個關於哪些輸出取得多少價值的問題。無法放置的
價值會被銷毀。

## 為什麼這不是帳戶餘額

在帳戶模型中，轉移從一列扣除、在另一列加上，交易要嘛成功要嘛失敗。在 ARC-20 中，比特幣交易無論
如何都會成功。改變的是著色價值最終落在哪裡。

| 問題 | 帳戶模型 | ARC-20 |
| --- | --- | --- |
| 餘額在哪裡 | 帳本中的一列 | 分散在你的未花費輸出中 |
| 轉移是什麼 | 借記與貸記 | 依序把輸入價值配置給輸出 |
| 價值會消失嗎 | 不會 | 會。放不下的價值會被銷毀 |
| 誰決定結果 | 合約 | 你的索引器執行的驗證器版本 |
| 確認是否代表成功 | 是 | 否。確認與配置是兩個不同的答案 |

如果下一個可用輸出大於尚未放置的著色價值，該價值不會被結轉，而是會被銷毀。這在比特幣上不是錯誤
狀態：交易會正常確認。在移動任何東西之前，請閱讀[銷毀](/protocol/arc20/burns/)。

## 單位產生的三種方式

| 方式 | 操作 | 型態 |
| --- | --- | --- |
| 直接發行 | `ft` | 全部供應量落在一筆交易的第零個輸出 |
| 固定去中心化 | 先 `dft` 後 `dmt` | 部署訂定規則，接著每位申領者鑄造固定數量 |
| 永續去中心化 | 帶永續參數的 `dft` | 受啟用條件約束，Bitwork 遞進，可選全域上限 |

參見[直接發行](/protocol/arc20/direct-issuance/)、
[固定 DFT](/protocol/arc20/fixed-dft/) 與
[永續 DFT](/protocol/arc20/perpetual-dft/)。

## 代號代表什麼，不代表什麼

代號是一個全域配發的名稱。取得它代表 Atomicals 規則把一個候選解析為已驗證的勝出者。它並不代表：

- 專案就是它自稱的那一方；
- 中繼資料是正確的；
- 圖片歸鑄造者所有；
- 有人為供應量負責。

在顯示任何代號時，都要一併保存並顯示已解析的 **Atomical ID**。
參見[代號與候選](/protocol/arc20/tickers-and-candidates/)。

## 小數位不會產生分數

`decimals` 是顯示用的中繼資料。它只改變錢包在畫面上如何格式化數字，絕不會建立小於一個聰的單位。
ARC-20 的原生數量始終是整數。
參見[中繼資料與小數位](/protocol/arc20/metadata-and-decimals/)。
