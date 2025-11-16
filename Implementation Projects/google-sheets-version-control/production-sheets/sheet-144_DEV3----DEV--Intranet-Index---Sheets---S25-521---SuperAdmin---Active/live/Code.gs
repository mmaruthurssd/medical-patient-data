/******************************************************
* SECTION 0 — CORE RULES (v1.0.0) — Start Line 1
* Purpose (Layman):
*   Immutable development guardrails for Google Sheets
*   Directory project. Ensures safe, performant code
*   for 50+ internal users with GAS-first architecture.
*
* !! NON-NEGOTIABLE !!
* - SECTION 0 is IMMUTABLE unless user explicitly requests edits
* - SECTION 0 must ALWAYS be output in FULL
* - Never truncate, summarize, skip, or collapse SECTION 0
* - If token/space pressure occurs → NO-OP and LOG violation
******************************************************/

const PROJECT_CONFIG = {
  directory: {
    spreadsheetId: '1FiY_BJMVV1vuG1ZVNrGwNjrNZ1VEzsDnFUlRmwaNYIE',
    sheetName: 'New Index',
    cacheTtlSec: 300, // 5 minutes for 50 users
    maxConcurrentUsers: 50
  },
  requiredTabs: [
    { name: "New Index", columns: ["Name", "URL", "Description", "Tags (comma-separated)", "Category", "Access"] },
    { name: "AI_LOG", columns: ["Time", "Actor", "Action", "Outcome", "ExecutionTime"] },
    { name: "CONFIG", columns: ["Key", "Value"] }
  ],
  performance: {
    maxExecutionTimeSec: 25, // GAS limit buffer
    batchSize: 100,
    cacheStrategy: "aggressive"
  },
  flags: {
    dryRunDefault: false, // Internal tool - less cautious
    defaultFeatureState: "on",
    environment: "PROD"
  }
};

/*
=========================================================
  CORE 8 — Internal Tool Rules (GAS-Optimized)
=========================================================

1) Complete Features Only
   - Deliver ONE complete section per session
   - Integer section IDs only (1,2,3... not 2a)
   - Update existing sections in-place

2) GAS-First Architecture  
   - Complex logic stays server-side
   - Minimal client-side JavaScript
   - Leverage Apps Script strengths

3) Performance by Design
   - All operations consider 50-user load
   - Mandatory caching for data operations
   - Quota-aware execution monitoring

4) Internal Tool Quality
   - Function over form
   - Self-documenting for GAS team
   - Graceful degradation on limits

5) Safe Iteration
   - Dry-run protection for destructive ops
   - Comprehensive error logging
   - Rollback-ready implementations

6) Access Control Enforcement
   - Email-based security at data layer
   - No client-side security assumptions
   - Viewer identity validation required

7) Workspace Constraint Respect
   - Monitor execution time and quotas
   - Batch operations for efficiency
   - Cache-first data strategies

8) Maintainable Code Structure
   - Layman-first documentation
   - Clear input/output specifications
   - Feature-grouped functionality

---------------------------------------------------------
QUICK REF: GAS-First | 50-User Optimized | Internal Tool |
Complete Features | Performance Aware | Access Secured
---------------------------------------------------------
*/

/******************************************************
* SECTION 1 — INFRASTRUCTURE SETUP (v1.0.0) — Start Line 85
* Purpose (Layman):
*   Automatically creates required tabs and columns in the
*   Google Sheet to minimize manual setup. Runs on first
*   access and validates structure on every request.
*
* GAS Optimization Notes:
*   - One-time setup operations with safety checks
*   - Idempotent operations (safe to run multiple times)
*   - Preserves existing data while adding missing structure
*
* Inputs: Spreadsheet configuration
* Outputs: Properly structured Google Sheet
******************************************************/

/**
 * ensureRequiredTabs - Create missing tabs with proper headers
 * @returns {Object} {success: boolean, actions: string[], errors: string[]}
 */
