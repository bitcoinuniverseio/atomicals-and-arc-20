//! Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.
//!
//! Requires an explicit base URL. No signing, broadcasting, or key storage.

use std::time::Duration;

#[derive(Debug)]
pub struct ApiError {
    pub status: u16,
    pub code: String,
    pub message: String,
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(formatter, "{} {}: {}", self.status, self.code, self.message)
    }
}

impl std::error::Error for ApiError {}

#[derive(Clone)]
pub struct Client {
    base: String,
    agent: reqwest::Client,
}

impl Client {
    pub fn new(base_url: &str) -> Result<Self, ApiError> {
        if !base_url.starts_with("http") {
            return Err(ApiError { status: 0, code: "bad_base".into(), message: "base_url must be an explicit http(s) URL".into() });
        }
        let agent = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .user_agent("atomicals-rust-client/1.0.0")
            .build()
            .map_err(|error| ApiError { status: 0, code: "client_build".into(), message: error.to_string() })?;
        Ok(Self { base: base_url.trim_end_matches('/').to_string(), agent })
    }

    async fn get(&self, path: &str) -> Result<serde_json::Value, ApiError> {
        let response = self
            .agent
            .get(format!("{}{}", self.base, path))
            .header("accept", "application/json")
            .send()
            .await
            .map_err(|error| ApiError { status: 0, code: "unreachable".into(), message: error.to_string() })?;
        let status = response.status().as_u16();
        let body = response.text().await.map_err(|error| ApiError { status, code: "read_failed".into(), message: error.to_string() })?;
        if status >= 400 {
            return Err(ApiError { status, code: "http_error".into(), message: body.chars().take(500).collect() });
        }
        serde_json::from_str(&body).map_err(|error| ApiError { status, code: "bad_json".into(), message: error.to_string() })
    }

    /// Process liveness. Read-only GET on the arc20 contract.
    pub async fn arc20_get_live(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/live");
        self.get(&path).await
    }

    /// Migrations and initial snapshot readiness. Read-only GET on the arc20 contract.
    pub async fn arc20_get_ready(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/ready");
        self.get(&path).await
    }

    /// Source status and counts. Read-only GET on the arc20 contract.
    pub async fn arc20_get_status(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/token-explorer/status");
        self.get(&path).await
    }

    /// Immutable feed page. Read-only GET on the arc20 contract.
    pub async fn arc20_get_feed_page(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/token-explorer/arc20");
        self.get(&path).await
    }

