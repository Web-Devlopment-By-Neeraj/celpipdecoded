# Manual QA tracker

Sahil (and team) use this file while testing **staging** and local dev. Tick a line when the fix or feature is **merged to** `staging` (not only when it works on your machine).

**Branch naming:** one branch per chunk of work, e.g. `sahil/some-ui-fixes`, `sahil/dashboard-gaps` — bugs, gaps, and small features can share the same branch if the PR stays easy to review.

**How to update**

1. Add a row when you find something (copy the template at the bottom).
2. Open a branch from `staging`, fix, PR → merge to `staging`.
3. Change `- [ ]` to `- [x]` on this file in the same PR (or a quick follow-up PR) so everyone sees progress on `staging`.

**Severity (optional):** `P0` blocker · `P1` important · `P2` polish · `P3` nice-to-have

---



## Bugs


- [x] *Ai assist not Listining — NOt lisiting and there is speaking delay:* Mic stays on, and replies speak in the browser without waiting on the speech API (`P1`) · branch: `sahil/qa-tracker-fixes`

- [x] *All the task card has number one  "1" — Task numbers should be in numberic order:* Writing cards use sort order (`P1`) · branch: `sahil/qa-tracker-fixes`

---



## Gap fixes

Things that work but feel incomplete, confusing, or missing copy/empty states.

- [x] *When timer stops there should be a PopUp warning  — with sound and close button :* Writing practice and exam countdown (`P2`) · branch: `sahil/qa-tracker-fixes`

---



## Pending features

Not built yet or explicitly out of scope until a ticket is done.

- [x] *Add Stripe  — Add stripe keyys are pending - :* Test key checked (HTTP 200, test mode). Checkout opens a Stripe session. Secret stays in local env, not in git. Webhook secret is still needed before a payment unlocks access (`P0`) · branch: `sahil/qa-tracker-fixes`

- [x] *Discount-Dialog-box — when user scrool full home page then at the end when he is about to leave the app then we show a discount price popoup:* 15% leave offer (`P2`) · branch: `sahil/qa-tracker-fixes`

- [x] *Add PWA and dark mode  — :* Manifest, icons, service worker, and a Dark/Light control (`P1`) · branch: `sahil/qa-tracker-fixes`



---





## Template (copy below each section)

```markdown
- [ ] **Area:** short title — steps to reproduce or what’s missing (`P1`) · branch: `sahil/...` · PR: #
```

