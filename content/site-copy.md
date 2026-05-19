<!--
  Canonical copy for gold.com.vc.

  Editing rules:
    1. This file is the single source of truth for all text on the public site.
    2. Each page section starts with `<!-- PAGE: slug -->` followed by a
       YAML frontmatter block (`---` ... `---`) and a markdown body.
    3. Slugs starting with `_` (`_meta`, `_concepts`) are NOT written to
       disk; they are inlined by the build (nav, footer, concepts).
    4. After editing, run `npm run build` to regenerate the root *.html files.
       Do not hand-edit the generated HTML.
-->

<!-- PAGE: _meta -->
---
nav:
  - label: "Home"
    href: "index.html"
  - label: "Types of Gold"
    href: "info.html"
  - label: "Types of Tokens"
    href: "types-of-tokens.html"
  - label: "Generating Wealth"
    href: "generating-wealth.html"
  - label: "Legal Disclaimers"
    href: "legal.html"
  - label: "Solomon's New Earth"
    href: "new-earth.html"
    cta: true
footer:
  - label: "Types of Gold"
    href: "info.html"
  - label: "Types of Tokens"
    href: "types-of-tokens.html"
  - label: "Generating Wealth"
    href: "generating-wealth.html"
  - label: "Investor Info"
    href: "/info"
    gatedTarget: "/info"
  - label: "Legal Disclaimers"
    href: "legal.html"
  - label: "Solomon's New Earth"
    href: "new-earth.html"
home_nav_skip:
  - "Home"
home_hero:
  title: "SOLOMON"
  line1: "GOLD IS KING."
  line2: "ESPECIALLY DIGITAL GOLD."
  subtitle: "WILL YOU BE READY WHEN THE FIAT BUBBLE BURSTS?"
home_hint: "drag to splash liquid gold • click to spawn bars • the fiat bubble is coming"
home_stats:
  - value: "50%"
    label: "REVENUE TO PARTNERS"
  - value: "11.4g"
    label: "PHYSICAL GOLD PER TOKEN"
  - value: "24-40%+"
    label: "EST. PARTNER YIELD"
  - value: "2%"
    label: "TRANSFER TAX → YOUR PROFIT"
home_front_section: |
  <div class="home-front-wrap">
    <p class="home-deploy-banner"><strong>Deployment status:</strong> The token may be available in some venues, but the system is <strong>not fully deployed</strong>—routes, pools, and interfaces can change. Nothing on this page is an offer or solicitation.</p>
    <details class="home-markets-block">
      <summary class="home-markets-summary">LayerZero routes, DEX venues &amp; reference chart</summary>
      <div class="home-markets-body">
        <p class="home-markets-lead">SOLOMON-family liquidity is centered on <strong>Alcor</strong> on <strong>XPR Network</strong> (Antelope). Cross-chain expansion uses <strong>LayerZero V2</strong> with <strong>Solana mainnet</strong> as the OApp source; LayerZero documents Solana mainnet endpoint id <strong>30168</strong> (<a href="https://docs.layerzero.network/v2/deployments/chains/solana" target="_blank" rel="noopener">official Solana deployment page</a>). EVM destinations follow LayerZero&rsquo;s <a href="https://docs.layerzero.network/v2/deployments/deployed-contracts" target="_blank" rel="noopener">deployed endpoints</a> registry—see <a href="new-earth.html">Solomon&rsquo;s New Earth</a> for the project&rsquo;s chain list and gilding context.</p>
        <div class="content-table-wrap home-markets-table-wrap">
          <table class="content-table home-markets-table">
            <thead>
              <tr>
                <th>Venue type</th>
                <th>Stack / bridge</th>
                <th>Role for SOLOMON pools</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alcor Exchange (XPR)</td>
                <td>XPR Network (Antelope); no LayerZero endpoint on-chain here—assets reach XPR via bridges you trust.</td>
                <td>Primary documented DEX for SOLOMON-style pools, swaps, and analytics on XPR.</td>
              </tr>
              <tr>
                <td>EVM AMMs (e.g. Uniswap-style)</td>
                <td>LayerZero V2 messaging from Solana (<abbr title="Endpoint ID">EID</abbr> 30168 per LayerZero docs) to each EVM chain in the registry.</td>
                <td>Pools can appear as token deployment extends; always verify live pair addresses and liquidity on the specific DEX explorer.</td>
              </tr>
              <tr>
                <td>Solana AMMs</td>
                <td>Native Solana programs; LayerZero Solana endpoint for cross-chain sends/receives.</td>
                <td>Possible venue when Solana-side liquidity is listed; confirm on-chain before trading.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="home-tv-note"><strong>Chart:</strong> SOLOMON may not have a TradingView symbol. Below is TradingView&rsquo;s free <em>Advanced Chart</em> widget (<a href="https://www.tradingview.com/widget-docs/widgets/charts/advanced-chart/" target="_blank" rel="noopener">widget docs</a>) on <strong>PAXG/USDT</strong> as a liquid proxy for tokenized gold backing—not a live SOLOMON pool chart. Use the symbol search inside the widget to switch instruments.</p>
        <div class="tradingview-widget-container home-tv-chart">
          <div class="tradingview-widget-container__widget"></div>
          <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>{"autosize":true,"symbol":"BINANCE:PAXGUSDT","interval":"240","timezone":"Etc/UTC","theme":"dark","style":"1","locale":"en","backgroundColor":"rgba(10, 6, 0, 1)","hide_top_toolbar":false,"hide_legend":false,"allow_symbol_change":true,"save_image":false,"calendar":false,"hide_volume":false,"support_host":"https://www.tradingview.com","width":"100%","height":"100%","enabled_features":[],"disabled_features":[],"referral_id":"","isTransparent":false}</script>
        </div>
        <p class="home-tv-attribution">Charts by <a href="https://www.tradingview.com/" target="_blank" rel="noopener">TradingView</a>, used under their widget terms.</p>
      </div>
    </details>
  </div>

