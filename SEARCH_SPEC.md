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
- KeyHomes (keyhomes.ca, MLS aggregator; best fetchable source, 5-bedroom Waterloo rental page + property detail pages)
- Kijiji: student housing category (kijiji.ca/b-ontario/student-housing-waterloo/k0l9004) and main KW rentals with 5+ BR filter
- Zumper houses page (zumper.com/houses-for-rent/waterloo-on)
- UWrent (uwrent.com), RentWoch (rentwoch.com), KW4Rent, other local PMs found via search
- Liv.rent, PadMapper, Craigslist KW
- Web searches for: "house for rent Waterloo 5/6 bedroom September 2026", reddit r/uwaterloo housing threads, new local property managers
- Known blocked to automation (403/401, note but skip): Rentals.ca, Point2Homes, Apartments.com, RentBoard, Zolo, SquareYards, Mitula, Realtor.ca, Places4Students. Facebook requires login; remind readers to check manually.

## Scam and quality screen
Exclude: wire-transfer or deposit-before-viewing requests, no verifiable address, stock-photo-only listings, landlords with multiple recent public complaints, stale listings without recent confirmation.

## Ranking weights (heaviest first)
1. Commute (under 10 min best, 10 to 20 qualifies)
2. Price fit to $4,000 to $5,000 band
3. House over apartment
4. Bed/bath fit for 5 to 6
5. Single whole-group lease over per-room
6. Quality signals, no red flags

## Daily update procedure
1. Re-check every listing currently in `listings.json`: still live? price changed? If gone, remove it and note in UPDATE_LOG.md.
2. Sweep the sources above for new qualifying listings; verify detail pages before adding.
3. Recompute ranks after changes. Update `lastUpdated` (YYYY-MM-DD), `actFast`, `scenarioANote`, and `sourceCoverage`.
4. Keep JSON structure identical to the existing file. Validate JSON before committing.
5. Append a dated 2-4 line entry to UPDATE_LOG.md (added/removed/price changes/nothing new).
6. Commit and push to main; GitHub Pages serves the update automatically.

## Style
Canadian English, no em dashes, no emojis. Newsletter tone, concise.
