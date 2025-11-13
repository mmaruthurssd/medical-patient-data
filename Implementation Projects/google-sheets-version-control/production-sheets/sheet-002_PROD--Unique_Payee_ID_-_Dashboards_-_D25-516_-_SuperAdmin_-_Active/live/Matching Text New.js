/***** Improved Fuzzy Match with word-level check *****/



function testFuncNew() {
  const id = "Principal Life Ins Com"
  const company = "Principal Life Insurance test Company";
  let result = MATCH_COMPANY_ID_SMART(id, company, threshold = 0.8)
}

/********** Normalization **********/
const normalizeText_ = (s = "") =>
  s.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/********** Dictionaries **********/
const ABBREV_MAP_ = {
  co: ["company", "corporation"],
  corp: ["corporation"],
  inc: ["incorporated", "inc"],
  ltd: ["limited"],
  llc: ["llc"],
  plc: ["plc"],
  intl: ["international"],
  "int'l": ["international"],
  ins: ["insurance"],
  svc: ["services", "service"],
  svcs: ["services"],
  tech: ["technology", "technologies"],
  mfg: ["manufacturing", "manufacturer"],
  grp: ["group"],
  dept: ["department"],
  univ: ["university"],
  assoc: ["association"],
  bank: ["bank", "banking"]
};

// “Corporate fluff” tokens get lower weight in recall
const LOW_WEIGHT_TOKENS_ = new Set([
  "co","company","corporation","corp","inc","incorporated","ltd",
  "limited","llc","plc","group","grp","holdings","holding",
  "services","service","svc","svcs","the"
]);

/********** Similarity helpers **********/
function levenshtein_(a, b) {
  const la = a.length, lb = b.length;
  if (!la) return lb; if (!lb) return la;
  const dp = Array(lb + 1).fill(0).map((_, i) => [i]);
  for (let j = 0; j <= la; j++) dp[0][j] = j;
  for (let i = 1; i <= lb; i++) {
    for (let j = 1; j <= la; j++) {
      dp[i][j] = a[j - 1] === b[i - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
    }
  }
  return dp[lb][la];
}
const ratio_ = (a, b) => {
  if (!a || !b) return 0;
  const dist = levenshtein_(a, b);
  return 1 - dist / Math.max(a.length, b.length);
};

function abbrevHit_(a, b) {
  // true if a is an abbreviation of b or vice versa using ABBREV_MAP_
  const A = ABBREV_MAP_[a]; if (A && A.includes(b)) return true;
  const B = ABBREV_MAP_[b]; if (B && B.includes(a)) return true;
  return false;
}

function tokenSim_(a, b) {
  if (a === b) return 1;
  if (abbrevHit_(a, b)) return 1;

  // prefix allowance (e.g., "ins" ↔ "insurance", "co" ↔ "company")
  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  let prefixSim = 0;
  if (longer.startsWith(shorter) && shorter.length >= 2) {
    prefixSim = shorter.length / longer.length; // e.g., 3/9 = 0.33
  }

  // base string similarity
  const lev = ratio_(a, b);

  return Math.max(lev, prefixSim);
}

/********** SMART scoring **********/
function smartCompanyIdScore_(idRaw, companyRaw) {
  const id = normalizeText_(idRaw);
  const company = normalizeText_(companyRaw);
  if (!id || !company) return { recall: 0, details: [] };

  const idTokens = id.split(" ").filter(Boolean);
  const compTokens = company.split(" ").filter(Boolean);

  // Greedy one-to-one matching: each ID token used at most once
  const used = new Array(idTokens.length).fill(false);

  let matchedWeight = 0;
  let totalWeight = 0;
  const details = [];

  for (const ct of compTokens) {
    const weight = LOW_WEIGHT_TOKENS_.has(ct) ? 0.25 : 1; // corporate words matter less
    totalWeight += weight;

    let bestIdx = -1;
    let bestSim = 0;
    for (let i = 0; i < idTokens.length; i++) {
      if (used[i]) continue;
      const sim = tokenSim_(ct, idTokens[i]);
      if (sim > bestSim) { bestSim = sim; bestIdx = i; }
    }

    // acceptance thresholds: core words need ~0.60, corporate words ~0.40
    const thr = LOW_WEIGHT_TOKENS_.has(ct) ? 0.4 : 0.6;
    if (bestIdx !== -1 && bestSim >= thr) {
      used[bestIdx] = true;
      matchedWeight += weight;
      details.push({ companyToken: ct, idToken: idTokens[bestIdx], sim: +bestSim.toFixed(2) });
    } else {
      details.push({ companyToken: ct, idToken: null, sim: +bestSim.toFixed(2) });
    }
  }

  const recall = totalWeight ? matchedWeight / totalWeight : 0;
  return { recall, details };
}

/********** Sheet-facing custom function **********/
function MATCH_COMPANY_ID_SMART(id, company, threshold = 0.8) {
  const { recall } = smartCompanyIdScore_(id, company);

  Logger.log(recall)
  return recall >= Number(threshold);
}

/********** Optional: debugging helper **********/
function COMPANY_MATCH_DEBUG(id, company) {
  const { recall, details } = smartCompanyIdScore_(id, company);
  return [[Math.round(recall * 100), JSON.stringify(details)]];
}
