# 什么是 Atomicals

存在于普通比特币输出中的数字对象，由创建它的交易标识，并由 Atomicals 验证器解释。

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: zh-cn
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/zh-cn/start/what-are-atomicals/

---
**Atomical** 是由一笔比特币交易创建、并由一个比特币输出承载的数字对象。这里没有侧链，没有独立的
代币账本，也没有智能合约账户。这个对象之所以存在，是因为验证器读取了你的交易并对它应用了
Atomicals 规则。

## Atomical 的三个组成部分

**身份** 是 Atomical ID，写作 `<txid>i<输出索引>`。它只分配一次，永不改变。系统也会按铸造顺序分配
一个编号，但应当保存的持久身份是 ID。

**位置** 是当前承载该对象的 UTXO。花费这个 UTXO 会移动该对象，或者销毁它，取决于输出如何安排。

**历史** 是应用到该对象上的有序操作集合：铸造、每一次状态更新，以及每一次移动。

## 一个操作是如何写入的

信封不会被比特币执行。它只是 Taproot 脚本路径中的数据。比特币不知道 `atom` 是什么意思。Atomicals
验证器知道。

一笔已确认的比特币交易只说明字节已进入某个区块。操作是否有效、哪个输出收到了对象、是否有东西被
销毁，这些都由验证器回答。请始终同时检查这两件事。

## 协议家族

| 类型 | 内容 | 阅读 |
| --- | --- | --- |
| Atomicals NFT | 带有元数据和媒体的单个非同质对象 | [NFT 概览](/protocol/nft/overview/) |
| ARC-20 | 一个单位等于一个着色聪的同质代币 | [ARC-20 概览](/protocol/arc20/overview/) |
| Container | 具名集合，条目可以证明其归属 | [Containers](/protocol/containers/overview/) |
| DMINT | 针对已封存清单的 Container 条目去中心化铸造 | [DMINT](/protocol/containers/dmint/) |
| Realm | 作为 Atomical 持有的顶级名称 | [Realms](/protocol/realms/overview/) |
| Subrealm | 依据 Realm 规则申领的子名称 | [Subrealms](/protocol/realms/subrealms/) |
| Payname | 用作收款目标的 Realm | [Paynames](/protocol/realms/paynames/) |
| AVM | 隔离的脚本解释器，处于测试阶段且范围独立 | [AVM](/protocol/avm/overview/) |

## Atomical 不是什么

- 它不是谁创建了某物的证明。代号或 Realm 名称是一次分配，不是身份验证。
- 它不是合约账户。没有可以扣减的余额行。
- 不能安全地从元数据中推断结论。元数据是铸造者填入的任意数据。
- 不会因为比特币确认了就成为最终结果。参见
  [确认与重组](/protocol/core/confirmation-and-reorgs/)。
