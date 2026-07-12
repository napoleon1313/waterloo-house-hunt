# Waterloo Group House Search Spec (Fall 2026)

This is the canonical search spec. The daily update task re-runs this search and refreshes `listings.json`. Do not edit `index.html` for data changes; it renders whatever is in `listings.json`. The site has two pages: `index.html` (live, current listings) and `history.html` (read-only weekly archive, see the Weekly Archive section below). `style.css` and `site.js` are shared by both pages, only touch them for site-wide styling or the `card()`/`cardList()` rendering logic, never for weekly data.

## Objective
Rental search for University of Waterloo co-op students leasing a property together in Waterloo, Ontario. The site covers 3, 4, 5, and 6 bedroom options side by side (filterable on the site) since the group size under consideration has varied. Search broadly across the rental ecosystem, verify listing quality and legitimacy, rank results.

## Lease scenarios (tag every result A, B, or Both)
- Scenario A: 4-month lease, September to December 2026.
- Scenario B: 12-month lease (September 2026 to August 2027).

## Non-negotiable requirements
- Commute to UW main campus: 20 minutes or less. Report both driving (weekday ~8:30 a.m.) and GRT/ION transit where available. Mark estimates as (est.).
- House strongly preferred; townhouse or apartment as fallback if it scores well.
- One lease for the whole property preferred. Flag individual-lease-only or partial-floor-only listings as fallback tier (or exclude if a duplicate of an already-screened partial-lease address), never top picks.
- Bedroom pools to maintain, each targeting roughly 15 verified listings: 2 bedroom, 3 bedroom, 4 bedroom, 5 bedroom, 6 bedroom (1+ bathroom minimum for 2/3-bed, 2+ preferred for 4-bed and up). Don't force the count; report the real total honestly if a pool falls short (as of 2026-07-12: 6 two-bed, 16 three-bed, 17 four-bed, 22 five-bed, 6-bed pool still thin at 1; 64 listings total). 2-bed and 6-bed are the thinnest, prioritize those.
- Budget scales with bedroom count; don't apply the original 5-6 person $3,500-$6,500 band to smaller units. Report total rent and per-bedroom rent for every listing (the site computes per-bedroom automatically).

## Sources to check every pass (log accessibility in sourceCoverage)
- KeyHomes (keyhomes.ca, MLS aggregator; the strongest fetchable source, try the general Waterloo feed and bedroom-filtered listing pages plus property detail pages)
- Kijiji: student housing category (kijiji.ca/b-ontario/student-housing-waterloo/k0l9004), main KW rentals with 4/5/6+ BR filters, and sublet-specific searches for Scenario A
- Zumper houses and apartments pages (zumper.com/houses-for-rent/waterloo-on and /apartments-for-rent/waterloo-on)
- UWrent (uwrent.com, has a multi-property cluster on University Ave W and Albert St), RentWoch (rentwoch.com, check the full /properties catalog not just the homepage), KW4Rent, HRS Property, Schembri Property Management, other local PMs found via search
- Liv.rent, PadMapper, Craigslist KW (housing and sublet categories)
- Bamboo Housing (bamboohousing.ca) — see the dedicated crawl method below, this is currently the single best source for genuine Scenario A per-room sublets
- Web searches for: "house for rent Waterloo 5/6 bedroom September 2026", "Waterloo sublet September December 2026", reddit r/uwaterloo and r/kitchener housing/subletting threads (WebFetch is blocked on reddit.com, search only), new local property managers
- Known blocked to automation (403/401, note but skip): Rentals.ca, Point2Homes, Apartments.com, RentBoard, RentSeeker, Zolo, SquareYards, Mitula, Realtor.ca, Rentfaster, Rew.ca, Condos.ca, Places4Students. Facebook requires login; remind readers to check manually. Zoocasa and HonestDoor load but rarely have usable Waterloo rental inventory.

## Scam and quality screen
Exclude: wire-transfer or deposit-before-viewing requests, no verifiable address, stock-photo-only listings, landlords with multiple recent public complaints, stale listings without recent confirmation, and listings with internally inconsistent pricing across different ad copies (soft scam-adjacent signal, e.g. two different per-room rates quoted for the same address). If a promising address can't be independently verified (map location, second source, or a live detail page), leave it out rather than guessing.

## Scenario A reality check (CORRECTED 2026-07-12, read this before writing scenarioANote)
An earlier version of this spec said genuine Scenario A (4-month, Sept-Dec) leases were "essentially absent from the market." That was wrong: it was a tooling gap (WebFetch cannot execute JavaScript, so it silently returned an empty shell for Bamboo Housing, a JS-rendered site), not a market gap. A user manually found a real listing and reported it; investigating properly turned up 914 active Bamboo Housing listings for Waterloo, 739 of them "4 Month Sublet." Do not repeat this mistake: if a source looks JS-rendered and returns suspiciously little content via a plain fetch, that is a signal to dig for the underlying data (see the Bamboo Housing crawl method below), not a signal that the category of listing doesn't exist.

