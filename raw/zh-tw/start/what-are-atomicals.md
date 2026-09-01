# 什麼是 Atomicals

存在於一般比特幣輸出中的數位物件，由建立它的交易識別，並由 Atomicals 驗證器解釋。

Page ID: start/what-are-atomicals
Applicability: protocol-behavior
Authority: reference-implementation
Networks: mainnet
Verified: 2026-08-31
Locale: zh-tw
URL: https://bitcoinuniverseio.github.io/atomicals-and-arc-20/zh-tw/start/what-are-atomicals/

---
**Atomical** 是由一筆比特幣交易建立、並由一個比特幣輸出承載的數位物件。這裡沒有側鏈，沒有獨立的
代幣帳本，也沒有智慧合約帳戶。這個物件之所以存在，是因為驗證器讀取了你的交易，並對它套用
Atomicals 規則。

## Atomical 的三個組成部分

**身分** 是 Atomical ID，寫作 `<txid>i<輸出索引>`。它只配發一次，永不改變。系統也會依鑄造順序配發
一個編號，但應當保存的長久身分是 ID。

**位置** 是目前承載該物件的 UTXO。花費這個 UTXO 會移動該物件，或是銷毀它，取決於輸出如何安排。

**歷程** 是套用到該物件上的有序操作集合：鑄造、每一次狀態更新，以及每一次移動。

## 一項操作是如何寫入的

信封不會被比特幣執行。它只是 Taproot 指令碼路徑中的資料。比特幣不知道 `atom` 是什麼意思，
Atomicals 驗證器知道。

一筆已確認的比特幣交易只說明位元組已進入某個區塊。操作是否有效、哪個輸出收到了物件、是否有東西被
銷毀，這些都由驗證器回答。請務必同時檢查這兩件事。

## 協定家族

| 類型 | 內容 | 閱讀 |
| --- | --- | --- |
| Atomicals NFT | 帶有中繼資料與媒體的單一非同質物件 | [NFT 概覽](/protocol/nft/overview/) |
| ARC-20 | 一個單位等於一個著色聰的同質代幣 | [ARC-20 概覽](/protocol/arc20/overview/) |
| Container | 具名集合，項目可以證明其歸屬 | [Containers](/protocol/containers/overview/) |
| DMINT | 針對已封存清單的 Container 項目去中心化鑄造 | [DMINT](/protocol/containers/dmint/) |
| Realm | 以 Atomical 形式持有的頂層名稱 | [Realms](/protocol/realms/overview/) |
| Subrealm | 依 Realm 規則申領的子名稱 | [Subrealms](/protocol/realms/subrealms/) |
| Payname | 用作收款目標的 Realm | [Paynames](/protocol/realms/paynames/) |
| AVM | 隔離的指令碼直譯器，處於測試階段且範圍獨立 | [AVM](/protocol/avm/overview/) |

## Atomical 不是什麼

- 它不是誰建立了某項事物的證明。代號或 Realm 名稱是一次配發，而非身分驗證。
- 它不是合約帳戶。沒有可供扣減的餘額列。
- 不能安全地從中繼資料推論結論。中繼資料是鑄造者填入的任意資料。
- 不會因為比特幣確認了就成為最終結果。參見
  [確認與重組](/protocol/core/confirmation-and-reorgs/)。