---

<!-- PAGE: _concepts -->
---
title: "Concepts"
summary: "Concepts — click to expand"
---

The same vocabulary is used across SOLOMON pages. Open this panel any time
you want a quick refresher.

### Swap pools

Smart contracts that hold paired assets so users can trade between them at an
algorithmic price. Anyone can deposit assets (called "liquidity") and trades
route through the pool.

### Fees in swap pools

A small percentage of each trade stays in the pool and is split among the
addresses that provided the liquidity, paying them for taking on the inventory
risk of holding both assets.

### Token transfer fees

A small percentage charged each time a token moves between wallets. Most
SOLOMON-family tokens reinvest these fees into deeper liquidity and rewards.
Exceptions exist in our custom designs where movement between dedicated
system contracts is exempt so internal routing is not double-taxed.

### Flex (reflections)

A reward style where simply holding a token automatically grants you a share
of fees or new emissions based on your balance — the token "flexes" returns
to holders without requiring active staking.

### Liquidity (in DeFi)

The depth of inventory available for trades at a given price. Deeper
liquidity means smaller slippage on a given trade size and a tighter market
overall.

### Liquidity positions

A specific price range between two assets in a pool where you have committed
inventory to trade. Outside the range, your position sits fully in one asset;
inside, you earn fees as trades pass through.

### Supply

The total number of tokens minted (or in circulation). For our designs, the
way supply is *deployed* — into ranged liquidity rather than dormant wallets —
matters as much as the headline number.

### Pure Liquid

A token that places 100% of its supply into ranged liquidity positions in
secure pools from day one, with the entire backing asset committed above the
starting price. The token essentially only exists as buyable inventory in the
pool.

### Pure Liquid Gold

A Pure Liquid token whose backing is a redeemable-for-physical-gold token
(PAXG, XAUT, or similar). The underlying remains in the audited custody of
the source issuer, while SOLOMON adds the on-chain liquidity surface.

### Layered Liquid

A token that is itself Pure Liquid against another Pure Liquid token — an
outer layer that uses an inner Pure Liquid as its backing asset and inherits
that inner pool's liquidity guarantees while adding its own routing,
distribution, and economics.

### Buybacks with fees

Using fees collected by the system to buy the project's own token back from
the market, supporting the price and concentrating supply held by the
protocol or its partners.

### LP with fees

Using fees to add the project's token (and a matching asset) back into
liquidity pools, deepening the very markets that earn the fees in the first
place.

### Inflated rewards tokens

Tokens earmarked for ecosystem rewards that are emitted (inflated) into the
supply over time as incentives. They begin without backing and are
progressively backed as fees from the wider ecosystem flow in.

<!-- PAGE: index -->
---
title: "SOLOMON — Gold That Adds Volatility | gold.com.vc"
template: "home"
body_class: "home-page"
---

<!-- PAGE: info -->
---
title: "SOLOMON Info | gold.com.vc"
description: "Compare physical gold, gold ETFs, and on-chain gold (PAXG, XAUT). How SOLOMON fits: bridging, liquidity, and tradeoffs for serious capital."
eyebrow: "INFO PAGE"
include_concepts: true
---

