// Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.

// Package atomicals provides a read-only client for the published ARC-20,
// Atomicals NFT/Realm, and Marketplace v1 contracts. It requires an explicit
// base URL and performs no signing, broadcasting, or key storage.
package atomicals

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// ApiError is a typed non-2xx response or transport failure.
type ApiError struct {
	Status  int
	Code    string
	Message string
}

func (e *ApiError) Error() string { return fmt.Sprintf("%d %s: %s", e.Status, e.Code, e.Message) }

// Client talks to one explicit deployment origin.
type Client struct {
	base      string
	userAgent string
	http      *http.Client
}

func NewClient(baseURL string) (*Client, error) {
	if !strings.HasPrefix(baseURL, "http") {
		return nil, fmt.Errorf("baseURL must be an explicit http(s) URL")
	}
	return &Client{
		base:      strings.TrimRight(baseURL, "/"),
		userAgent: "atomicals-go-client/1.0.0",
		http:      &http.Client{Timeout: 10 * time.Second},
	}, nil
}

func (c *Client) get(ctx context.Context, path string) (map[string]any, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, c.base+path, nil)
	if err != nil {
		return nil, &ApiError{Code: "request_build", Message: err.Error()}
	}
	request.Header.Set("accept", "application/json")
	request.Header.Set("user-agent", c.userAgent)
	response, err := c.http.Do(request)
	if err != nil {
		return nil, &ApiError{Code: "unreachable", Message: err.Error()}
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 2_000_000))
	if err != nil {
		return nil, &ApiError{Status: response.StatusCode, Code: "read_failed", Message: err.Error()}
	}
	if response.StatusCode >= 400 {
		return nil, &ApiError{Status: response.StatusCode, Code: "http_error", Message: string(body)}
	}
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, &ApiError{Status: response.StatusCode, Code: "bad_json", Message: err.Error()}
	}
	return payload, nil
}

// Arc20GetLive calls undefined /live. Process liveness Read-only.
func (c *Client) Arc20GetLive(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/live")
}

// Arc20GetReady calls undefined /ready. Migrations and initial snapshot readiness Read-only.
func (c *Client) Arc20GetReady(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/ready")
}

// Arc20GetStatus calls undefined /token-explorer/status. Source status and counts Read-only.
func (c *Client) Arc20GetStatus(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/token-explorer/status")
}

// Arc20GetFeedPage calls undefined /token-explorer/arc20. Immutable feed page Read-only.
func (c *Client) Arc20GetFeedPage(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/token-explorer/arc20")
}

// GetLive calls undefined /live. Process liveness Read-only.
func (c *Client) GetLive(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/live")
}

// GetVersion calls undefined /version. Service and pinned provider revisions Read-only.
func (c *Client) GetVersion(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/version")
}

// GetHealth calls undefined /health. Health state Read-only.
func (c *Client) GetHealth(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/health")
}

// GetReady calls undefined /ready. Readiness with the reason when not ready Read-only.
func (c *Client) GetReady(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/ready")
}

// GetMetrics calls undefined /metrics. Operational metrics in text form Read-only.
func (c *Client) GetMetrics(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/metrics")
}

// GetTokenExplorerStatus calls undefined /token-explorer/status. Token explorer source status Read-only.
func (c *Client) GetTokenExplorerStatus(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/token-explorer/status")
}

// GetTokenExplorerPage calls undefined /token-explorer/{protocol}. Token explorer feed page Read-only.
func (c *Client) GetTokenExplorerPage(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/token-explorer/%s", arg0))
}

// GetIndexStatus calls undefined /v1/atomicals/index/status. Index status with a provider probe Read-only.
func (c *Client) GetIndexStatus(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals/index/status")
}

// GetNftIndexStatus calls undefined /v1/atomicals-nfts/index/status. Index status, NFT scope Read-only.
func (c *Client) GetNftIndexStatus(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-nfts/index/status")
}

// GetRealmIndexStatus calls undefined /v1/atomicals-realms/index/status. Index status, Realm scope Read-only.
func (c *Client) GetRealmIndexStatus(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-realms/index/status")
}

// GetIndexEvents calls undefined /v1/atomicals/index/events. Recent index events Read-only.
func (c *Client) GetIndexEvents(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals/index/events")
}

