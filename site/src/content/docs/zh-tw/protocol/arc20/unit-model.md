---
title: 單位模型
description: 一個著色聰就是一個單位，供應量以聰計量，小數位僅用於顯示。
sidebar:
  order: 2
provenance:
  pageId: protocol/arc20/unit-model
  area: protocol
  audience: [everyone, developer]
  applicability: protocol-behavior
  authority: reference-implementation
  networks: [mainnet]
  sources:
    - id: atomicals-electrumx-1.5.2.0
      path: normalFtAllocation
    - id: atomicals-guide
      path: arc20
  verified: '2026-08-31'
  tags: [arc-20, units]
  translationSourceHash: 0e97ff4112c1dc00649dd483dd1b427ff83279aad5ed40de820813457a931eb7
---

## 規則

一個 ARC-20 單位，就是驗證器針對該代幣認定為著色的輸出中的一個聰。原生數量是整數，不存在更小的
劃分。

## 由此直接得出的結論

**供應量就是聰。** 一個擁有 100 000 000 單位的代幣，需要 100 000 000 聰，也就是一枚比特幣才能存在。
大供應量在結構上就是昂貴的。

**塵埃限制適用。** 比特幣不會轉發的輸出無法承載單位。實務上，著色輸出必須達到其指令碼類型的塵埃
門檻或更高。

**餘額是加總結果，不是儲存的數值。** 錢包中的總額是它能花費的著色輸出總和。鏈上沒有任何地方儲存
這個總額。

**依輸出花費是全有或全無。** 不存在部分花費。移動一批中的一部分，代表建構一筆交易，讓其輸出取得
你想要的劃分。

## 具體數字

| 部署 | 每次鑄造量 | 最大鑄造次數 | 名目最大發行量 | 需要的比特幣 |
| --- | --- | --- | --- | --- |
| 小 | 1 000 sats | 10 000 | 10 000 000 單位 | 0.1 BTC |
| 中 | 10 000 sats | 21 000 | 210 000 000 單位 | 2.1 BTC |
| 大 | 100 000 sats | 21 000 | 2 100 000 000 單位 | 21 BTC |

名目最大發行量為 `mint_amount * max_mints`。這是申領所能產生的上限，而不是上限會被達到的承諾。

## 小數位

`decimals` 是選用的中繼資料，告訴錢包如何為讀者格式化數字。一個擁有 100 000 單位、`decimals` 為 2
的代幣可能顯示為 1 000.00。鏈上依然是 100 000 個著色聰中的 100 000 個整數單位。

在對原生數量進行運算之前，絕不要先除以十的次方；也絕不要讓格式化後的數字進入交易建構器。參見
[中繼資料與小數位](/protocol/arc20/metadata-and-decimals/)。

## 塵埃與安全

接近塵埃門檻的著色輸出是脆弱的。任何需要留下小於門檻餘額的轉移，都無法把該餘額放入新輸出，因此
會被銷毀。

實用建議：

- 讓每批的大小便於依你預期的轉移方式整齊劃分。
- 寧可持有少量較大的批次，也不要持有大量塵埃大小的批次。
- 在建構之前先為任何劃分建立模型。參見
  [配置視覺化工具](/tools/allocation-visualizer/)。