    /// Process liveness. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_live(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/live");
        self.get(&path).await
    }

    /// Service and pinned provider revisions. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_version(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/version");
        self.get(&path).await
    }

    /// Health state. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_health(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/health");
        self.get(&path).await
    }

    /// Readiness with the reason when not ready. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_ready(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/ready");
        self.get(&path).await
    }

    /// Operational metrics in text form. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_metrics(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/metrics");
        self.get(&path).await
    }

    /// Token explorer source status. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_token_explorer_status(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/token-explorer/status");
        self.get(&path).await
    }

    /// Token explorer feed page. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_token_explorer_page(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/token-explorer/{}", arg0);
        self.get(&path).await
    }

    /// Index status with a provider probe. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_index_status(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/index/status");
        self.get(&path).await
    }

    /// Index status, NFT scope. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_nft_index_status(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/index/status");
        self.get(&path).await
    }

    /// Index status, Realm scope. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_realm_index_status(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/index/status");
        self.get(&path).await
    }

    /// Recent index events. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_index_events(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/index/events");
        self.get(&path).await
    }

    /// List assets across every projected type. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn list_assets(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/assets");
        self.get(&path).await
    }

    /// List plain NFTs. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn list_nfts(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/assets");
        self.get(&path).await
    }

    /// List Realms and Subrealms. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn list_realms(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/assets");
        self.get(&path).await
    }

    /// Read one asset of any projected type. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_asset(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/assets/{}", arg0);
        self.get(&path).await
    }

    /// Read one plain NFT. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_nft(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/assets/{}", arg0);
        self.get(&path).await
    }

    /// Read one Realm or Subrealm. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_realm(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/assets/{}", arg0);
        self.get(&path).await
    }

    /// Asset history. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_asset_history(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/assets/{}/history", arg0);
        self.get(&path).await
    }

    /// NFT history. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_nft_history(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/assets/{}/history", arg0);
        self.get(&path).await
    }

    /// Realm history. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_realm_history(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/assets/{}/history", arg0);
        self.get(&path).await
    }

    /// Current owner. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_asset_holders(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/assets/{}/holders", arg0);
        self.get(&path).await
    }

    /// Current owner, NFT scope. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_nft_holders(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/assets/{}/holders", arg0);
        self.get(&path).await
    }

    /// Current owner, Realm scope. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_realm_holders(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/assets/{}/holders", arg0);
        self.get(&path).await
    }

    /// Metadata, media descriptor, and sealed state. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_asset_metadata(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/assets/{}/metadata", arg0);
        self.get(&path).await
    }

    /// Metadata, NFT scope. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_nft_metadata(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-nfts/assets/{}/metadata", arg0);
        self.get(&path).await
    }

    /// Stored media bytes. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_media(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/atomicals/media/{}/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Resolve a name to its verified winner. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn resolve_realm(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/resolve");
        self.get(&path).await
    }

    /// Realm hierarchy for a name. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_realm_hierarchy(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/hierarchy");
        self.get(&path).await
    }

    /// Direct Subrealms of a name. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_subrealms(&self) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals-realms/subrealms");
        self.get(&path).await
    }

    /// Projected assets touched by a transaction. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_by_transaction(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/transactions/{}", arg0);
        self.get(&path).await
    }

    /// Projected assets at a block height. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_by_block(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/blocks/{}", arg0);
        self.get(&path).await
    }

    /// Projected assets at an outpoint. Read-only GET on the atomicals-nfts-realms contract.
    pub async fn get_by_outpoint(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/atomicals/utxos/{}/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Machine readable route and signing contract. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_contract(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}", arg0);
        self.get(&path).await
    }

    /// Non-probing status view. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_status(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/status", arg0);
        self.get(&path).await
    }

    /// Bitcoin Core and Atomicals checkpoint probe. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_readiness(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/readiness", arg0);
        self.get(&path).await
    }

    /// List listings. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_list_listings(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/listings", arg0);
        self.get(&path).await
    }

    /// Read one listing. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_listing(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/listings/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Reload a reservation without mutation. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_reservation(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/reservations/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Read settlement state. Read-only GET on the marketplace-v1 contract.
    pub async fn marketplace_get_settlement(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/api/marketplace/v1/protocols/{}/settlements/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Envelope free adapter page. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_list_assets(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/assets", arg0);
        self.get(&path).await
    }

    /// Envelope free adapter page. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_list_listings(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/listings", arg0);
        self.get(&path).await
    }

    /// Envelope free adapter read. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_get_listing(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/listings/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Envelope free adapter page. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_list_offers(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/offers", arg0);
        self.get(&path).await
    }

    /// Envelope free adapter page. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_list_collections(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/collections", arg0);
        self.get(&path).await
    }

    /// Envelope free adapter page. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_list_activity(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/activity", arg0);
        self.get(&path).await
    }

    /// Composite position source readiness. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_position_source_ready(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/position-source/ready", arg0);
        self.get(&path).await
    }

    /// Composite position evidence for an outpoint. Read-only GET on the marketplace-v1 contract.
    pub async fn adapter_position_source_outpoint(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/position-source/outpoints/{}", arg0, arg1);
        self.get(&path).await
    }

    /// Trusted bridge readiness probe. Read-only GET on the marketplace-v1 contract.
    pub async fn internal_readiness(&self, arg0: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/internal/readiness", arg0);
        self.get(&path).await
    }

    /// Trusted bridge reservation reload. Read-only GET on the marketplace-v1 contract.
    pub async fn internal_get_reservation(&self, arg0: &str, arg1: &str) -> Result<serde_json::Value, ApiError> {
        let path = format!("/v1/marketplace/protocols/{}/internal/reservations/{}", arg0, arg1);
        self.get(&path).await
    }

}
