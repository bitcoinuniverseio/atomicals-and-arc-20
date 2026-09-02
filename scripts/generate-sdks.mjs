#!/usr/bin/env node
/**
 * Generates the Python, Go, and Rust read-only clients from the OpenAPI
 * contracts. Deterministic: the same contracts always produce the same
 * client sources, and generation leaves the tree clean only when committed.
 *
 * Every generated client exposes only read-only operations, requires an
 * explicit base URL, typed errors, timeouts, and cancellation in the
 * language's idiom. No signing, broadcasting, or key storage exists anywhere
 * in the surface.
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(here, '..')

// Read-only operations per document, in contract order.
const documents = [
  { file: 'arc20', namespace: 'arc20' },
  { file: 'atomicals-nfts-realms', namespace: 'nftrealms' },
  { file: 'marketplace-v1', namespace: 'marketplace' },
]

const operations = []
for (const document of documents) {
  const spec = JSON.parse(readFileSync(resolve(ROOT, `contracts/openapi/${document.file}.json`), 'utf8'))
  for (const [path, item] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(item)) {
      if (method !== 'get') continue
      operations.push({
        document: document.file,
        operationId: operation.operationId,
        summary: operation.summary ?? '',
        path,
      })
    }
  }
}

const snake = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
const pascal = (value) => value[0].toUpperCase() + snake(value).split('_').map((part) => part[0].toUpperCase() + part.slice(1)).join('').slice(1)

// ---------------------------------------------------------------- python

function pythonClient() {
  const methods = operations
    .map((operation) => {
      const name = snake(operation.operationId)
      const subPath = operation.path.replace(/\{([^}]+)\}/g, '{$1}')
      return `    def ${name}(self${operation.path.includes('{') ? ', **path_params' : ''}, *, timeout: float = 10.0) -> dict:
        """${operation.summary}. Read-only GET on the ${operation.document} contract."""
        path = "${subPath}"${operation.path.includes('{') ? '.format(**path_params)' : ''}
        return self._request("GET", path, timeout=timeout)
`
    })
    .join('\n')
  return `"""Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.

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

${methods}
`
}

// -------------------------------------------------------------------- go

function goClient() {
  const methods = operations
    .map((operation) => {
      const name = pascal(operation.operationId)
      const subPath = operation.path.replace(/\{([^}]+)\}/g, '%s')
      const argCount = (operation.path.match(/\{[^}]+\}/g) ?? []).length
      const args = argCount > 0 ? `, ${Array.from({ length: argCount }, (_, index) => `arg${index} string`).join(', ')}` : ''
      const sprintf = argCount > 0 ? `fmt.Sprintf("${subPath}"${Array.from({ length: argCount }, (_, index) => `, arg${index}`).join('')})` : `"${subPath}"`
      return `// ${name} calls ${operation.method} ${operation.path}. ${operation.summary} Read-only.
func (c *Client) ${name}(ctx context.Context${args}) (map[string]any, error) {
	return c.get(ctx, ${sprintf})
}
`
    })
    .join('\n')
  return `// Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.

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

${methods}
`
}

// ------------------------------------------------------------------ rust

function rustClient() {
  const methods = operations
    .map((operation) => {
      const name = snake(operation.operationId)
      const argCount = (operation.path.match(/\{[^}]+\}/g) ?? []).length
      const args = argCount > 0 ? `, ${Array.from({ length: argCount }, (_, index) => `arg${index}: &str`).join(', ')}` : ''
      const subPath = operation.path.replace(/\{[^}]*\}/g, '{}')
      const formatArgs = argCount > 0 ? `, ${Array.from({ length: argCount }, (_, index) => `arg${index}`).join(', ')}` : ''
      return `    /// ${operation.summary}. Read-only GET on the ${operation.document} contract.
    pub async fn ${name}(&self${args}) -> Result<serde_json::Value, ApiError> {
        let path = format!("${subPath}"${formatArgs});
        self.get(&path).await
    }
`
    })
    .join('\n')
  return `//! Generated read-only Atomicals client. Do not edit by hand; run npm run sdk:generate.
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

${methods}
}
`
}

function rustCargoToml() {
  return `[package]
name = "atomicals-client"
version = "1.0.0"
edition = "2021"
license = "MIT"
description = "Generated read-only client for the Atomicals and ARC-20 contracts"

[dependencies]
reqwest = { version = "0.12.23", default-features = false, features = ["json", "rustls-tls"] }
serde_json = "1.0.145"
tokio = { version = "1.47.1", features = ["macros", "rt-multi-thread"] }
`
}

function pythonPyproject() {
  return `[project]
name = "atomicals-client"
version = "1.0.0"
description = "Generated read-only client for the Atomicals and ARC-20 contracts"
requires-python = ">=3.11"
license = "MIT"

[tool.ruff]
line-length = 120

[tool.mypy]
strict = true
`
}

function goMod() {
  return `module github.com/bitcoinuniverseio/atomicals-and-arc-20/clients/go

go 1.25
`
}

const outputs = [
  ['clients/python/atomicals_client/client.py', pythonClient()],
  ['clients/python/pyproject.toml', pythonPyproject()],
  ['clients/python/README.md', '# atomicals-client (Python)\n\nGenerated read-only client. Run `npm run sdk:generate` at the repository root to regenerate. Requires an explicit base URL; performs no signing or broadcasting.\n'],
  ['clients/go/client.go', goClient()],
  ['clients/go/go.mod', goMod()],
  ['clients/go/README.md', '# atomicals (Go)\n\nGenerated read-only client. Run `npm run sdk:generate` at the repository root to regenerate. Contexts and typed errors throughout; no signing or broadcasting.\n'],
  ['clients/rust/src/lib.rs', rustClient()],
  ['clients/rust/Cargo.toml', rustCargoToml()],
  ['clients/rust/README.md', '# atomicals-client (Rust)\n\nGenerated read-only client. Run `npm run sdk:generate` at the repository root to regenerate. reqwest with rustls; no signing or broadcasting.\n'],
]

for (const [relative, contents] of outputs) {
  const target = resolve(ROOT, relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents)
}

// A contract-coverage manifest the tests hold against the live contracts.
writeFileSync(
  resolve(ROOT, 'site/src/generated/sdk-coverage.json'),
  `${JSON.stringify(
    {
      generatedBy: 'scripts/generate-sdks.mjs',
      operationCount: operations.length,
      languages: ['python', 'go', 'rust'],
      operations: operations.map((operation) => operation.operationId),
    },
    null,
    2,
  )}\n`,
)
process.stdout.write(`generated python, go, and rust clients covering ${operations.length} read-only operations\n`)
