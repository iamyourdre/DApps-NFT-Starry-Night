# NFT Starry Night

> A narrative-driven ERC‑1155 Drop dApp for claiming and exploring limited digital collectibles.

## Prologue: The Night Before the Mint

Imagine a vault of star‑framed artifacts hovering on a testnet sky. Some are unclaimed lights; some already burn with ownership. This repository is the lantern that lets users discover, preview, and claim those stars before the constellation is complete.

You arrive at the landing page. A single highlighted NFT spins with reactive light. The presale is alive. You connect your wallet. You explore. You claim. You revisit your personal gallery. The story is minimal, but the interaction loop is crisp.

## Act I: Core Idea

Provide:
- A smooth UX for exploring ERC1155 drop tokens.
- A real‑time price + supply driven claim button.
- A collection view of owned tokens.
- A tactile, animated card interface.
- Lightweight extensibility for future phases (allowlists, tiers, reveal mechanics).

## Act II: The Stack

| Layer | Purpose |
|-------|---------|
| Next.js / App Router | UI + routing |
| React / TypeScript | Components & state |
| wagmi + viem | Smart contract reads/writes |
| Sonner | Toast feedback |
| Tailwind CSS + utility classes | Styling |
| Lucide Icons | Iconography |
| ERC1155 Drop Contract (custom ABI) | Mint / claim logic |

Environment variable:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDrop1155Address
```

## Act III: User Journey

1. Landing (Hero): Animated highlight NFT + CTA to Explore.
2. Explore (/listed): Grid of claimable NFTs (NFTListedCard) with dynamic tilt, price, progress bar.
3. NFT Details (/nft/[id]): Large preview, description toggle, on-chain price & remaining supply, claim button with toast lifecycle.
4. Collections (/collections): Personalized gallery fetched via balance queries + metadata.
5. Feedback: Toasters for claim lifecycle (loading → success / error).

## Act IV: Smart Contract (High-Level)

An ERC1155 Drop pattern supporting:
- Lazy mint batches.
- Claim conditions (start time, price, currency, per-wallet limit, merkle root, max claimable supply).
- Per-token totalSupply + maxTotalSupply tracking.
- Royalty + platform + primary sale configuration.

The frontend reads:
- uri(tokenId) → metadata (IPFS → HTTP gateway transform).
- getClaimConditionById / active condition components (wrapped in a consolidated hook).
- totalSupply, maxTotalSupply, pricing data.

## Act V: Key Hooks

| Hook | Role |
|------|------|
| `useGetURI` | Resolve metadata JSON for a tokenId. |
| `useGetPrice` | Derive active claim condition data (price, remaining, supply). |
| `useClaimNFT` | Executes claim transaction with proper args + toast lifecycle. |
| `useUserCollections` | Fetch owned token balances + metadata (for gallery). |

Each hook returns `{ data / price, loading, error }` shape to keep UI predictable.

## Act VI: Components (Highlights)

- `NFTDemo` / `NFTListedCard`: Interactive tilt, radial light pointer tracking.
- `NFTDetails`: Full-screen detail + claim pane.
- `Hero`: Entry narrative + featured token preview.
- `CollectionsPage`: Ownership showcase.
- `Navbar` & (planned) `Footer`: Shell layout.
- Reusable `Button`, `Card`, `Collapsible` primitives from a UI kit pattern.

## Act VII: Getting Started

Prerequisites:
- Node 18+
- PNPM (recommended) or Yarn / npm
- A deployed ERC1155 Drop (Sepolia by default)
- Wallet (e.g. MetaMask) pointed to the same network

Install:
```
pnpm install
```

Env:
```
cp .env.example .env.local
# set NEXT_PUBLIC_CONTRACT_ADDRESS
```

Run dev:
```
pnpm dev
```

Open:
```
http://localhost:3000
```

---

## Act VIII: Deployment

Typical flow (Vercel):
1. Set `NEXT_PUBLIC_CONTRACT_ADDRESS` in project settings.
2. Push main branch.
3. Verify network (e.g., Sepolia).
4. Test claim with a funded wallet.

## Act IX: Extensibility Ideas

- Allowlist gating (Merkle root integration).
- Quantity selector before claim.
- Multi-currency pricing display.
- Reveal phases (placeholder → unveiled art).
- Activity feed (transfer / claim events).
- Analytics panel (mint velocity, wallet distribution).
- Dark/light theming toggle.

## Act X: Defensive UX Patterns

| Concern | Mitigation |
|---------|------------|
| Price race condition | Re-query price before enabling claim. |
| Partial metadata loads | Skeleton + graceful fallback text. |
| Transaction confusion | Toast lifecycle (loading → success/fail). |
| Pointer thrash | Throttled transform updates (fast but contained). |

## Epilogue

This is a scaffold for an experiential mint surface: polished enough to use, open enough to reshape. Fork it, point it at your own contract, and let new constellations form.

Stars are just metadata until someone claims them.

## Quick Commands

```
pnpm dev      # local dev
pnpm build    # production build
pnpm start    # serve build
```

## License

MIT (see LICENSE if added). Use freely; attribution appreciated.

## Contact

- GitHub: https://github.com/iamyourdre/NFT-Starry-Night
- LinkedIn: https://linkedin.com/in/iamyourdre
- Email: adriansutansaty260403@gmail.com

Enjoy the mint.
