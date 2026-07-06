# Waterloo Group House Search Spec (Fall 2026)

This is the canonical search spec. The daily update task re-runs this search and refreshes `listings.json`. Do not edit `index.html` for data changes; it renders whatever is in `listings.json`.

## Objective
Rental search for a group of 5 to 6 University of Waterloo co-op students leasing a property together in Waterloo, Ontario. Search broadly across the rental ecosystem, verify listing quality and legitimacy, rank results.

## Lease scenarios (tag every result A, B, or Both)
- Scenario A: 4-month lease, September to December 2026, for 5 to 6 people.
- Scenario B: 12-month lease (September 2026 to August 2027), for 4 to 6 people.

## Non-negotiable requirements
- Commute to UW main campus: 20 minutes or less. Report both driving (weekday ~8:30 a.m.) and GRT/ION transit where available. Mark estimates as (est.).
- House strongly preferred; townhouse or apartment as fallback if it scores well.
- One lease for the whole property preferred. Flag individual-lease-only listings as fallback tier, never top picks.
- 5 to 6 bedrooms, or 4 bedrooms plus den/flex. At least 2 bathrooms.
- Total rent $3,500 to $6,500 CAD; ideal $4,000 to $5,000. Report total and per-person at 5 and 6 occupants.

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
2. Price fit to $4,000 to $5,000 band
3. House over apartment
4. Bed/bath fit for 5 to 6
5. Single whole-group lease over per-room
6. Quality signals, no red flags

## Data fields per listing (keep schema identical to existing entries)
rank, tier (top/honourable/fallback), address, neighbourhood, totalRent, perRoomRent, beds, baths, type, leaseTerm, scenario, wholeLease, commuteDrive, commuteTransit, parking, utilities, furnished, source, url, listed, pros, cons, flags (array), askAboutShortTerm (boolean, see Scenario A reality check above).

## Daily update procedure
1. Re-check every listing currently in `listings.json`: still live? price changed? If gone, remove it and note in UPDATE_LOG.md. Never remove a listing just to make room for a new one; only remove confirmed-dead ones.
2. Sweep the sources above for new qualifying listings, including Scenario A sublet searches; verify detail pages before adding. Don't force the total count; only add genuinely verified listings.
3. Recompute ranks and tiers after changes. Update `lastUpdated` (YYYY-MM-DD), `actFast`, `scenarioANote`, `askAboutShortTerm` flags, and `sourceCoverage`.
4. Keep JSON structure identical to the existing file. Validate JSON before committing (ranks contiguous 1..N, tiers and askAboutShortTerm counts sane).
5. Append a dated 2-4 line entry to UPDATE_LOG.md (added/removed/price changes/nothing new).
6. Commit and push to main; GitHub Pages serves the update automatically.

## Style
Canadian English, no em dashes, no emojis. Newsletter tone, concise.
