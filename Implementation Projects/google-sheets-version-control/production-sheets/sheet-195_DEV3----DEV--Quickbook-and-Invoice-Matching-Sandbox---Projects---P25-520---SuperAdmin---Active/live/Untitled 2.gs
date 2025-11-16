




/***** CONFIG *****/
const CFG = {
  SHEET_A: 'Destination',
  SHEET_B: 'Source',
  REVIEW_SHEET: 'Review',
  MATCH_SHEET: 'Matches',
  BLOCK_COL_A: 'BLOCK_KEY',  // ensure this exists on both sheets
  BLOCK_COL_B: 'BLOCK_KEY',
  SCORE_MIN_AUTO: 0.85,
  SCORE_MAX_REJECT: 0.35,
  MAX_MINUTES: 55           // stop before 60 to be safe
};

/***** ENTRYPOINT *****/
function reconcileRun() {
  const t0 = Date.now();
  const props = PropertiesService.getScriptProperties();
  const state = JSON.parse(props.getProperty('recon_state') || '{"blockIdx":0}');
  const { blocksA, blocksB, order } = buildBlocks_(); // map blockKey -> rows

  for (let i = state.blockIdx; i < order.length; i++) {
    const blockKey = order[i];
    const A = blocksA.get(blockKey) || [];
    const B = blocksB.get(blockKey) || [];
    if (A.length && B.length) processBlock_(blockKey, A, B);
    // checkpoint
    if ((Date.now() - t0) / 60000 > CFG.MAX_MINUTES) {
      props.setProperty('recon_state', JSON.stringify({ blockIdx: i + 1 }));
      scheduleNextRun_();
      return;
    }
  }
  props.deleteProperty('recon_state'); // done
}

/***** BLOCKING *****/
function buildBlocks_() {
  const shA = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_A);
  const shB = SpreadsheetApp.getActive().getSheetByName(CFG.SHEET_B);
  const dataA = getDataWithHeaders_(shA);
  const dataB = getDataWithHeaders_(shB);
  const blocksA = groupBy_(dataA.rows, r => r[CFG.BLOCK_COL_A] || '');
  const blocksB = groupBy_(dataB.rows, r => r[CFG.BLOCK_COL_B] || '');
  const order = [...new Set([...blocksA.keys(), ...blocksB.keys()])].sort();
  return { blocksA, blocksB, order };
}

/***** PER-BLOCK PIPELINE *****/
function processBlock_(blockKey, rowsA, rowsB) {
  // 1) Generate candidates (all pairs inside block)
  const cand = [];
  for (let i = 0; i < rowsA.length; i++) {
    for (let j = 0; j < rowsB.length; j++) {
      const feat = makeFeatures_(rowsA[i], rowsB[j]);    // nameSim, amountDelta, dateGapDays, etc.
      const score = scorePair_(feat);                    // weighted sum or logistic
      if (score >= CFG.SCORE_MAX_REJECT) cand.push({ i, j, score, feat });
    }
  }
  if (!cand.length) return;

  // 2) High-confidence autolinks
  const lockedA = new Set(), lockedB = new Set();
  const matches = [];
  cand.sort((a,b)=>b.score-a.score).forEach(c => {
    if (c.score >= CFG.SCORE_MIN_AUTO && !lockedA.has(c.i) && !lockedB.has(c.j)) {
      matches.push(c);
      lockedA.add(c.i); lockedB.add(c.j);
    }
  });

  // 3) Optional Hungarian on remaining candidates for best 1:1 inside block
  const remA = rowsA.map((_, idx)=>idx).filter(i=>!lockedA.has(i));
  const remB = rowsB.map((_, idx)=>idx).filter(j=>!lockedB.has(j));
  if (remA.length && remB.length) {
    const cost = buildCostMatrix_(remA, remB, cand); // cost = 1 - score (or large for disallowed)
    // Hungarian is optional; uncomment if you need strict 1:1:
    // const assign = hungarian_(cost); // returns array of [aiIndex, bjIndex]
    // assign.forEach(([ai, bj]) => {
    //   const i = remA[ai], j = remB[bj];
    //   const c = findCand_(cand, i, j);
    //   if (c && c.score > CFG.SCORE_MAX_REJECT) matches.push(c);
    // });
  }

  // 4) Write results & push uncertain to Review
  writeMatchesAndReviews_(blockKey, matches, rowsA, rowsB, cand);
}

/***** FEATURES & SCORING (simple, fast) *****/
function makeFeatures_(a, b) {
  return {
    nameSim: jaroWinkler_(norm_(a.Name), norm_(b.Name)),
    amountDelta: Math.abs(Number(a.Amount || 0) - Number(b.Amount || 0)),
    dateGapDays: Math.abs(daysBetween_(a.Date, b.Date)),
    memoJaccard: jaccardTokens_(a.Memo || '', b.Memo || '')
  };
}

// weighted sum (tune weights or swap for logistic with stored coefficients)
function scorePair_(f) {
  const w = { nameSim: 0.55, amountDelta: -0.25, dateGapDays: -0.15, memoJaccard: 0.25 };
  // simple transforms
  const amt = f.amountDelta === 0 ? 1 : f.amountDelta <= 1 ? 0.9 : f.amountDelta <= 5 ? 0.7 : 0.3;
  const date = f.dateGapDays === 0 ? 1 : f.dateGapDays <= 1 ? 0.9 : f.dateGapDays <= 3 ? 0.7 : 0.4;
  const raw = w.nameSim * f.nameSim + w.amountDelta * (1 - amt) + w.dateGapDays * (1 - date) + w.memoJaccard * f.memoJaccard;
  return Math.max(0, Math.min(1, raw));
}