function ensureRequiredTabs() {
  const results = { success: true, actions: [], errors: [] };

  try {
    const ss = SpreadsheetApp.openById(PROJECT_CONFIG.directory.spreadsheetId);

    PROJECT_CONFIG.requiredTabs.forEach(tabDef => {
      try {
        let sheet = ss.getSheetByName(tabDef.name);

        if (!sheet) {
          // Create missing tab
          sheet = ss.insertSheet(tabDef.name);
          results.actions.push(`Created tab: ${tabDef.name}`);
        }

        // Ensure proper headers
        const currentHeaders = sheet.getLastColumn() > 0 ?
          sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];

        const missingColumns = tabDef.columns.filter(col => !currentHeaders.includes(col));

        if (missingColumns.length > 0) {
          const startCol = currentHeaders.length + 1;
          const headerRange = sheet.getRange(1, startCol, 1, missingColumns.length);
          headerRange.setValues([missingColumns]);

          // Format headers
          headerRange.setFontWeight('bold');
          headerRange.setBackground('#f0f0f0');

          results.actions.push(`Added columns to ${tabDef.name}: ${missingColumns.join(', ')}`);
        }

        // Special setup for specific tabs
        if (tabDef.name === 'CONFIG' && sheet.getLastRow() <= 1) {
          // Add default configuration values
          const defaultConfig = [
            ['feature_advanced_search', 'off'],
            ['feature_analytics', 'off'],
            ['maintenance_mode', 'off'],
            ['cache_ttl_override', '300']
          ];

          sheet.getRange(2, 1, defaultConfig.length, 2).setValues(defaultConfig);
          results.actions.push('Added default CONFIG values');
        }

        if (tabDef.name === 'Index') {
          // Ensure Access column exists (new requirement)
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          if (!headers.includes('Access')) {
            const accessColIndex = headers.length + 1;
            sheet.getRange(1, accessColIndex).setValue('Access');
            sheet.getRange(1, accessColIndex).setFontWeight('bold').setBackground('#f0f0f0');
            results.actions.push('Added Access column to Index tab');
          }
        }

      } catch (tabError) {
        results.errors.push(`Tab ${tabDef.name}: ${tabError.toString()}`);
        results.success = false;
      }
    });

  } catch (err) {
    results.errors.push(`Infrastructure setup failed: ${err.toString()}`);
    results.success = false;
  }

  return results;
}

/**
 * validateAndFixSheetStructure - Comprehensive sheet validation and repair
 * @returns {Object} Validation results with auto-fixes applied
 */
function validateAndFixSheetStructure() {
  return withExecutionMonitoring(() => {
    const results = ensureRequiredTabs();

    // Log all actions taken
    if (results.actions.length > 0) {
      aiLog({
        action: "validateAndFixSheetStructure",
        outcome: `Auto-fixes applied: ${results.actions.join('; ')}`
      });
    }

    if (results.errors.length > 0) {
      aiLog({
        action: "validateAndFixSheetStructure",
        outcome: `Errors encountered: ${results.errors.join('; ')}`
      });
    }

    return results;
  }, "validateAndFixSheetStructure");
}

/******************************************************
* SECTION 2 — UTILITIES & HELPERS (v1.0.0) — Start Line 185
* Purpose (Layman):
*   Shared helper functions that enforce core rules
*   and provide safe, monitored operations for the
*   directory. Optimized for GAS environment.
*
* GAS Optimization Notes:
*   - Execution time monitoring for quota management
*   - Efficient caching with TTL management
*   - Batch operations for multiple data requests
*
* Inputs: Various operation parameters
* Outputs: Safe, logged, cached operations
******************************************************/

/** BRANDING (logo+title) — set your Drive file ID here (PNG/SVG recommended). */
const BRANDING_CONFIG = {
  siteTitle: 'SSD Intranet',
  logoDriveFileId: '1xiOIXwdNevTjpUI02UQlfq6rve4bdE9Q' // <-- paste the Drive file ID for your logo image; leave blank to show title only
};

/**
 * getBranding - Returns title and a data URL for the logo (if configured)
 * @returns {{title:string, logoDataUrl:string}}
 */
function getBranding() {
  return withExecutionMonitoring(() => {
    const out = { title: BRANDING_CONFIG.siteTitle || 'SSD Intranet', logoDataUrl: '' };
    try {
      const id = (BRANDING_CONFIG.logoDriveFileId || '').trim();
      if (id) {
        const file = DriveApp.getFileById(id);
        const blob = file.getBlob();
        const ct = blob.getContentType();
        const b64 = Utilities.base64Encode(blob.getBytes());
        out.logoDataUrl = `data:${ct};base64,${b64}`;
      }
    } catch (err) {
      aiLog({ action: "getBranding", outcome: `WARNING: logo load failed: ${err.toString()}` });
    }
    return out;
  }, "getBranding");
}

