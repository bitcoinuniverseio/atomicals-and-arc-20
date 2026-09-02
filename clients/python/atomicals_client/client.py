"""Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.

Requires an explicit base URL. Contains no signing, broadcasting, or key
storage. Retries nothing by default.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str) -> None:
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.message = message


class Timeout(ApiError):
    pass


class Client:
    def __init__(self, base_url: str, *, user_agent: str = "atomicals-python-client/1.0.0") -> None:
        if not base_url.startswith("http"):
            raise ValueError("base_url must be an explicit http(s) URL")
        self._base = base_url.rstrip("/")
        self._user_agent = user_agent

    def _request(self, method: str, path: str, *, timeout: float) -> dict:
        request = urllib.request.Request(
            self._base + path,
            method=method,
            headers={"accept": "application/json", "user-agent": self._user_agent},
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            body = error.read().decode("utf-8", "replace")
            raise ApiError(error.code, "http_error", body[:500]) from error
        except urllib.error.URLError as error:
            raise Timeout(error.code or 0, "unreachable", str(error.reason)) from error

    def arc20_get_live(self, *, timeout: float = 10.0) -> dict:
        """Process liveness. Read-only GET on the arc20 contract."""
        path = "/live"
        return self._request("GET", path, timeout=timeout)

    def arc20_get_ready(self, *, timeout: float = 10.0) -> dict:
        """Migrations and initial snapshot readiness. Read-only GET on the arc20 contract."""
        path = "/ready"
        return self._request("GET", path, timeout=timeout)

    def arc20_get_status(self, *, timeout: float = 10.0) -> dict:
        """Source status and counts. Read-only GET on the arc20 contract."""
        path = "/token-explorer/status"
        return self._request("GET", path, timeout=timeout)

    def arc20_get_feed_page(self, *, timeout: float = 10.0) -> dict:
        """Immutable feed page. Read-only GET on the arc20 contract."""
        path = "/token-explorer/arc20"
        return self._request("GET", path, timeout=timeout)

    def get_live(self, *, timeout: float = 10.0) -> dict:
        """Process liveness. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/live"
        return self._request("GET", path, timeout=timeout)

    def get_version(self, *, timeout: float = 10.0) -> dict:
        """Service and pinned provider revisions. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/version"
        return self._request("GET", path, timeout=timeout)

    def get_health(self, *, timeout: float = 10.0) -> dict:
        """Health state. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/health"
        return self._request("GET", path, timeout=timeout)

    def get_ready(self, *, timeout: float = 10.0) -> dict:
        """Readiness with the reason when not ready. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/ready"
        return self._request("GET", path, timeout=timeout)

    def get_metrics(self, *, timeout: float = 10.0) -> dict:
        """Operational metrics in text form. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/metrics"
        return self._request("GET", path, timeout=timeout)

    def get_token_explorer_status(self, *, timeout: float = 10.0) -> dict:
        """Token explorer source status. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/token-explorer/status"
        return self._request("GET", path, timeout=timeout)

    def get_token_explorer_page(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Token explorer feed page. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/token-explorer/{protocol}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_index_status(self, *, timeout: float = 10.0) -> dict:
        """Index status with a provider probe. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/index/status"
        return self._request("GET", path, timeout=timeout)

    def get_nft_index_status(self, *, timeout: float = 10.0) -> dict:
        """Index status, NFT scope. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/index/status"
        return self._request("GET", path, timeout=timeout)

    def get_realm_index_status(self, *, timeout: float = 10.0) -> dict:
        """Index status, Realm scope. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/index/status"
        return self._request("GET", path, timeout=timeout)

    def get_index_events(self, *, timeout: float = 10.0) -> dict:
        """Recent index events. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/index/events"
        return self._request("GET", path, timeout=timeout)

    def list_assets(self, *, timeout: float = 10.0) -> dict:
        """List assets across every projected type. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/assets"
        return self._request("GET", path, timeout=timeout)

    def list_nfts(self, *, timeout: float = 10.0) -> dict:
        """List plain NFTs. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/assets"
        return self._request("GET", path, timeout=timeout)

    def list_realms(self, *, timeout: float = 10.0) -> dict:
        """List Realms and Subrealms. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/assets"
        return self._request("GET", path, timeout=timeout)

    def get_asset(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Read one asset of any projected type. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/assets/{atomicalId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_nft(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Read one plain NFT. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/assets/{atomicalId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_realm(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Read one Realm or Subrealm. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/assets/{atomicalId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_asset_history(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Asset history. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/assets/{atomicalId}/history".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_nft_history(self, **path_params, *, timeout: float = 10.0) -> dict:
        """NFT history. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/assets/{atomicalId}/history".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_realm_history(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Realm history. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/assets/{atomicalId}/history".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_asset_holders(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Current owner. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/assets/{atomicalId}/holders".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_nft_holders(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Current owner, NFT scope. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/assets/{atomicalId}/holders".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_realm_holders(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Current owner, Realm scope. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/assets/{atomicalId}/holders".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_asset_metadata(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Metadata, media descriptor, and sealed state. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/assets/{atomicalId}/metadata".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_nft_metadata(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Metadata, NFT scope. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-nfts/assets/{atomicalId}/metadata".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_media(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Stored media bytes. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/atomicals/media/{atomicalId}/{field}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def resolve_realm(self, *, timeout: float = 10.0) -> dict:
        """Resolve a name to its verified winner. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/resolve"
        return self._request("GET", path, timeout=timeout)

    def get_realm_hierarchy(self, *, timeout: float = 10.0) -> dict:
        """Realm hierarchy for a name. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/hierarchy"
        return self._request("GET", path, timeout=timeout)

    def get_subrealms(self, *, timeout: float = 10.0) -> dict:
        """Direct Subrealms of a name. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals-realms/subrealms"
        return self._request("GET", path, timeout=timeout)

    def get_by_transaction(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Projected assets touched by a transaction. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/transactions/{txid}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_by_block(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Projected assets at a block height. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/blocks/{height}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def get_by_outpoint(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Projected assets at an outpoint. Read-only GET on the atomicals-nfts-realms contract."""
        path = "/v1/atomicals/utxos/{txid}/{vout}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_contract(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Machine readable route and signing contract. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_status(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Non-probing status view. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/status".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_readiness(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Bitcoin Core and Atomicals checkpoint probe. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/readiness".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_list_listings(self, **path_params, *, timeout: float = 10.0) -> dict:
        """List listings. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/listings".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_listing(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Read one listing. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/listings/{listingId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_reservation(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Reload a reservation without mutation. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/reservations/{reservationId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def marketplace_get_settlement(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Read settlement state. Read-only GET on the marketplace-v1 contract."""
        path = "/api/marketplace/v1/protocols/{protocolId}/settlements/{orderId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_list_assets(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter page. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/assets".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_list_listings(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter page. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/listings".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_get_listing(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter read. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/listings/{listingId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_list_offers(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter page. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/offers".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_list_collections(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter page. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/collections".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_list_activity(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Envelope free adapter page. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/activity".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_position_source_ready(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Composite position source readiness. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/position-source/ready".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def adapter_position_source_outpoint(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Composite position evidence for an outpoint. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/position-source/outpoints/{outpoint}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def internal_readiness(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Trusted bridge readiness probe. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/internal/readiness".format(**path_params)
        return self._request("GET", path, timeout=timeout)

    def internal_get_reservation(self, **path_params, *, timeout: float = 10.0) -> dict:
        """Trusted bridge reservation reload. Read-only GET on the marketplace-v1 contract."""
        path = "/v1/marketplace/protocols/{protocolId}/internal/reservations/{reservationId}".format(**path_params)
        return self._request("GET", path, timeout=timeout)

