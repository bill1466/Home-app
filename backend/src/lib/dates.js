function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const da = new Date(a + 'T00:00:00Z');
  const db_ = new Date(b + 'T00:00:00Z');
  return Math.round((db_ - da) / msPerDay);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

module.exports = { todayStr, daysBetween, addDays };
