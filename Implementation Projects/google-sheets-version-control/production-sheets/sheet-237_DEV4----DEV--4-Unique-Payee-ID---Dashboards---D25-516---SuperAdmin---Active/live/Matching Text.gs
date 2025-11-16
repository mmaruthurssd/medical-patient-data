


// function testFunc() {
//   const id = "Principal Life Ins Co"
//   const company = "Principal Life Insurance Company";
//   let result = MATCH_COMPANY_ID(id, company, threshold = 0.7)
// }


// /***** Utilities *****/
// const normalizeText_ = (s = "") =>
//   s
//     .toString()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")     // remove diacritics
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, " ")        // remove punctuation
//     .replace(/\s+/g, " ")                // collapse spaces
//     .trim();

// const ngrams_ = (s, n = 3) => {
//   if (!s) return [];
//   const clean = s.replace(/\s+/g, "");   // grams over contiguous chars
//   if (clean.length <= n) return [clean];
//   const grams = [];
//   for (let i = 0; i <= clean.length - n; i++) grams.push(clean.slice(i, i + n));
//   return grams;
// };

// /**
//  * Computes two fuzzy scores between company and id:
//  * - recall:   (#grams in common) / (#grams in company)   → “% of company captured by ID”
//  * - jaccard:  intersection / union of grams              → symmetric similarity
//  */
// const fuzzyCompanyIdScore_ = (idRaw, companyRaw, n = 3) => {
//   const id = normalizeText_(idRaw);
//   const company = normalizeText_(companyRaw);

//   // Quick substring boost: if the whole normalized company appears in id
//   const directHit = company && id.includes(company) ? 1 : 0;

//   const gCompany = ngrams_(company, n);
//   const gId = ngrams_(id, n);

//   const setCompany = new Set(gCompany);
//   const setId = new Set(gId);

//   let inter = 0;
//   for (const g of setCompany) if (setId.has(g)) inter++;

//   const recall = setCompany.size ? inter / setCompany.size : 0; // “% of company covered”
//   const union = new Set([...setCompany, ...setId]).size || 1;
//   const jaccard = union ? inter / union : 0;

//   // If we had a full normalized substring match, push recall to 1
//   const recallAdj = directHit ? 1 : recall;

//   return { recall: recallAdj, jaccard };
// };

// /***** Custom functions *****/

// /**
//  * =MATCH_COMPANY_ID(id_cell, company_cell, [threshold])
//  * Returns TRUE if at least `threshold` (default 0.8) of the company name is present in the ID.
//  */
// function MATCH_COMPANY_ID(id, company, threshold = 0.7) {
//   const { recall } = fuzzyCompanyIdScore_(id, company, 3);
//   Logger.log(recall)
//   return recall >= Number(threshold);
// }

// /**
//  * =COMPANY_MATCH_SCORE(id_cell, company_cell)
//  * Returns a 2-cell row: {Recall, Jaccard} as percentages (0–100).
//  * Example: =COMPANY_MATCH_SCORE(A2, B2)
//  */
// function COMPANY_MATCH_SCORE(id, company) {
//   const { recall, jaccard } = fuzzyCompanyIdScore_(id, company, 3);
//   return [[Math.round(recall * 100), Math.round(jaccard * 100)]];
// }

// /***** Sheet runner (optional) *****/
// /**
//  * Reads:
//  *  A: ID
//  *  B: Company
//  * Writes:
//  *  C: Match (TRUE/FALSE at 80%)
//  *  D: Recall % (coverage of company in ID)
//  *  E: Jaccard % (overall similarity)
//  */
// function processActiveSheet_() {
//   const sh = SpreadsheetApp.getActiveSheet();
//   const lastRow = sh.getLastRow();
//   if (lastRow < 2) return;

//   const values = sh.getRange(2, 1, lastRow - 1, 2).getValues(); // A,B
//   const out = values.map(([id, company]) => {
//     const { recall, jaccard } = fuzzyCompanyIdScore_(id, company, 3);
//     const match = recall >= 0.8;
//     return [match, Math.round(recall * 100), Math.round(jaccard * 100)];
//   });
//   sh.getRange(2, 3, out.length, 3).setValues(out); // C,D,E
// }