/***** WRITE RESULTS *****/
function writeMatchesAndReviews_(blockKey, matches, rowsA, rowsB, cand) {
  const ss = SpreadsheetApp.getActive();
  const shM = ss.getSheetByName(CFG.MATCH_SHEET) || ss.insertSheet(CFG.MATCH_SHEET);
  const shR = ss.getSheetByName(CFG.REVIEW_SHEET) || ss.insertSheet(CFG.REVIEW_SHEET);

  // Matches
  const outM = matches.map(m => [
    blockKey, rowsA[m.i].Id, rowsB[m.j].Id, m.score,
    rowsA[m.i].Amount, rowsB[m.j].Amount, rowsA[m.i].Date, rowsB[m.j].Date
  ]);
  if (outM.length) shM.getRange(shM.getLastRow()+1,1,outM.length,outM[0].length).setValues(outM);

  // Review = top remaining non-auto pairs (by block)
  const inMatch = new Set(matches.map(m => m.i + '|' + m.j));
  const review = cand.filter(c => c.score < CFG.SCORE_MIN_AUTO && c.score >= CFG.SCORE_MAX_REJECT && !inMatch.has(c.i+'|'+c.j))
                     .sort((a,b)=>b.score-a.score).slice(0, 200);
  const outR = review.map(r => [
    blockKey, rowsA[r.i].Id, rowsB[r.j].Id, r.score,
    JSON.stringify(r.feat)
  ]);
  if (outR.length) shR.getRange(shR.getLastRow()+1,1,outR.length,outR[0].length).setValues(outR);
}

/***** UTILITIES (data, timers, simple sims) *****/
function getDataWithHeaders_(sh) {
  const v = sh.getDataRange().getValues();
  const head = v[0]; const out = [];
  for (let r = 1; r < v.length; r++) {
    const o = {};
    for (let c = 0; c < head.length; c++) o[head[c]] = v[r][c];
    out.push(o);
  }
  return { headers: head, rows: out };
}
function groupBy_(arr, fn) {
  const m = new Map();
  arr.forEach(x => { const k = fn(x); if(!m.has(k)) m.set(k, []); m.get(k).push(x); });
  return m;
}
function scheduleNextRun_() {
  ScriptApp.newTrigger('reconcileRun').timeBased().after(1 * 60 * 1000).create();
}
function daysBetween_(d1, d2) {
  const a = new Date(d1), b = new Date(d2);
  return Math.round(Math.abs((a - b) / 86400000));
}
function norm_(s){ return String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim(); }
function jaccardTokens_(a,b){
  const A = new Set(norm_(a).split(/\s+/).filter(Boolean));
  const B = new Set(norm_(b).split(/\s+/).filter(Boolean));
  const inter = [...A].filter(x=>B.has(x)).length;
  const uni = new Set([...A, ...B]).size || 1;
  return inter/uni;
}
// Lightweight Jaro-Winkler (good enough for names)
function jaroWinkler_(s1, s2) {
  if (!s1 || !s2) return 0;
  const m = Math.floor(Math.max(s1.length, s2.length)/2)-1;
  let matches1 = new Array(s1.length).fill(false);
  let matches2 = new Array(s2.length).fill(false);
  let matches = 0, transpositions = 0;
  for (let i=0;i<s1.length;i++){
    const start = Math.max(0, i - m), end = Math.min(i + m + 1, s2.length);
    for (let j=start;j<end;j++) if (!matches2[j] && s1[i]===s2[j]) { matches1[i]=matches2[j]=true; matches++; break; }
  }
  if (!matches) return 0;
  let k=0;
  for (let i=0;i<s1.length;i++) if(matches1[i]) {
    while(!matches2[k]) k++;
    if (s1[i]!==s2[k]) transpositions++;
    k++;
  }
  const jaro = (matches/s1.length + matches/s2.length + (matches - transpositions/2)/matches)/3;
  const prefix = Math.min(4, [...s1].findIndex((ch,idx)=>s2[idx]!==ch) === -1 ? Math.min(4, Math.min(s1.length, s2.length)) : [...s1].findIndex((ch,idx)=>s2[idx]!==ch));
  return jaro + 0.1 * prefix * (1 - jaro);
}
function buildCostMatrix_(remA, remB, cand){
  const map = new Map();
  cand.forEach(c=>map.set(c.i+'|'+c.j, 1 - c.score));
  const C = Array.from({length: remA.length}, ()=>Array(remB.length).fill(1e6));
  for (let ai=0; ai<remA.length; ai++){
    for (let bj=0; bj<remB.length; bj++){
      const key = remA[ai]+'|'+remB[bj];
      if (map.has(key)) C[ai][bj] = map.get(key);
    }
  }
  return C;
}
function findCand_(cand,i,j){ return cand.find(c=>c.i===i && c.j===j); }

/* Optional Hungarian implementation can be added if you need strict 1:1 inside each block. */