/**
 * aiLog - Standardized logging for directory operations
 * @param {Object} entry - {actor, action, outcome, executionTime}
 */
function aiLog({ actor = "SYSTEM", action = "", outcome = "", executionTime = 0 }) {
  try {
    const ss = SpreadsheetApp.openById(PROJECT_CONFIG.directory.spreadsheetId);
    const sh = ss.getSheetByName("AI_LOG");
    if (!sh) return;

    const row = [
      new Date(),
      actor,
      action,
      outcome,
      executionTime
    ];
    sh.appendRow(row);
  } catch (err) {
    console.error("aiLog failed:", err.toString());
  }
}

/**
 * withExecutionMonitoring - Wrap functions with performance tracking
 * @param {Function} fn - Function to execute
 * @param {string} purpose - Description for logging
 */
function withExecutionMonitoring(fn, purpose = "") {
  const startTime = Date.now();
  try {
    const result = fn();
    const executionTime = Date.now() - startTime;

    if (executionTime > PROJECT_CONFIG.performance.maxExecutionTimeSec * 1000) {
      aiLog({
        action: purpose,
        outcome: `WARNING: Slow execution ${executionTime}ms`,
        executionTime
      });
    }

    return result;
  } catch (err) {
    const executionTime = Date.now() - startTime;
    aiLog({
      action: purpose,
      outcome: `ERROR: ${err.toString()}`,
      executionTime
    });
    throw err;
  }
}

/**
 * getCacheKey - Generate consistent cache keys with length limits
 * @param {string} operation - Operation type
 * @param {string} identifier - Unique identifier
 */
function getCacheKey(operation, identifier = "") {
  // GAS cache key limit is 250 characters
  const baseKey = `dir_${operation}_v3`;
  const fullKey = identifier ? `${baseKey}_${identifier}` : baseKey;
  return fullKey.substring(0, 249); // Leave 1 char buffer
}

/**
 * rulesGate - Validate and auto-fix core infrastructure
 * @returns {Object} {ok: boolean, messages: string[], autoFixed: boolean}
 */
function rulesGate() {
  const messages = [];
  let autoFixed = false;

  try {
    // First, try to auto-fix any missing infrastructure
    const fixResults = validateAndFixSheetStructure();

    if (fixResults.actions.length > 0) {
      autoFixed = true;
      messages.push(`Auto-fixed: ${fixResults.actions.join(', ')}`);
    }

    if (fixResults.errors.length > 0) {
      messages.push(...fixResults.errors);
    }

    // Now validate everything is properly set up
    const ss = SpreadsheetApp.openById(PROJECT_CONFIG.directory.spreadsheetId);

    PROJECT_CONFIG.requiredTabs.forEach(def => {
      const sh = ss.getSheetByName(def.name);
      if (!sh) {
        messages.push(`Critical: Still missing sheet after auto-fix: ${def.name}`);
        return;
      }

      const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
      const missing = def.columns.filter(c => !headers.includes(c));
      if (missing.length) {
        messages.push(`Critical: Sheet ${def.name} still missing columns after auto-fix: ${missing.join(", ")}`);
      }
    });

  } catch (err) {
    messages.push(`Infrastructure error: ${err.toString()}`);
  }

  return {
    ok: messages.filter(m => m.startsWith('Critical:')).length === 0,
    messages,
    autoFixed
  };
}

/******************************************************
* SECTION 3 — AUTHENTICATION & ACCESS CONTROL (v1.0.0) — Start Line 290
* Purpose (Layman):
*   Handles user identification and determines what
*   directory entries each user can see. Uses Google
*   Workspace email for identity and Access column for permissions.
*
* GAS Optimization Notes:
*   - Caches user permissions per session
*   - Validates viewer identity at data layer
*   - No client-side security assumptions
*
* Inputs: User session context
* Outputs: Validated user email and access permissions
******************************************************/

/**
 * getCurrentUserEmail - Get and validate current user
 * @returns {string} Validated email or empty string
 */