// ListAssets calls undefined /v1/atomicals/assets. List assets across every projected type Read-only.
func (c *Client) ListAssets(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals/assets")
}

// ListNfts calls undefined /v1/atomicals-nfts/assets. List plain NFTs Read-only.
func (c *Client) ListNfts(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-nfts/assets")
}

// ListRealms calls undefined /v1/atomicals-realms/assets. List Realms and Subrealms Read-only.
func (c *Client) ListRealms(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-realms/assets")
}

// GetAsset calls undefined /v1/atomicals/assets/{atomicalId}. Read one asset of any projected type Read-only.
func (c *Client) GetAsset(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/assets/%s", arg0))
}

// GetNft calls undefined /v1/atomicals-nfts/assets/{atomicalId}. Read one plain NFT Read-only.
func (c *Client) GetNft(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-nfts/assets/%s", arg0))
}

// GetRealm calls undefined /v1/atomicals-realms/assets/{atomicalId}. Read one Realm or Subrealm Read-only.
func (c *Client) GetRealm(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-realms/assets/%s", arg0))
}

// GetAssetHistory calls undefined /v1/atomicals/assets/{atomicalId}/history. Asset history Read-only.
func (c *Client) GetAssetHistory(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/assets/%s/history", arg0))
}

// GetNftHistory calls undefined /v1/atomicals-nfts/assets/{atomicalId}/history. NFT history Read-only.
func (c *Client) GetNftHistory(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-nfts/assets/%s/history", arg0))
}

// GetRealmHistory calls undefined /v1/atomicals-realms/assets/{atomicalId}/history. Realm history Read-only.
func (c *Client) GetRealmHistory(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-realms/assets/%s/history", arg0))
}

// GetAssetHolders calls undefined /v1/atomicals/assets/{atomicalId}/holders. Current owner Read-only.
func (c *Client) GetAssetHolders(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/assets/%s/holders", arg0))
}

// GetNftHolders calls undefined /v1/atomicals-nfts/assets/{atomicalId}/holders. Current owner, NFT scope Read-only.
func (c *Client) GetNftHolders(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-nfts/assets/%s/holders", arg0))
}

// GetRealmHolders calls undefined /v1/atomicals-realms/assets/{atomicalId}/holders. Current owner, Realm scope Read-only.
func (c *Client) GetRealmHolders(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-realms/assets/%s/holders", arg0))
}

// GetAssetMetadata calls undefined /v1/atomicals/assets/{atomicalId}/metadata. Metadata, media descriptor, and sealed state Read-only.
func (c *Client) GetAssetMetadata(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/assets/%s/metadata", arg0))
}

// GetNftMetadata calls undefined /v1/atomicals-nfts/assets/{atomicalId}/metadata. Metadata, NFT scope Read-only.
func (c *Client) GetNftMetadata(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals-nfts/assets/%s/metadata", arg0))
}

// GetMedia calls undefined /atomicals/media/{atomicalId}/{field}. Stored media bytes Read-only.
func (c *Client) GetMedia(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/atomicals/media/%s/%s", arg0, arg1))
}

// ResolveRealm calls undefined /v1/atomicals-realms/resolve. Resolve a name to its verified winner Read-only.
func (c *Client) ResolveRealm(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-realms/resolve")
}

// GetRealmHierarchy calls undefined /v1/atomicals-realms/hierarchy. Realm hierarchy for a name Read-only.
func (c *Client) GetRealmHierarchy(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-realms/hierarchy")
}

// GetSubrealms calls undefined /v1/atomicals-realms/subrealms. Direct Subrealms of a name Read-only.
func (c *Client) GetSubrealms(ctx context.Context) (map[string]any, error) {
	return c.get(ctx, "/v1/atomicals-realms/subrealms")
}

// GetByTransaction calls undefined /v1/atomicals/transactions/{txid}. Projected assets touched by a transaction Read-only.
func (c *Client) GetByTransaction(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/transactions/%s", arg0))
}

// GetByBlock calls undefined /v1/atomicals/blocks/{height}. Projected assets at a block height Read-only.
func (c *Client) GetByBlock(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/blocks/%s", arg0))
}

// GetByOutpoint calls undefined /v1/atomicals/utxos/{txid}/{vout}. Projected assets at an outpoint Read-only.
func (c *Client) GetByOutpoint(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/atomicals/utxos/%s/%s", arg0, arg1))
}

