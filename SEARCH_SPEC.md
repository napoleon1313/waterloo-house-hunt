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
- Bedroom pools to maintain, each targeting roughly 15 verified listings: 3 bedroom, 4 bedroom, 5 bedroom, 6 bedroom (1+ bathroom minimum for 3-bed, 2+ preferred for 4-bed and up). Don't force the count; report the real total honestly if a pool falls short (as of 2026-07-07: 14 three-bed, 15 four-bed, 15 five-bed, 6-bed pool still thin at 1).
- Budget scales with bedroom count; don't apply the original 5-6 person $3,500-$6,500 band to smaller units. Report total rent and per-bedroom rent for every listing (the site computes per-bedroom automatically).

## Sources to check every pass (log accessibility in sourceCoverage)
- KeyHomes (keyhomes.ca, MLS aggregator; the strongest fetchable source, try the general Waterloo feed and bedroom-filtered listing pages plus property detail pages)
- Kijiji: student housing category (kijiji.ca/b-ontario/student-housing-waterloo/k0l9004), main KW rentals with 4/5/6+ BR filters, and sublet-specific searches for Scenario A
- Zumper houses and apartments pages (zumper.com/houses-for-rent/waterloo-on and /apartments-for-rent/waterloo-on)
- UWrent (uwrent.com, has a multi-property cluster on University Ave W and Albert St), RentWoch (rentwoch.com, check the full /properties catalog not just the homepage), KW4Rent, HRS Property, Schembri Property Management, other local PMs found via search
- Liv.rent, PadMapper, Craigslist KW (housing and sublet categories)
- Web searches for: "house for rent Waterloo 5/6 bedroom September 2026", "Waterloo sublet September December 2026", reddit r/uwaterloo and r/kitchener housing/subletting threads (WebFetch is blocked on reddit.com, search only), new local property managers
- Known blocked to automation (403/401, note but skip): Rentals.ca, Point2Homes, Apartments.com, RentBoard, RentSeeker, Zolo, SquareYards, Mitula, Realtor.ca, Rentfaster, Rew.ca, Condos.ca, Places4Students. Facebook requires login; remind readers to check manually. Zoocasa and HonestDoor load but rarely have usable Waterloo rental inventory.

## Scam and quality screen
Exclude: wire-transfer or deposit-before-viewing requests, no verifiable address, stock-photo-only listings, landlords with multiple recent public complaints, stale listings without recent confirmation, and listings with internally inconsistent pricing across different ad copies (soft scam-adjacent signal, e.g. two different per-room rates quoted for the same address). If a promising address can't be independently verified (map location, second source, or a live detail page), leave it out rather than guessing.

## Scenario A reality check
As of the 2026-07-05 deep dive, genuine whole-group 4-month (Sept-Dec) leases are essentially absent from the market this early. Waterloo's co-op calendar means departing students sublet individual rooms, not whole houses as a group, and most fall-term sublet posts do not appear until August. Do not fabricate or force Scenario A matches to hit a target count. Instead:
- Report honestly how many genuine Scenario A whole-group matches exist (may be zero).
- Maintain the `askAboutShortTerm: true` flag on the strongest Scenario B listings (aim for around 10) where a private or small landlord seems likely to consider a 4-month term if asked. Prioritize small private landlords (UWrent-style, individual Kijiji listers) over agents or corporate management for this flag.
- Re-check Kijiji sublet categories and Reddit/Facebook-indexed search each pass since real Scenario A inventory should start appearing through August.

## Ranking weights (heaviest first)
1. Commute (under 10 min best, 10 to 20 qualifies)
2. Price fit (ideal $4,000-$5,000 total for 5-6 bed; for smaller units judge per-bedroom rent against comparable listings in the same pool instead)
3. House over apartment or condo
4. Bed/bath fit for the bedroom count (fewer bathrooms than bedrooms is a real minus, flag it)
5. Single whole-group lease over per-room or partial-floor
6. Quality signals, no red flags (unusually high maintenance fees, bathroom counts that look implausible for the unit size, or partial-floor leases pitched as full houses should be flagged prominently, not silently smoothed over)

## Data fields per listing (keep schema identical to existing entries)
rank, tier (top/honourable/fallback), address, neighbourhood, totalRent, perRoomRent, beds, baths, type, leaseTerm, scenario, wholeLease, commuteDrive, commuteTransit, parking, utilities, furnished, source, url, listed, pros, cons, flags (array), askAboutShortTerm (boolean, see Scenario A reality check above).

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