function getCurrentUserEmail() {
  return withExecutionMonitoring(() => {
    const email = (Session.getActiveUser().getEmail() || '').trim().toLowerCase();

    if (!email) {
      aiLog({
        action: "getCurrentUserEmail",
        outcome: "WARNING: No user email available - check deployment settings"
      });
      return '';
    }

    aiLog({
      action: "getCurrentUserEmail",
      outcome: `User authenticated: ${email.substring(0, 3)}***`
    });

    return email;
  }, "getCurrentUserEmail");
}

/**
 * parseAccessList - Convert Access column to normalized email list
 * @param {string} accessRaw - Raw access string from sheet
 * @returns {string[]} Array of lowercase email addresses
 */
function parseAccessList(accessRaw) {
  if (!accessRaw) return [];

  return String(accessRaw)
    .split(/[,;\s]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * checkUserAccess - Determine if user can see specific entry
 * @param {string} userEmail - Current user's email
 * @param {string} accessRaw - Access column value
 * @returns {boolean} True if user has access
 */
function checkUserAccess(userEmail, accessRaw) {
  if (!userEmail) return false;

  const accessList = parseAccessList(accessRaw);

  // Strict policy: user email must be explicitly listed
  // Future: could add wildcard support like '*' or '@domain.com'
  return accessList.includes(userEmail);
}

/******************************************************
* SECTION 4 — DATA OPERATIONS & CACHING (v1.1.0) — Start Line 345
* Purpose (Layman):
*   Handles all spreadsheet reading and data processing
*   with aggressive caching for 50-user performance.
*   Transforms raw sheet data into clean directory entries.
*   Updated to handle new column structure: SS ID, Tab Name, 
*   Name in Index, Link, Categories, Access, Sheet Name, Team
*
* GAS Optimization Notes:
*   - 5-minute cache TTL balances freshness vs performance
*   - Batch sheet operations to minimize API calls
*   - User-specific caching to reduce data processing load
*
* Inputs: Spreadsheet configuration, user context
* Outputs: Filtered, cached directory data
******************************************************/

/**
 * getRawDirectoryData - Fetch all data from Index sheet with size-aware caching
 * @returns {Array[]} Raw sheet values
 */
function getRawDirectoryData() {
  return withExecutionMonitoring(() => {
    const cache = CacheService.getScriptCache();
    const cacheKey = getCacheKey("raw_data");
    const cached = cache.get(cacheKey);

    if (cached) {
      aiLog({ action: "getRawDirectoryData", outcome: "Cache HIT" });
      return JSON.parse(cached);
    }

    const ss = SpreadsheetApp.openById(PROJECT_CONFIG.directory.spreadsheetId);
    const sh = ss.getSheetByName(PROJECT_CONFIG.directory.sheetName);

    if (!sh) {
      throw new Error(`Sheet "${PROJECT_CONFIG.directory.sheetName}" not found`);
    }

    const values = sh.getDataRange().getDisplayValues();

    // Check cache size before storing
    const dataString = JSON.stringify(values);
    const sizeKB = Math.round(dataString.length / 1024);

    // GAS cache limit is ~100KB per item, be conservative at 90KB
    if (sizeKB < 90) {
      try {
        cache.put(cacheKey, dataString, PROJECT_CONFIG.directory.cacheTtlSec);
        aiLog({
          action: "getRawDirectoryData",
          outcome: `Cache MISS - Loaded ${values.length} rows, cached ${sizeKB}KB`
        });
      } catch (cacheError) {
        aiLog({
          action: "getRawDirectoryData",
          outcome: `Cache MISS - Loaded ${values.length} rows, cache failed: ${cacheError.toString()}`
        });
      }
    } else {
      aiLog({
        action: "getRawDirectoryData",
        outcome: `Cache MISS - Loaded ${values.length} rows, too large to cache (${sizeKB}KB)`
      });
    }

    return values;
  }, "getRawDirectoryData");
}

/**
 * processDirectoryData - Transform raw data into structured entries
 * @param {Array[]} rawValues - Raw sheet data
 * @returns {Object[]} Processed directory entries
 */
function processDirectoryData(rawValues) {
  if (rawValues.length < 2) return [];

  const headers = rawValues[0].map(h => (h || '').trim());
  const getIndex = (name) => headers.findIndex(h =>
    h.toLowerCase() === String(name || '').toLowerCase()
  );

  const indices = {
    ssId: getIndex('SS ID'),
    tabName: getIndex('Name in Index'),
    name: getIndex('Name in Index'),
    link: getIndex('Link'),
    categories: getIndex('Categories'),
    access: getIndex('Access (based on internal access)'),
    sheetName: getIndex('Sheet Name'),
    team: getIndex('Team (comes from employee dashboard)')
  };

  const entries = [];

  for (let i = 1; i < rawValues.length; i++) {
    const row = rawValues[i];
    if (!row || row.every(c => !String(c).trim())) continue;

    const name = row[indices.name] || '';
    const link = row[indices.link] || '';

    if (!name || !link) continue; // Require both name and link

    const categories = (row[indices.categories] || '')
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (!categories.length) categories.push('General');

    const team = String(row[indices.team] || '').trim();

    entries.push({
      ssId: row[indices.ssId] || '',
      tabName: row[indices.tabName] || '',
      name,
      url: link, // Map Link column to url property for compatibility
      link, // Keep original link property
      cats: categories, // Keep cats for backward compatibility
      categories, // New categories property
      desc: row[indices.sheetName] || '', // Use Sheet Name as description
      team: team || 'Unassigned',
      access: row[indices.access] || ''
    });
  }

  return entries;
}

/**
 * getDirectoryDataForViewer - Main data function with user filtering and safe caching
 * @returns {Object[]} Directory entries visible to current user
 */
function getDirectoryDataForViewer() {
  return withExecutionMonitoring(() => {
    const userEmail = getCurrentUserEmail();

    if (!userEmail) {
      aiLog({
        action: "getDirectoryDataForViewer",
        outcome: "No user email - returning empty data"
      });
      return [];
    }

    // User-specific cache with size check
    const cache = CacheService.getScriptCache();
    const cacheKey = getCacheKey("user_data", userEmail);
    const cached = cache.get(cacheKey);

    if (cached) {
      aiLog({
        action: "getDirectoryDataForViewer",
        outcome: `Cache HIT for user ${userEmail.substring(0, 3)}***`
      });
      return JSON.parse(cached);
    }

    // Get and process data
    const rawData = getRawDirectoryData();
    const allEntries = processDirectoryData(rawData);

    // Filter by user access
    const userEntries = allEntries.filter(entry =>
      checkUserAccess(userEmail, entry.access)
    );

    // Safe cache storage with size check
    const userDataString = JSON.stringify(userEntries);
    const sizeKB = Math.round(userDataString.length / 1024);

    if (sizeKB < 90) {
      try {
        cache.put(cacheKey, userDataString, PROJECT_CONFIG.directory.cacheTtlSec);
        aiLog({
          action: "getDirectoryDataForViewer",
          outcome: `Processed ${allEntries.length} entries, ${userEntries.length} visible, cached ${sizeKB}KB`
        });
      } catch (cacheError) {
        aiLog({
          action: "getDirectoryDataForViewer",
          outcome: `Processed ${allEntries.length} entries, ${userEntries.length} visible, cache failed: ${cacheError.toString()}`
        });
      }
    } else {
      aiLog({
        action: "getDirectoryDataForViewer",
        outcome: `Processed ${allEntries.length} entries, ${userEntries.length} visible, too large to cache (${sizeKB}KB)`
      });
    }

    return userEntries;
  }, "getDirectoryDataForViewer");
}

/**
 * Legacy function - maintained for backward compatibility
 */
function getDirectoryData() {
  // For backward compatibility - returns all data without access control
  const rawData = getRawDirectoryData();
  return processDirectoryData(rawData);
}

/**
 * getFacetsForViewer - Returns distinct teams (split) with counts and categories list
 * @returns {{ total:number, teams: Array<{name:string,count:number}>, categories: Array<{name:string,count:number}> }}
 */
function getFacetsForViewer() {
  return withExecutionMonitoring(() => {
    const entries = getDirectoryDataForViewer();
    const total = entries.length;

    // Teams with counts (split CSV, de-dup per row)
    const teamCounts = {};
    entries.forEach(e => {
      const raw = (e.team || 'Unassigned').trim() || 'Unassigned';
      const list = raw.split(',').map(t => t.trim()).filter(Boolean);
      const uniqueForRow = Array.from(new Set(list.length ? list : ['Unassigned']));
      uniqueForRow.forEach(t => { teamCounts[t] = (teamCounts[t] || 0) + 1; });
    });
    const teams = Object.keys(teamCounts)
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ name, count: teamCounts[name] }));

    // Categories with counts
    const categoryCounts = {};
    entries.forEach(e => {
      const cats = (Array.isArray(e.categories) && e.categories.length ? e.categories
                  : (Array.isArray(e.cats) ? e.cats : []));
      const uniqueCats = Array.from(new Set(cats.map(c => String(c).trim()).filter(Boolean)));
      uniqueCats.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
    });
    const categories = Object.keys(categoryCounts)
      .sort((a, b) => a.localeCompare(b))
      .map(name => ({ name, count: categoryCounts[name] }));

    return { total, teams, categories };
  }, "getFacetsForViewer");
}