// MarketplaceGetContract calls undefined /api/marketplace/v1/protocols/{protocolId}. Machine readable route and signing contract Read-only.
func (c *Client) MarketplaceGetContract(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s", arg0))
}

// MarketplaceGetStatus calls undefined /api/marketplace/v1/protocols/{protocolId}/status. Non-probing status view Read-only.
func (c *Client) MarketplaceGetStatus(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/status", arg0))
}

// MarketplaceGetReadiness calls undefined /api/marketplace/v1/protocols/{protocolId}/readiness. Bitcoin Core and Atomicals checkpoint probe Read-only.
func (c *Client) MarketplaceGetReadiness(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/readiness", arg0))
}

// MarketplaceListListings calls undefined /api/marketplace/v1/protocols/{protocolId}/listings. List listings Read-only.
func (c *Client) MarketplaceListListings(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/listings", arg0))
}

// MarketplaceGetListing calls undefined /api/marketplace/v1/protocols/{protocolId}/listings/{listingId}. Read one listing Read-only.
func (c *Client) MarketplaceGetListing(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/listings/%s", arg0, arg1))
}

// MarketplaceGetReservation calls undefined /api/marketplace/v1/protocols/{protocolId}/reservations/{reservationId}. Reload a reservation without mutation Read-only.
func (c *Client) MarketplaceGetReservation(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/reservations/%s", arg0, arg1))
}

// MarketplaceGetSettlement calls undefined /api/marketplace/v1/protocols/{protocolId}/settlements/{orderId}. Read settlement state Read-only.
func (c *Client) MarketplaceGetSettlement(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/api/marketplace/v1/protocols/%s/settlements/%s", arg0, arg1))
}

// AdapterListAssets calls undefined /v1/marketplace/protocols/{protocolId}/assets. Envelope free adapter page Read-only.
func (c *Client) AdapterListAssets(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/assets", arg0))
}

// AdapterListListings calls undefined /v1/marketplace/protocols/{protocolId}/listings. Envelope free adapter page Read-only.
func (c *Client) AdapterListListings(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/listings", arg0))
}

// AdapterGetListing calls undefined /v1/marketplace/protocols/{protocolId}/listings/{listingId}. Envelope free adapter read Read-only.
func (c *Client) AdapterGetListing(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/listings/%s", arg0, arg1))
}

// AdapterListOffers calls undefined /v1/marketplace/protocols/{protocolId}/offers. Envelope free adapter page Read-only.
func (c *Client) AdapterListOffers(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/offers", arg0))
}

// AdapterListCollections calls undefined /v1/marketplace/protocols/{protocolId}/collections. Envelope free adapter page Read-only.
func (c *Client) AdapterListCollections(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/collections", arg0))
}

// AdapterListActivity calls undefined /v1/marketplace/protocols/{protocolId}/activity. Envelope free adapter page Read-only.
func (c *Client) AdapterListActivity(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/activity", arg0))
}

// AdapterPositionSourceReady calls undefined /v1/marketplace/protocols/{protocolId}/position-source/ready. Composite position source readiness Read-only.
func (c *Client) AdapterPositionSourceReady(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/position-source/ready", arg0))
}

// AdapterPositionSourceOutpoint calls undefined /v1/marketplace/protocols/{protocolId}/position-source/outpoints/{outpoint}. Composite position evidence for an outpoint Read-only.
func (c *Client) AdapterPositionSourceOutpoint(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/position-source/outpoints/%s", arg0, arg1))
}

// InternalReadiness calls undefined /v1/marketplace/protocols/{protocolId}/internal/readiness. Trusted bridge readiness probe Read-only.
func (c *Client) InternalReadiness(ctx context.Context, arg0 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/internal/readiness", arg0))
}

// InternalGetReservation calls undefined /v1/marketplace/protocols/{protocolId}/internal/reservations/{reservationId}. Trusted bridge reservation reload Read-only.
func (c *Client) InternalGetReservation(ctx context.Context, arg0 string, arg1 string) (map[string]any, error) {
	return c.get(ctx, fmt.Sprintf("/v1/marketplace/protocols/%s/internal/reservations/%s", arg0, arg1))
}