The corrected picture: most of Bamboo's 4-month sublets run May-August (summer co-op subletting, not what this group needs), but a real September pocket exists (roughly 15-25 listings starting between late August and September 1 each time this is checked). These are individual per-room subleases, not one lease for the whole group, but a meaningful minority have 2+ rooms of the same address posted together, which is the closest real-world approximation of a whole-group Scenario A match. When writing scenarioANote each run:
- Report the actual current count of clean September-start 4-month listings found (after the scam/date/commute screen), not a vague "essentially none."
- Call out by address any listing where RoomsAvailable is close to or equal to TotalBedrooms (near-whole-unit matches deserve top tier and explicit mention).
- Keep the `askAboutShortTerm: true` flag on the strongest whole-house Scenario B listings too (aim for around 10) since asking a private landlord to shorten a 12-month lease is still a live parallel option, not a replacement for the Bamboo Housing sublets.
- Never claim a category of listing "doesn't exist" without having actually crawled the JS-rendered sources properly first.

## Bamboo Housing crawl method (do this every pass, it is currently the best Scenario A source)
Bamboo Housing looks JS-rendered (a plain fetch of the marketing homepage returns an empty shell) but it is actually server-rendered per-page: every real listing URL and every paginated homepage URL embeds the full listing data in a `<script id="__NEXT_DATA__" type="application/json">` block. No headless browser is needed, a plain HTTP fetch with a normal browser User-Agent works, but WebFetch's markdown conversion strips the script tag, so fetch the raw HTML directly (curl, or an HTTP client with SSL verification working) and parse the JSON yourself.
1. Fetch `https://bamboohousing.ca/homepage?page=N` for N = 1 upward (Waterloo was 31 pages / ~914 listings as of 2026-07-12; check `pageProps.totalPages` on page 1 to know when to stop). Pace requests (~0.3-0.5s apart) to be polite.
2. Extract the JSON from the `__NEXT_DATA__` script tag on each page; `pageProps.listings` is an array of full listing objects with: `Address`, `Latitude`/`Longitude`, `TotalBedrooms`, `Ensuite` (use as bathroom count), `Price` (per room, not total), `RoomsAvailable`, `Buildingtype`, `Coed`, `RentFrom` (ISO date), `RentDuration` (months), `LeaseType`, `Title`, `Description`, `Utilities` (extra monthly charge), `MainUrl` + `ImageUrls` (real hotlinkable photos), and `_id` (build the listing URL as `https://bamboohousing.ca/listings?_id=<_id>`).
3. Dedupe by `_id` across pages, then filter: `RentDuration == 4` and `RentFrom` starting in the target month(s) for Scenario A (currently late August through September for a Sept-Dec placement).
4. Quality screen before including: skip listings whose Title or Description contains phrases like "not accepting any more applications," "no longer available," "room filled" (a listing can be technically live but functionally closed); skip listings where the Title contradicts the structured data (e.g. title says "1 YEAR SUBLEASE" but RentDuration is 4, or a stale year appears in the title); compute commute via straight-line distance from `Latitude`/`Longitude` to UW main campus (43.4723, -80.5449), roughly km * 2.8 minutes for a driving estimate in this small city, and drop anything past ~20 min equivalent (~6.5 km straight-line as a rough cutoff).
5. Group survivors by `Address` to spot near-whole-unit opportunities: if the sum of `RoomsAvailable` across postings at one address is close to `TotalBedrooms`, that address is a strong candidate, flag it as such and note any other posting(s) at the same address so the group knows to ask about combining them.
6. Map fields to the site schema: `perRoomRent = Price` (leave `totalRent` null unless you're intentionally summing multiple rooms at one address into a single combined listing), `beds = TotalBedrooms`, `baths = Ensuite`, `type = Buildingtype`, `wholeLease = false` always (Bamboo is inherently per-room), `photos` = up to 4 of `[MainUrl, ...ImageUrls]`, `source = "Bamboo Housing"`, `utilities` = describe the `Utilities` figure as an extra monthly charge if nonzero.
7. This same method works for any bedroom pool, not just Scenario A: filter `RentDuration == 12` instead for Scenario B whole-property-ish candidates (multiple `RoomsAvailable` at one address = a lease-takeover or multi-room posting worth flagging the same way), or filter by `TotalBedrooms` directly to top up thin pools like 2-bed or 6-bed.
8. Bamboo Housing holds far more listings than get curated onto the site each pass; note in scenarioANote or sourceCoverage that the group can browse bamboohousing.ca directly for anything a given pass didn't pick up.

## Ranking weights (heaviest first)
1. Commute (under 10 min best, 10 to 20 qualifies)
2. Price fit (ideal $4,000-$5,000 total for 5-6 bed; for smaller units judge per-bedroom rent against comparable listings in the same pool instead)
3. House over apartment or condo
4. Bed/bath fit for the bedroom count (fewer bathrooms than bedrooms is a real minus, flag it)
5. Single whole-group lease over per-room or partial-floor
6. Quality signals, no red flags (unusually high maintenance fees, bathroom counts that look implausible for the unit size, or partial-floor leases pitched as full houses should be flagged prominently, not silently smoothed over)

## Data fields per listing (keep schema identical to existing entries)
rank, tier (top/honourable/fallback), address, neighbourhood, totalRent, perRoomRent, beds, baths, type, leaseTerm, scenario, wholeLease, commuteDrive, commuteTransit, parking, utilities, furnished, source, url, listed, pros, cons, flags (array), askAboutShortTerm (boolean, see Scenario A reality check above), photos (array of 0-4 direct image URLs).

## Photos policy
- Photos are HOTLINKED from the original listing sites, never downloaded into this repo. Listing photos belong to the brokerages and landlords; this site only references them and credits the source in the footer. Do not commit image files.
- Extraction per source: KeyHomes exposes numbered gallery images matching `keyhomes.ca/img/..._N.webp` (take _1 to _4); Kijiji pages embed `media.kijiji.ca/api/v1/.../images/<hash>` URLs in their JSON (append `?rule=kijijica-640-webp`, verified to serve webp); UWrent uses WordPress uploads (skip `-WxH.jpg` thumbnail variants). Zumper category pages and RentWoch/Liv.rent homepage-style URLs have no per-listing gallery, leave photos [] and the site renders NO PHOTO tiles.
- When adding a new listing, extract up to 4 photo URLs from its detail page with the patterns above (plain HTTP fetch with a browser User-Agent works; keep 1-3 s between KeyHomes requests, they rate-limit bursts). When re-verifying an existing listing, if its page still loads, refresh its photos array too; the front end shows NO SIGNAL tiles when a hotlinked image has died.
- Archived weeks in archive/ predate or freeze whatever photos existed at snapshot time; never backfill photos into an already-archived week.

## Weekly archive (immutable, do not skip this step)
The `archive/` directory holds one frozen snapshot of `listings.json` per ISO week, plus `archive/index.json` which lists them. This is a historical record, not a cache: once a week is archived, that file must never be edited, overwritten, or deleted again, by this task or any other. Do not "fix" an old week's data even if you later realize something in it was wrong; the record is supposed to reflect what the site actually showed at the time.

Every run of the daily task:
1. Compute the current ISO week (`date +%G-W%V`, e.g. `2026-W28`).
2. Check `archive/index.json` for an entry with that `isoWeek`. If one already exists, do nothing further here, the week is already archived and must stay untouched.
3. If no entry exists for the current ISO week, this is the first run of a new week: after completing today's normal listings.json refresh (steps 1-4 below), create a new archive snapshot:
   - Compute the Monday of the current ISO week for the label (`date -v-$(($(date +%u)-1))d +%Y-%m-%d` on macOS, or `date -d "monday this week" +%Y-%m-%d` on Linux).
   - Write `archive/<isoWeek>.json`: the full current `listings.json` object (same structure, all fields) with two fields added at the top: `weekLabel` (e.g. `"Week of July 13, 2026"`) and `isoWeek`, plus `archivedAt` (today's date).
   - Prepend a new entry to the `weeks` array in `archive/index.json` (most recent first) with: `weekLabel`, `isoWeek`, `dateRange` (e.g. `"Jul 13 - Jul 19, 2026"`), `archivedAt`, `file` (just the filename, e.g. `"2026-W29.json"`), `listingCount`, `tierCounts` ({top, honourable, fallback} counts), and `topPick` (address, totalRent, beds, baths, commuteDrive, url of the rank-1 listing).
   - Validate both archive files parse as JSON before committing.

## Pricing mechanism
Per-person price is never a manually picked global number. `site.js`'s `card(l, occExtra)` always divides a listing's total rent by `l.beds + occExtra`, where `occExtra` is 0 or 1 from the "double up a room" toggle on the page. Do not reintroduce a standalone "split rent between 5/6 people" control, it was replaced deliberately because it required manual toggling to stay correct across different bedroom filters.

## Note on the scheduled task's cadence
Scheduled tasks only fire while the Claude app is open; if it's closed on a given day, that day's run simply doesn't happen (it does not queue up or run late). Gaps of several days between commits are expected if the app wasn't open, not a bug, don't try to "catch up" by fabricating what would have changed on missed days, just run the normal procedure for today.

## Daily update procedure
1. Re-check every listing currently in `listings.json`: still live? price changed? If gone, remove it and note in UPDATE_LOG.md. Never remove a listing just to make room for a new one; only remove confirmed-dead ones.
2. Sweep the sources above for new qualifying listings, including Scenario A sublet searches; verify detail pages before adding. Don't force the total count; only add genuinely verified listings.
3. Recompute ranks and tiers after changes. Update `lastUpdated` (YYYY-MM-DD), `actFast`, `scenarioANote`, `askAboutShortTerm` flags, and `sourceCoverage`.
4. Keep JSON structure identical to the existing file. Validate JSON before committing (ranks contiguous 1..N, tiers and askAboutShortTerm counts sane).
5. Run the Weekly archive step above.
6. Append a dated 2-4 line entry to UPDATE_LOG.md (added/removed/price changes/nothing new, plus a note if a new week was archived).
7. Commit and push to main; GitHub Pages serves the update automatically.

## Style
Canadian English, no em dashes, no emojis. Newsletter tone, concise.