/******************************************************
* SECTION 5 — FRONTEND RENDERING (v1.0.0) — Start Line 495
* Purpose (Layman):
*   Handles web app creation and HTML template processing.
*   Keeps frontend simple since team is less familiar with HTML.
*   Server-side rendering approach for better performance.
*
* GAS Optimization Notes:
*   - Minimal client-side JavaScript required
*   - Server processes data before sending to client
*   - Template-based approach for easier maintenance
*
* Inputs: HTTP requests from users
* Outputs: Rendered HTML with user-specific data
******************************************************/

/**
 * doGet - Main web app entry point
 * @param {Object} e - HTTP request event
 * @returns {HtmlOutput} Rendered web application
 */
function doGet(e) {
  return withExecutionMonitoring(() => {
    const gateCheck = rulesGate();

    if (!gateCheck.ok) {
      const criticalErrors = gateCheck.messages.filter(m => m.startsWith('Critical:'));

      if (criticalErrors.length > 0) {
        aiLog({
          action: "doGet",
          outcome: `Critical infrastructure issues: ${criticalErrors.join(", ")}`
        });

        // Return error page for critical infrastructure issues
        return HtmlService
          .createHtmlOutput(`
            <h2>Directory Setup Required</h2>
            <p>Critical infrastructure issues detected:</p>
            <ul>${criticalErrors.map(m => `<li>${m.replace('Critical: ', '')}</li>`).join('')}</ul>
            <p>Please contact IT support to complete setup.</p>
          `)
          .setTitle('Directory Error')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      } else if (gateCheck.autoFixed) {
        // Infrastructure was auto-fixed, continue normally
        aiLog({
          action: "doGet",
          outcome: `Infrastructure auto-fixed: ${gateCheck.messages.join(", ")}`
        });
      }
    }

    const userEmail = getCurrentUserEmail();

    if (!userEmail) {
      aiLog({ action: "doGet", outcome: "No user authentication available" });

      return HtmlService
        .createHtmlOutput(`
          <h2>Authentication Required</h2>
          <p>Please ensure you're logged into your Google Workspace account.</p>
          <p>If this persists, contact IT support.</p>
        `)
        .setTitle('Directory - Auth Required')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    aiLog({
      action: "doGet",
      outcome: `Web app accessed by ${userEmail.substring(0, 3)}***`
    });

    return HtmlService
      .createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Sheets Directory')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  }, "doGet");
}

/**
 * include - Helper for HTML template includes
 * @param {string} filename - Template file to include
 * @returns {string} File content
 */
function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    aiLog({ action: "include", outcome: `Missing include: ${filename} (${e && e.toString()})` });
    return "";
  }
}

/******************************************************
* SECTION 6 — ERROR HANDLING & LOGGING (v1.0.0) — Start Line 570
* Purpose (Layman):
*   Comprehensive error management and system health
*   monitoring for the directory application. Provides
*   debugging info for the technical team.
*
* GAS Optimization Notes:
*   - Structured logging for easy troubleshooting
*   - Performance metrics tracking
*   - Graceful degradation strategies
*
* Inputs: Error conditions, system events
* Outputs: Logged events, health status
******************************************************/

/**
 * whoAmI - Diagnostic function for user identity
 * @returns {string} Current user email or error message
 */
function whoAmI() {
  try {
    const email = Session.getActiveUser().getEmail() || '';
    aiLog({
      action: "whoAmI",
      outcome: email ? `User: ${email}` : "No user email available"
    });
    return email || 'No user email available';
  } catch (err) {
    aiLog({
      action: "whoAmI",
      outcome: `Error: ${err.toString()}`
    });
    return `Error: ${err.toString()}`;
  }
}

/**
 * clearAllCache - Force complete cache refresh with GAS-compatible methods
 * @returns {string} Status message  
 */
function clearAllCache() {
  return withExecutionMonitoring(() => {
    const currentUser = getCurrentUserEmail() || "unknown";
    const allKeys = [
      getCacheKey("raw_data"),
      getCacheKey("user_data", currentUser),
      // Explicit key formats
      "dir_raw_data_v3",
      `dir_user_data_v3_${currentUser}`,
      // Legacy formats that might exist
      "directory_raw_data_v2",
      `directory_user_data_v2_${currentUser}`
    ];

    const results = safeCacheClear(allKeys);

    const outcome = `All cache: ${results.cleared} keys cleared`;
    aiLog({
      action: "clearAllCache",
      outcome: results.errors.length > 0 ?
        `${outcome}, errors: ${results.errors.join("; ")}` : outcome
    });

    return results.errors.length > 0 ?
      `${outcome} (with some errors)` : outcome;
  }, "clearAllCache");
}

/**
 * safeCacheClear - Utility function for safe cache operations
 * @param {string[]} specificKeys - Array of specific cache keys to clear
 * @returns {Object} Results of cache clearing operation
 */
function safeCacheClear(specificKeys = []) {
  const results = { cleared: 0, errors: [] };

  try {
    const cache = CacheService.getScriptCache();

    // Clear specific keys
    specificKeys.forEach((key, index) => {
      try {
        cache.remove(key);
        results.cleared++;
      } catch (keyErr) {
        results.errors.push(`Key ${index}: ${keyErr.toString()}`);
      }
    });

    // Try different removeAll variations for GAS compatibility
    const removeAllMethods = [
      () => cache.removeAll([]), // New GAS signature  
      () => cache.removeAll(),   // Legacy signature
    ];

    let removeAllWorked = false;
    for (const method of removeAllMethods) {
      try {
        method();
        removeAllWorked = true;
        break;
      } catch (err) {
        // Try next method
      }
    }

    if (!removeAllWorked) {
      results.errors.push("removeAll() not available - using specific key removal only");
    }

  } catch (err) {
    results.errors.push(`Cache service error: ${err.toString()}`);
  }

  return results;
}

/**
 * clearUserCache - Force cache refresh for current user with error handling
 * @returns {string} Status message
 */
function clearUserCache() {
  return withExecutionMonitoring(() => {
    const userEmail = getCurrentUserEmail();

    if (!userEmail) {
      return "No user email available for cache clearing";
    }

    const userKeys = [
      getCacheKey("user_data", userEmail),
      `dir_user_data_v3_${userEmail}`, // Explicit key format
      `directory_user_data_v2_${userEmail}` // Legacy format
    ];

    const results = safeCacheClear(userKeys);

    const outcome = `User cache: ${results.cleared} keys cleared`;
    aiLog({
      action: "clearUserCache",
      outcome: results.errors.length > 0 ?
        `${outcome}, errors: ${results.errors.join("; ")}` : outcome
    });

    return results.errors.length > 0 ?
      `${outcome} (with some errors)` : outcome;
  }, "clearUserCache");
}

/**
 * getSystemHealth - Diagnostic function for system status
 * @returns {Object} System health metrics
 */
function getSystemHealth() {
  return withExecutionMonitoring(() => {
    const health = {
      timestamp: new Date(),
      rulesGate: rulesGate(),
      userAuth: !!getCurrentUserEmail(),
      cacheStatus: "active"
    };

    try {
      // Test data operations
      const rawData = getRawDirectoryData();
      health.dataHealth = {
        entriesCount: rawData.length - 1, // Subtract header
        lastUpdate: new Date()
      };
    } catch (err) {
      health.dataHealth = {
        error: err.toString()
      };
    }

    aiLog({
      action: "getSystemHealth",
      outcome: `Health check completed - ${health.rulesGate.ok ? 'HEALTHY' : 'ISSUES_DETECTED'}`
    });

    return health;
  }, "getSystemHealth");
}


