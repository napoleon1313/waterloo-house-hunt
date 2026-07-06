# Waterloo House Hunt, Fall 2026

Shared listing tracker for a 5-6 person UW co-op group house search.

- **Live site:** https://napoleon1313.github.io/waterloo-house-hunt/
- **Data:** [listings.json](listings.json) is the single source of truth; [index.html](index.html) renders it.
- **Spec:** [SEARCH_SPEC.md](SEARCH_SPEC.md) defines requirements, sources, ranking, and the daily update procedure.
- **History:** [UPDATE_LOG.md](UPDATE_LOG.md) has one dated entry per refresh.

The site refreshes once a day via a scheduled Claude task that re-runs the search, updates `listings.json`, and pushes here.
