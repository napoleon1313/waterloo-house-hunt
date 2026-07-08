function money(n) { return "$" + n.toLocaleString("en-CA"); }

function totalOf(l) {
  if (l.totalRent) return l.totalRent;
  if (l.perRoomRent && l.beds) return l.perRoomRent * l.beds;
  return null;
}

function card(l, occ) {
  const total = totalOf(l);
  const estTag = (!l.totalRent && total) ? " (est. from per-room rate)" : "";
  const pp = total && occ ? Math.round(total / occ) : null;
  const leaseBadge = l.wholeLease
    ? '<span class="badge b-whole">One lease, whole property</span>'
    : '<span class="badge b-room">Per-room leases</span>';
  const askBadge = l.askAboutShortTerm
    ? '<span class="badge b-ask">Worth asking about 4-month term</span>'
    : '';
  const priceHtml = total
    ? '<span class="big">' + money(total) + '/mo' + estTag + '</span>' +
      (pp ? '<span class="pp"><b>' + money(pp) + '</b> per person at ' + occ + '</span>' : '')
    : '<span class="big">Contact for price</span>';
  const flags = (l.flags || []).map(f => '<div class="flag">Flag: ' + f + '</div>').join("");
  return '<div class="card">' +
    '<div class="top"><span class="rank">#' + l.rank + '</span>' +
    '<h3><a href="' + l.url + '" target="_blank" rel="noopener">' + l.address + '</a></h3>' +
    '<span class="hood">' + l.neighbourhood + '</span></div>' +
    '<div class="badges">' +
      '<span class="badge b-scenario">Scenario ' + l.scenario + '</span>' +
      leaseBadge +
      askBadge +
      '<span class="badge b-type">' + l.type + '</span>' +
      '<span class="badge b-type">' + l.beds + ' bed / ' + l.baths + ' bath</span>' +
      (l.furnished === true ? '<span class="badge b-type">Furnished</span>' : '') +
    '</div>' +
    '<div class="price-row">' + priceHtml + '</div>' +
    '<div class="grid">' +
      '<div><span class="k">Drive to UW:</span> ' + l.commuteDrive + '</div>' +
      '<div><span class="k">Transit:</span> ' + l.commuteTransit + '</div>' +
      '<div><span class="k">Lease:</span> ' + l.leaseTerm + '</div>' +
      '<div><span class="k">Parking:</span> ' + l.parking + '</div>' +
      '<div><span class="k">Utilities:</span> ' + l.utilities + '</div>' +
      '<div><span class="k">Listed:</span> ' + l.listed + ' via ' + l.source + '</div>' +
      (total ? '<div><span class="k">Per bedroom:</span> ' + money(Math.round(total / l.beds)) + '</div>' : '') +
    '</div>' +
    '<div class="proscons"><div class="p">' + l.pros + '</div><div class="c">' + l.cons + '</div></div>' +
    flags +
  '</div>';
}

function cardList(listings, occ) {
  return listings.map(l => card(l, occ)).join("") ||
    '<p style="color:var(--muted)">Nothing here.</p>';
}