# What gold you have matters

## How we got to Solomon

Gold has always been the anchor when trust in fiat weakens, but most buyers
still have to pick from tradeoffs: custody risk, low liquidity, premium drag,
or weak on-chain utility. Solomon is built from that gap.

The goal is to keep the core strength of physical backing while earning from
market making — in many cases providing the first usable liquidity rails for
gold on a given chain. Precise on-chain mechanics designed for serious
capital.

## The four ways people hold gold today

Most allocators end up choosing among four formats. The plain-English
definitions below feed directly into the benefits matrix that follows.

- **Physical** — bullion, coins, or bars in self-custody or a private vault.
  You own the metal directly; trust falls on storage and assay rather than on
  a platform.
- **ETF** — shares of a listed fund (for example
  [SPDR Gold Shares (GLD)](https://www.spdrgoldshares.com/) or
  [iShares Gold Trust (IAU)](https://www.ishares.com/us/products/239561/ishares-gold-trust-fund))
  whose net asset value is backed by allocated gold held with a custodian.
  Liquid in brokerage accounts, but redemption for physical metal is
  generally only available to authorized participants.
- **Tokenized (on-chain)** — gold-backed tokens such as
  [PAX Gold (PAXG)](https://www.paxos.com/pax-gold) and
  [Tether Gold (XAUT)](https://gold.tether.to/faq), each commonly
  structured as about one fine troy ounce of LBMA Good Delivery gold held in
  custody. Transferable on a blockchain, programmable, and usable in DeFi.
- **SOLOMON** — a gold-linked token that holds tokenized gold (PAXG / XAUT
  style) as backing and deploys it into concentrated, cross-chain liquidity
  pools, earning from the transfer fee and from routing flow.

## Table of Gold benefits

Physical bars, listed ETFs, and tokenized gold each solve a different
problem. Use the matrix below to compare benefits and tradeoffs before
layering strategies like SOLOMON on top.

<div class="content-table-wrap">
  <table class="content-table">
    <thead>
      <tr>
        <th>Format</th>
        <th>Benefits</th>
        <th>Drawbacks</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Physical</td>
        <td>
          <ul>
            <li>Direct possession with no platform counterparty.</li>
            <li>Long-term store of value across market cycles.</li>
            <li>Works outside digital infrastructure.</li>
          </ul>
        </td>
        <td>
          <ul>
            <li>Storage, insurance, and transport costs add drag.</li>
            <li>Slower settlement and lower day-to-day liquidity.</li>
            <li>Verification and assay can be operationally heavy.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>ETF</td>
        <td>
          <ul>
            <li>Simple brokerage access and portfolio integration.</li>
            <li>High market liquidity for tactical allocation.</li>
            <li>Clear reporting for institutions and funds.</li>
          </ul>
        </td>
        <td>
          <ul>
            <li>Primary creation and redemption is typically for authorized participants; retail holders usually get exposure by trading shares, not by calling metal from the trust.</li>
            <li>Where physical delivery exists, minimums and logistics often push it out of reach for everyday account sizes.</li>
            <li>Exposure depends on fund structure, custodians, and intermediaries; limited utility in decentralized markets.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>Tokenized (on-chain)</td>
        <td>
          <ul>
            <li>Fast global transfer and programmable settlement.</li>
            <li>Works with DeFi tools and treasury automation.</li>
            <li>Major gold tokens are designed for transparent reserve reporting and on-chain movement (subject to issuer disclosures).</li>
          </ul>
        </td>
        <td>
          <ul>
            <li>Bridge, oracle, and smart-contract risk vary materially by design.</li>
            <li>Liquidity and depth differ by chain and pair; fragmentation is common.</li>
            <li>Custody and key management still require strong operational controls.</li>
          </ul>
        </td>
      </tr>
      <tr>
        <td>SOLOMON</td>
        <td>
          <ul>
            <li>Designed to earn from liquidity provision and routing across gold-backed pairs.</li>
            <li>Can be complementary when real rates, inflation surprises, or commodity stress reprice gold.</li>
            <li>Aims to improve access and depth for gold tokens on networks where books were previously thin.</li>
          </ul>
        </td>
        <td>
          <ul>
            <li>2% transfer fee on every trade limits use outside market making.</li>
            <li>Requires secure underlying gold tokens.</li>
            <li>Not all products offer direct metal ownership.</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## Digitally Conductive

Physical, ETF, and tokenized are *custody* formats — they each describe
*where* the gold lives. SOLOMON adds a different axis: **digital
conductivity**. A gold token is digitally conductive when its on-chain
positioning actively routes value between pools, chains, and pairs, instead
of sitting idle in a wallet.

In practical terms, conductivity means three things working together:

- **Concentrated liquidity** in ranged positions on gold-to-gold and
  gold-to-crypto pools, so swaps clear at tight prices.
- **Cross-chain routes** that let the same gold-linked unit move between
  Solana and 28+ EVM destinations (see [Solomon's New Earth](new-earth.html)
  for the current chain set).
- **Best-priced presence** in those pools. When SOLOMON-deployed liquidity
  is the cheapest path between gold and another asset, every trade that
  takes that path returns swap fees to the system rather than to a
  third-party market maker.

The benefit to holders is not a separate yield product — it is the same
network earning more revenue because it is more *useful* to the market. The
2% transfer fee is the visible surface; conductivity is what makes that
surface valuable across many chains at once.

## Stock your Chest

This section introduces each type of investor's unique concerns, and
something they may not know about that is an expense or difficulty when
adding gold exposure at scale.

> "If you don't own gold, you know neither history nor economics." — Ray
> Dalio.
>
> Context: interviews and commentary often cite a strategic band of roughly
> **5–15%** of a portfolio in gold for diversification (sometimes higher in
> stressed macro regimes). See
> [Dalio on gold allocation (video)](https://www.youtube.com/watch?v=u-vMNzHgSHI)
> and
> [Investopedia summary](https://www.investopedia.com/how-much-of-your-portfolio-ray-dalio-says-you-should-have-in-gold-11825571).

### Understanding Gold for Institutions

Institutions care about audited reserves, clear compliance posture, and
dependable liquidity windows. Hidden costs usually appear in custody
agreements, reconciliation overhead, and spread costs during stressed
markets.

### Understanding gold buys for VCs

Venture investors often seek non-correlated ballast but underestimate
execution friction across chains, tax treatment complexity, and the staffing
needed to monitor treasury policy in real time.

### Understanding Gold for Wealthy Individuals

High-net-worth buyers usually prioritize capital preservation and
inheritance clarity. Expenses they may miss include cross-border transport
constraints, insurance terms, and liquidation timing when immediate cash is
needed.

## The new Gold Standard: Solomon

Designed for Venture Capital and High Net Worth.

SOLOMON is structured as a gold-linked token (1 SOLOMON = 11.4 grams of gold
exposure via the design described on this site) that bridges audited,
institution-grade gold tokens — notably <abbr title="Pax Gold">PAXG</abbr>
and <abbr title="Tether Gold">XAUT</abbr>, each typically representing about
one fine troy ounce held with LBMA Good Delivery standards — across many
blockchains using cross-chain messaging (for example LayerZero) and
concentrated liquidity pools.

Revenue comes from a built-in 2% transfer fee on trades. Arbitrage and
routing interact with the pools to align prices and capture flow, supporting
volume across gold-to-gold and gold-to-crypto routes — especially where
local gold liquidity was previously shallow.

Partners who invest a minimum of $50k and sign a 3-year private agreement
split 50% of the tax revenue proportionally to their shares (paid monthly to
their wallet). The other 50% is reinvested into buybacks and market-making.
Tokens and backing assets are allocated to CLMM-style liquidity positions as described in
project materials, with redemption mechanics through automated market makers
as set out in the [Legal Disclaimers](legal.html). Materials cite an
**estimated** 24–40%+ APY from the revenue share alone (not guaranteed; past
performance of other tokens does not predict results). See legal disclosures
before relying on any yield figure.

<!-- PAGE: types-of-tokens -->
---
title: "Types of Tokens | gold.com.vc"
description: "How SOLOMON classifies tokens by how their supply is deployed: Distributed, Pure Liquid, Pure Liquid Gold, and Layered Liquid."
eyebrow: "TYPES OF TOKENS"
include_concepts: true
---

# Types of Tokens

Most tokens are described by *what they represent* — a coin, a stablecoin, a
governance share. SOLOMON tokens are easier to understand by *how their
supply is deployed*. The labels below are the vocabulary we use across the
ecosystem.

## Section A — Unique token types

### Distributed Tokens

A "distributed token" is the familiar baseline: supply is minted and then
spread across holder wallets, exchanges, treasuries, and rewards programs.
Trades happen wherever buyers and sellers meet, and the token's market
liquidity depends on whoever happens to provide it.

SOLOMON-family distributed tokens add one twist: a small transfer fee that
is captured each time the token moves. Those fees feed liquidity, rewards,
or buybacks instead of being lost to spread. This is the foundation that
makes the more specialized token types below worth building on.

### Pure Liquid

A **Pure Liquid token** does not start its life in wallets. Instead, **100%
of supply is placed into ranged liquidity positions in secure pools on day
one**, with the backing asset committed entirely above the starting price.
Until someone buys, the token literally only exists as inventory inside the
pool.

That design makes three properties true at launch:

- **Backed by liquidity rather than promises.** The backing asset is deposited
  in the same pools as the token, in the visible range where trades happen.
- **No insider supply overhang.** There is no founder bag waiting to dump,
  because no wallets hold supply yet.
- **Honest price discovery.** Every unit acquired requires buying through
  the public pool at a real, observable price.

Risk and disclaimer detail live in the [Legal Disclaimers](legal.html); the
description above is a design summary, not a guarantee of returns.

### Pure Liquid Gold

A **Pure Liquid Gold token** is a Pure Liquid token whose backing asset is a
**redeemable-for-physical-gold token** — PAXG, XAUT, or another LBMA-grade
issuer's product. The physical gold continues to sit in the audited custody
of that issuer; SOLOMON's job is to put the on-chain liquidity around it.

The combination is intentional:

- The issuer (Paxos, Tether, etc.) handles vaulting, audits, and physical
  redemption.
- The Pure Liquid design adds **deep, ranged liquidity** in the pool, so
  buyers and sellers always have an on-chain venue.
- The transfer fee feeds back into more liquidity, deepening the same pool
  that backs the token.

Redemption to physical metal flows through the underlying issuer's
processes, not through SOLOMON contracts. See the
[Redemption Disclaimer](legal.html#redemption-disclaimer) for the formal
terms.

### Layered Liquid

A **Layered Liquid token** is a token whose backing is itself a Pure Liquid
token. Picture an inner Pure Liquid (for example, Pure Liquid Gold) that is
already fully deployed into a pool. A Layered Liquid token wraps that inner
token and is itself launched Pure Liquid against it.

The outer layer can carry different economics (different fee schedules,
distribution programs, or chain coverage) while inheriting the inner
layer's liquidity backbone. In short: it is **Pure Liquid stacked on Pure
Liquid**.

### Liquid for a Pure Liquid

"Liquid for a Pure Liquid" is the short name for the **secondary liquidity
layer** around an existing Pure Liquid token. Where the inner Pure Liquid
provides the base inventory range, this outer layer extends depth on either
side of that range, or onto additional chains, so users see a smoother book
end-to-end. Layered Liquid is the structured product; "Liquid for a Pure
Liquid" is the role the outer layer plays.

<!-- PAGE: generating-wealth -->
---
title: "Generating Wealth | gold.com.vc"
description: "The three sources of wealth in the SOLOMON design: the 2% token transfer fee, liquidity provision fees, and appreciation of the underlying gold backing."
eyebrow: "GENERATING WEALTH"
include_concepts: true
---

# Generating Wealth

The SOLOMON design has **three distinct sources of wealth**, and they
compound at different speeds. Reading them together makes the rest of the
site easier to evaluate.

## Sources of wealth

### 1. The token (2% transfer fee)

Every trade of a SOLOMON-family token pays a built-in **2% transfer fee**.
Half of that fee is routed to partners proportional to their long-term
commitment; the other half is reinvested into buybacks and market-making
that deepen the same pools the token trades in.

The transfer fee is not a yield product on its own — it is a *flow* tied to
how much the token is being used. More volume on more chains means a larger
flow through the fee surface. Estimates of partner APY referenced elsewhere
on this site (for example 24–40%+) are scenarios derived from internal
modelling and are not guaranteed; see the [Legal Disclaimers](legal.html)
before relying on any specific number.

### 2. Providing liquidity

Anyone (including the protocol itself) who provides liquidity to a SOLOMON
pool earns the **swap fees** from trades that route through their range.
This is independent of the 2% transfer fee — it is the standard
concentrated-liquidity market-maker model.

Two key tradeoffs to remember:

- **Range matters.** Your position earns fees only when the pool's price is
  inside your range. Outside it, you are fully in one asset and idle.
- **Inventory exposure.** As the price moves, your position rebalances; if
  the pair moves a lot relative to where you entered, you can underperform
  simply holding the assets (impermanent loss).

The advantage in SOLOMON pools is that the transfer-fee reinvestment
side-loads additional liquidity above and beyond what passive LPs would
contribute on their own, which can densify the same range where you earn
fees.

### 3. Appreciation of the underlying assets

The third lever is the slowest and the deepest: the **price behavior of the
backing asset itself**. For gold-backed tokens, that means the long-term
appreciation of physical gold against fiat.

Gold has historically served as a long-cycle store of value, but it does
not pay a yield, and short-term price moves can be sharp in either
direction. The point is not to predict the gold price; it is to recognize
that **SOLOMON denominates wealth in something other than the fiat unit it
trades against**. When fiat units expand, the same gram of backing is
typically priced higher in those units; when they contract, the opposite is
true. None of this is investment advice — see the
[Cryptocurrency Market Volatility](legal.html#cryptocurrency-market-volatility)
section for the formal risk framing.

## Putting the three together

The three sources are intentionally additive:

- **The transfer fee** captures *flow*.
- **Liquidity provision** captures *spread*.
- **Underlying appreciation** captures *long-cycle store of value*.

A position that participates in all three sees the smallest source compound
into the largest over a long enough horizon. None of them are guaranteed,
and all of them are subject to the disclosures on the
[Legal Disclaimers](legal.html) page.

<!-- PAGE: legal -->
---
title: "SOLOMON Token Legal Disclaimer & Risk Disclosure | gold.com.vc"
description: "Important information about risks associated with SOLOMON Tokens."
eyebrow: "LEGAL DISCLAIMERS"
main_class: "page-main legal-doc"
include_concepts: false
---

# SOLOMON Token Legal Disclaimer & Risk Disclosure

<p class="legal-lead">Important information about risks associated with SOLOMON Tokens</p>

## General Disclaimer

The information contained in this and linked docs is provided for general
informational purposes only. Nothing here or mentioned constitutes financial
advice, purchase advice, legal advice, or a recommendation to purchase,
sell, or hold any digital asset. Users should conduct their own independent
research and consult professional advisors before making any financial or
purchase decisions.

SOLOMON Tokens are digital tokens designed to represent the value of more
regulated tokens that have either a regulated ETF, other gold-backed
stocks, or physical gold held in secure vault facilities. Ownership of
SOLOMON Tokens does not constitute ownership of shares in the issuing
company, nor does it grant any equity, voting rights, or ownership interest
in any corporate entity.

The issuer makes no guarantees regarding future market performance,
liquidity, or price stability of SOLOMON Tokens.

Redeemability of SOLOMON for other tokens is fulfilled through the
automated market makers, not Tetra Grids.

## Gold Backing Disclosure

Each SOLOMON Token is designed to represent an amount of other gold-backed
tokens centering around 1/360th of a Talent of gold per SOLOMON.

Gold prices fluctuate due to global market conditions, and the value of
SOLOMON Tokens may change accordingly.

## Digital Asset Risk

Digital assets involve a high degree of risk. Users should carefully
consider the risks associated with blockchain-based tokens before acquiring
SOLOMON Tokens.

Risks include, but are not limited to:

- blockchain network failures
- smart contract vulnerabilities
- cyber security incidents
- loss of private keys
- market volatility
- liquidity constraints

The issuer does not guarantee uninterrupted operation of blockchain
networks, exchanges, or digital wallets used in connection with SOLOMON
Tokens.

## Cryptocurrency Market Volatility

The market value of SOLOMON Tokens may fluctuate significantly over short
periods of time. SOLOMON Tokens represent digital units whose value is
linked to the market value of physical gold. While gold has historically
served as a store of value, the price of gold may fluctuate due to global
economic conditions, interest rates, currency movements, geopolitical
developments, and market demand. As a result, the value of SOLOMON Tokens
may rise or fall in line with the underlying gold price, and token holders
may experience gains or losses.

Although SOLOMON Tokens are linked to the value of physical gold, their
market price on digital asset exchanges may differ from the underlying gold
value due to supply and demand dynamics, liquidity conditions, and trading
activity.

Users should be aware that digital asset markets are highly volatile and
speculative.

## Exchange Risk

SOLOMON Tokens may be traded on third-party digital asset exchanges. The
issuer does not operate, control, or guarantee the operations of any
exchange platform.

Trading on digital asset exchanges involves risks including:

- exchange insolvency
- cyberattacks or hacks
- liquidity shortages
- trading suspension
- operational failures

Users assume full responsibility for selecting and interacting with any
exchange platform.

## Smart Contract Risk

SOLOMON Tokens are issued using blockchain-based smart contracts. While
security measures and audits may be implemented, smart contracts are
subject to potential coding vulnerabilities, software bugs, or exploits.

Such vulnerabilities could result in loss of tokens, unintended transfers,
or disruptions to token functionality.

Users acknowledge and accept these risks when interacting with blockchain
technology.

## Custody Risk

The physical gold supporting SOLOMON Tokens is stored with professional
vault and custody providers. However, custody arrangements may be exposed
to risks including:

- operational failures
- security breaches
- insolvency of service providers
- force majeure events

In addition, token holders managing their own digital wallets must
safeguard private keys; loss or compromise of private keys may result in
permanent loss of access to SOLOMON Tokens.

While safeguards and insurance may be in place, no custody system is
completely risk-free.

## Regulatory Risk

Digital asset regulations continue to evolve globally. Changes in laws or
regulatory policies may impact the issuance, trading, custody, or
redemption of SOLOMON Tokens.

Regulatory actions in certain jurisdictions may restrict or prohibit the
use, ownership, or transfer of digital assets. The issuer does not
guarantee that SOLOMON Tokens will remain available in all jurisdictions.

Users are responsible for ensuring compliance with the laws and regulations
applicable in their jurisdiction.

## No Guarantee of Liquidity

The issuer does not guarantee that a secondary market for SOLOMON Tokens
will exist or continue to exist. The availability of buyers or sellers on
exchanges may vary, and users may not be able to sell their tokens at
desired prices or timeframes.

Review liquidity depth, documented venues, and your own risk tolerance before acquiring
SOLOMON.

## Experimental token; no expectation of profit

SOLOMON Tokens are **experimental digital assets**. They are not registered
securities or investment products. **No person represents that you should
expect any particular return, profit, or outcome** from acquiring, holding, or
using SOLOMON Tokens. By choosing to hold or use SOLOMON Tokens, you agree that
you are **participating in an experiment** in token design, liquidity routing,
and cross-chain infrastructure—and that you may lose the entire value of your
position.

## Redemption Disclaimer

Redemption of SOLOMON Tokens for physical gold is via the underlying assets
(like PAXG, XAUT) and may be subject to:

- minimum redemption quantities
- identity verification procedures
- logistics and vault handling fees
- processing times
- regulatory compliance requirements

Redemption processes may change at the discretion of the third party
issuers or due to regulatory or operational requirements.

## Jurisdictional Restrictions

SOLOMON Tokens are not offered to individuals or entities located in
jurisdictions where the purchase, holding, or trading of digital assets is
prohibited or restricted by law.

Users are solely responsible for ensuring that their acquisition or use of
SOLOMON Tokens complies with applicable laws in their jurisdiction.

## Counterparty Risk

The SOLOMON ecosystem may involve multiple third-party service providers,
including custodians, vault operators, digital liquidity pools, auditors,
exchanges, liquidity providers, and technology partners, and all underlying
assets. Failure, insolvency, or operational disruptions involving any such
counterparties may impact the functionality, liquidity, or settlement of
SOLOMON Tokens.

## Force Majeure and Market Disruption Risk

Extraordinary events such as geopolitical conflicts, financial market
disruptions, government interventions, or force majeure circumstances may
affect gold markets, custody arrangements, trading infrastructure, or
blockchain networks. Such events may temporarily or permanently impact the
issuance, redemption, or trading of SOLOMON Tokens through various
partners.

## Limitation of Liability

To the fullest extent permitted by law, the issuer, its affiliates,
partners, and service providers shall not be liable for any direct,
indirect, incidental, consequential, or special damages arising from the
use of SOLOMON Tokens or reliance on information provided on this website.

<!-- PAGE: new-earth -->
---
title: "Solomon's New Earth | gold.com.vc"
description: "How SOLOMON reinvests transfer fees into liquidity (\"gilding\"), cross-chain coverage via LayerZero from Solana, and why hard-asset rails matter amid global debt trends."
eyebrow: "SOLOMON'S NEW EARTH"
include_concepts: false
---

# Solomon's New Earth

Half of the collected transfer fee is reinvested to "gild" the system:
capital is deployed into new and deeper liquidity pools so swaps and bridges
face tighter paths. That expands real routes and makes SOLOMON more usable
across gold- and crypto-denominated markets (see mechanics on
[Types of Gold](info.html) and terms in [Legal Disclaimers](legal.html)).

The purpose is concise: connect audited hard-asset liquidity to digital
markets at a time when aggregate debt stocks remain historically large
relative to world GDP — themes the IMF tracks in its
[Global Debt Database / Fiscal analysis](https://www.imf.org/en/blogs/articles/2025/09/17/global-debt-remains-above-235-of-world-gdp).
SOLOMON does not fix macro policy; it is infrastructure that makes
gold-linked value easier to move and price on-chain.

## Purposes

<div class="content-table-wrap">
  <table class="content-table">
    <thead>
      <tr>
        <th>What</th>
        <th>How</th>
        <th>Why</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bridge gold liquidity with crypto markets</td>
        <td>
          Deploy transfer-fee liquidity into gold-crypto pools to deepen trading paths and make gold collateral usable
          across chains.
        </td>
        <td>
          Cuts friction between traditional store-of-value holdings and on-chain capital markets so gold-linked tokens can
          clear and compose where traders and treasuries already operate.
        </td>
      </tr>
      <tr>
        <td>Gold-linked references for large balance sheets</td>
        <td>
          Build transparent gold-linked liquidity rails that treasuries, funds, and protocols can use alongside
          fiat-denominated books—optional collateral and pricing references, not a replacement for legal sovereign issuance.
        </td>
        <td>
          As interest burdens and rollover schedules pressure public and private balance sheets (standard fiscal-risk
          topics in IMF and central-bank research), auditable scarce assets can add a verifiable axis next to nominal debt.
        </td>
      </tr>
      <tr>
        <td>Everyday access on more chains</td>
        <td>
          <p>
            SOLOMON brings gold-backed exposure where people already transact.
            <strong>Solana mainnet</strong> is the LayerZero <abbr title="Omnichain application">OApp</abbr> source;
            endpoint id <strong>30168</strong> is the Solana mainnet EID in LayerZero's
            <a href="https://docs.layerzero.network/v2/deployments/chains/solana" target="_blank" rel="noopener">V2 Solana deployment docs</a>
            (devnet uses the <code>40xxx</code> testnet band). The following <strong>28 EVM destinations</strong> had a
            verified Sol&rarr;EVM minimum canary in this project's internal operations record at the time this page was updated:
          </p>
          <ul class="solomon-chain-list">
            <li>Ethereum</li>
            <li>Arbitrum</li>
            <li>Optimism</li>
            <li>Base</li>
            <li>BSC</li>
            <li>Polygon</li>
            <li>Avalanche</li>
            <li>Linea</li>
            <li>Mantle</li>
            <li>Blast</li>
            <li>Scroll</li>
            <li>Manta Pacific</li>
            <li>opBNB</li>
            <li>Fraxtal</li>
            <li>Gnosis</li>
            <li>Celo</li>
            <li>Moonbeam</li>
            <li>Harmony</li>
            <li>Kava</li>
            <li>Cronos (EVM)</li>
            <li>Berachain</li>
            <li>Monad</li>
            <li>Plasma</li>
            <li>Rootstock</li>
            <li>HyperEVM</li>
            <li>Katana</li>
            <li>Sei</li>
            <li>Ink</li>
            <li>Stable</li>
          </ul>
          <p class="chain-list-note">
            <strong>Excluded from this list:</strong> Flare (<a href="https://docs.layerzero.network/v2/deployments/chains/flare" target="_blank" rel="noopener">EID 30295</a>) and Hedera
            (<a href="https://docs.layerzero.network/v2/deployments/chains/hedera" target="_blank" rel="noopener">EID 30316</a>) appear in LayerZero's chain registry but had no successful Sol&rarr;EVM min canary in the ops record at the time of this page.
            Cross-check live configuration in LayerZero's
            <a href="https://docs.layerzero.network/v2/deployments/deployed-contracts" target="_blank" rel="noopener">deployed endpoints</a> before integrating.
          </p>
        </td>
        <td>
          More users can hold and move gold-linked value in familiar wallets and ecosystems, improving real utility
          instead of siloing liquidity on one network.
        </td>
      </tr>
    </tbody>
  </table>
</div>

## Author and Context

The author maintains the
[Web 4](https://github.com/dougbutner/web-4) manifesto and a
[Global Debt Reset](https://github.com/dougbutner/web-4/tree/master/Global-Debt-Reset)
outline in that repository (conceptual documents, not financial advice).

On [XPR Network](https://xprnetwork.org/), the author shipped the smart
contract behind EASY — a reflexive-reward community token on Alcor where
transfer-fee mechanics feed liquidity and holder-directed reward routes
(community discussion:
[r/XPRNetwork](https://www.reddit.com/r/XPRNetwork/comments/1ohumbv/what_is_easy/));
analytics:
[EASY on Alcor](https://alcor.exchange/v/xpr/analytics/tokens/easy-mon3y).
Network scale moves with markets; see
[DefiLlama: XPR Network](https://defillama.com/chain/xpr-network) for
current TVL context.
