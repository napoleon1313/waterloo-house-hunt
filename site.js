function money(n) { return "$" + n.toLocaleString("en-CA"); }

function totalOf(l) {
  if (l.totalRent) return l.totalRent;
  if (l.perRoomRent && l.beds) return l.perRoomRent * l.beds;
  return null;
}

function card(l, occExtra) {
  const total = totalOf(l);
  const estTag = (!l.totalRent && total) ? " (est. from per-room rate)" : "";
  // Per-person price always auto-derives from this listing's own bedroom count, never a
  // manually picked global number. occExtra (0 or 1) models "double up one room" and applies
  // on top of the listing's real beds, so it stays correct no matter which bedroom filter is active.
  const occ = l.beds + (occExtra || 0);
  const pp = total ? Math.round(total / occ) : null;
  const leaseBadge = l.wholeLease
    ? '<span class="badge b-whole">One lease, whole property</span>'
    : '<span class="badge b-room">Per-room leases</span>';
  const askBadge = l.askAboutShortTerm
    ? '<span class="badge b-ask">Worth asking about 4-month term</span>'
    : '';
  const occNote = occExtra ? ' (' + l.beds + ' bed + 1 doubled up)' : '';
  const priceHtml = total
    ? '<span class="big">' + money(total) + '/mo' + estTag + '</span>' +
      (pp ? '<span class="pp"><b>' + money(pp) + '</b> per person of ' + occ + occNote + '</span>' : '')
    : '<span class="big">Contact for price</span>';
  const flags = (l.flags || []).map(f => '<div class="flag">Flag: ' + f + '</div>').join("");
  let photosHtml = "";
  if (Array.isArray(l.photos)) {
    if (l.photos.length) {
      const tiles = l.photos.slice(0, 4).map(p =>
        '<a href="' + l.url + '" target="_blank" rel="noopener">' +
        '<img src="' + p + '" alt="Photo of ' + l.address + '" loading="lazy" ' +
        'onerror="this.parentNode.classList.add(\'photo-empty\');this.parentNode.textContent=\'NO SIGNAL\';">' +
        '</a>').join("");
      const pads = Math.max(0, 4 - l.photos.length);
      const padTiles = '<span class="photo-empty">NO PHOTO</span>'.repeat(pads);
      photosHtml = '<div class="photos">' + tiles + padTiles + '</div>';
    } else {
      photosHtml = '<div class="photos">' + '<span class="photo-empty">NO PHOTO</span>'.repeat(4) + '</div>';
    }
  }
  return '<div class="card">' +
    '<div class="titlebar"><span class="closebox"></span>' +
      '<span class="tb-label"><a href="' + l.url + '" target="_blank" rel="noopener">' + l.address + '</a></span>' +
    '</div>' +
    photosHtml +
    '<div class="card-body">' +
    '<div class="top"><span class="rank">#' + l.rank + '</span>' +
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
    '</div>' +
  '</div>';
}

function cardList(listings, occ) {
  return listings.map(l => card(l, occ)).join("") ||
    '<p style="color:var(--muted)">Nothing here.</p>';
}

function menubarClock() {
  const el = document.getElementById("menuclock");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = d.toLocaleDateString("en-CA") + " " +
      d.toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" });
  };
  tick();
  setInterval(tick, 30000);
}
