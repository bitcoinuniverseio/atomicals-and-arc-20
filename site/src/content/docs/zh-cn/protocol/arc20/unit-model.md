---
title: 单位模型
description: 一个着色聪就是一个单位，供应量以聪计量，小数位仅用于展示。
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

## 规则

一个 ARC-20 单位，就是验证器针对该代币认定为着色的输出中的一个聪。原生数量是整数，不存在更小的
划分。

## 由此直接得出的结论

**供应量就是聪。** 一个拥有 100 000 000 单位的代币，需要 100 000 000 聪，也就是一枚比特币才能存在。
大供应量在结构上就是昂贵的。

**尘埃限制适用。** 比特币不会转发的输出无法承载单位。实际上，着色输出必须达到其脚本类型的尘埃
阈值或更高。

**余额是求和结果，不是存储的数值。** 钱包中的总额是它能花费的着色输出之和。链上没有任何地方存储
这个总额。

**按输出花费是全有或全无。** 不存在部分花费。移动一批中的一部分，意味着构建一笔交易，让其输出获得
你想要的划分。

## 具体数字

| 部署 | 每次铸造量 | 最大铸造次数 | 名义最大发行量 | 需要的比特币 |
| --- | --- | --- | --- | --- |
| 小 | 1 000 sats | 10 000 | 10 000 000 单位 | 0.1 BTC |
| 中 | 10 000 sats | 21 000 | 210 000 000 单位 | 2.1 BTC |
| 大 | 100 000 sats | 21 000 | 2 100 000 000 单位 | 21 BTC |

名义最大发行量为 `mint_amount * max_mints`。这是申领所能产生的上限，而不是上限会被达到的承诺。

## 小数位

`decimals` 是可选元数据，告诉钱包如何为读者格式化数字。一个拥有 100 000 单位、`decimals` 为 2 的
代币可能显示为 1 000.00。链上依然是 100 000 个着色聪中的 100 000 个整数单位。

在对原生数量做运算之前，绝不要先除以十的幂；也绝不要让格式化后的数字进入交易构建器。参见
[元数据与小数位](/protocol/arc20/metadata-and-decimals/)。

## 尘埃与安全

接近尘埃阈值的着色输出是脆弱的。任何需要留下小于阈值余额的转移，都无法把该余额放入新输出，因此
会被销毁。

实用建议：

- 让每批的大小便于按你预期的转移方式整齐划分。
- 宁可持有少量较大的批次，也不要持有大量尘埃大小的批次。
- 在构建之前先建模任何划分。参见
  [分配可视化工具](/tools/allocation-visualizer/)。
