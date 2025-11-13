
var objUsers = null;

var objUsersUserName = {};

function getUserDetails_(userId) {

  if (objUsers == null) {
    objUsers = {};

    var existingUsers = getProperty_("allUsersDetails");
    if (existingUsers) {
      objUsers = JSON.parse(existingUsers);
    }
  }

  if (!objUsers[userId]) {
    objUsers[userId] = {};

    var userDetails = getUserProfile_(userId);

    if (userDetails.error) {
      objUsers[userId].displayName = "NOT_FOUND";
      objUsers[userId].email = "NOT_FOUND";

    } else {
      var emailAddresses = userDetails.emailAddresses;

      if (emailAddresses) {
        emailAddresses.forEach(em => {
          if (em.metadata.primary == true) {
            objUsers[userId].email = em.value;
          }
        });
      }

      if (userDetails.names) {
        objUsers[userId].displayName = userDetails.names[0].displayName;
      }

      if (!objUsers[userId].email) {
        objUsers[userId].email = "NOT_FOUND";
      }

      if (!objUsers[userId].displayName) {
        objUsers[userId].displayName = "NOT_FOUND";
      }

    }

    setProperty_("allUsersDetails", JSON.stringify(objUsers));
  }

  if (objUsers[userId].displayName == "NOT_FOUND") {
    var userNameUsingMention = getUserNameUsingMention_(`users/${userId}`);
    if (userNameUsingMention && userNameUsingMention != "") {
      objUsers[userId].displayName = userNameUsingMention;
      setProperty_("allUsersDetails", JSON.stringify(objUsers));
    }
  }

  return objUsers[userId];
}

function getUserProfile_(userId) {
  // var accessToken = getAccessTokenFromKey_({ scope: scope, sub: ADMIN_TO_IMPERSONATE });

  const url = `https://people.googleapis.com/v1/people/${userId}?personFields=names,emailAddresses`;
  const options = {
    method: "get",
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());
  return json;
}

/**
 * Fetch all users in the Workspace using your service account + DWD.
 * - Impersonates an admin (set ADMIN_TO_IMPERSONATE below).
 * - Uses customer=my_customer so it works for multi-domain orgs.
 * - Logs results and (optionally) writes to a Sheet.
 */
function getListOfAllUsers_() {
  var ADMIN_TO_IMPERSONATE = 'adminhelp@ssdspc.com'; // an admin with Users: Read
  var scope = 'https://www.googleapis.com/auth/admin.directory.user';

  var accessToken = getAccessTokenFromKey_({ scope: scope, sub: ADMIN_TO_IMPERSONATE });

  var users = [];
  var pageToken;
  var base = 'https://admin.googleapis.com/admin/directory/v1/users';

  do {
    var params = {
      customer: 'my_customer',   // includes all domains in the org
      maxResults: 100,
      orderBy: 'email'
    };
    if (pageToken) params.pageToken = pageToken;

    var url = base + '?' + toQueryString_(params);
    var resp = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + accessToken },
      muteHttpExceptions: true
    });

    if (resp.getResponseCode() !== 200) {
      throw new Error('Directory API error: ' + resp.getResponseCode() + ' ' + resp.getContentText());
    }

    var data = JSON.parse(resp.getContentText());
    if (data.users && data.users.length) users = users.concat(data.users);
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Log a quick preview
  // users.slice(0, 10).forEach(function (u) {
  // Logger.log('%s (%s)', u.primaryEmail, u.name && u.name.fullName);
  // });

  Logger.log('Total users: %s', users.length);

  return users;
}

function toQueryString_(obj) {
  return Object.keys(obj)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&');
}

function listAllUsers() {
  var users = getListOfAllUsers_();
  var allUsers = [];
  // var allUsers = getExistingUsers_();

  var allUsersMap = allUsers.map(u => u.primaryEmail);

  var bNew = false;

  users.forEach(function (u) {
    if (!allUsersMap.includes(u.primaryEmail)) {
      bNew = true;
      allUsers.push({
        primaryEmail: u.primaryEmail,
        fullName: u.name.fullName
      });
    }
  });

  if (bNew) {
    setProperty_("allUsers", JSON.stringify(allUsers));
  }

}

function getExistingUsers_() {
  var allUsers = [];

  var existingUsers = getProperty_("allUsers");
  if (existingUsers) {
    allUsers = JSON.parse(existingUsers);
  }

  allUsers.forEach(user => {
    objUsersUserName[user.primaryEmail] = user.fullName;
  });

  return allUsers;
}


function testaRGRG() {
  var userId = 'people/115133606572223025900';

  var ADMIN_TO_IMPERSONATE = 'adminhelp@ssdspc.com'; // an admin with Users: Read
  var response = saPeopleGetByResource_(userId, ADMIN_TO_IMPERSONATE);
  console.log(response);

  // var userDetails = getUserDetails_(userId);
  // console.log(userDetails);
  // var userprofile = getUserProfile_(userId);
  // console.log(userprofile);
}

function saAdminGetUserByKey_(userKey, adminSub) {
  const scope = 'https://www.googleapis.com/auth/admin.directory.user';
  const url = `https://admin.googleapis.com/admin/directory/v1/users/${encodeURIComponent(userKey)}`;
  return fetchJsonWithSA_(url, { scope, sub: adminSub }); // Admin SDK "User"
}

function saPeopleGetByResource_(resourceName, adminSub) {
  // single scope – the official one for directory reads
  const scope = 'https://www.googleapis.com/auth/directory.readonly';
  const url = `https://people.googleapis.com/v1/${resourceName}?personFields=names,emailAddresses`;
  return fetchJsonWithSA_(url, { scope, sub: adminSub });
}

/**
 * Extracts the display name that was replaced by <resourcename> in formatted_text.
 * Works for multi-word names (e.g., "@Ashok Puri").
 */
function extractDisplayName_(text, formatted_text, resourcename) {
  var token = "<" + resourcename + ">";
  var i = formatted_text.indexOf(token);
  if (i === -1) return null;

  var j = i + token.length;

  // Everything before/after the token should match the same prefix/suffix in `text`
  var prefix = formatted_text.slice(0, i);
  var suffix = formatted_text.slice(j);

  // Quick sanity checks: the non-mention parts should be identical
  if (!text.startsWith(prefix) || !text.endsWith(suffix)) {
    // If formatting isn't perfectly aligned, bail gracefully
    // (You could add fuzzier matching here if needed)
    return null;
  }

  // The replaced chunk in `text` is what's between prefix and suffix
  var start = prefix.length;
  var end = text.length - suffix.length;
  var mentionChunk = text.slice(start, end).trim();

  // Remove leading @ and surrounding punctuation/spaces
  mentionChunk = mentionChunk.replace(/^@+/, "").replace(/^[\s]+|[\s]+$/g, "");

  // Optional: strip trailing punctuation that isn't part of names
  mentionChunk = mentionChunk.replace(/[.,!?;:]+$/, "").trim();

  return mentionChunk || null;
}

function testaRWRG() {
  var sender_name = "users/115133606572223025900";
  console.log(getUserNameUsingMention_(sender_name));
}

function getUserNameUsingMention_(sender_name) {
  var sDateTo = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() + 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var sDateFrom = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 30)), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // var sDateFrom = "2020-01-01";

  var query = 'SELECT text, formatted_text FROM `pdf-ocr-extraction-461917.chats_database.all_googlechats` where timestamp_trunc(create_time,DAY)'
  query += `BETWEEN "${sDateFrom}" and "${sDateTo}" and CONTAINS_SUBSTR(formatted_text, "<${sender_name}>")`;

  var objUserResources = {};

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  if (results.length == 0) return;

  results.forEach(r => {
    if (!objUserResources[sender_name]) {
      var name = extractDisplayName_(r.text, r.formatted_text, sender_name);
      if (name) {
        objUserResources[sender_name] = name;
      }
    }
  });

  Object.keys(objUserResources).forEach(sender_name => {
    var sender_user_name = objUserResources[sender_name];
    try {
      updateSenderUserName_(sender_name, sender_user_name);
    } catch (err) {
      console.log(err);
    }
  });

  return objUserResources[sender_name];
}


function getAllUnknownUsers() {
  var query = 'SELECT distinct sender_name FROM `pdf-ocr-extraction-461917.chats_database.all_googlechats` where sender_user_name = "NOT_FOUND"';

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  if (results.length == 0) return;

  var sDateTo = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() + 1)), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var sDateFrom = Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() - 7)), Session.getScriptTimeZone(), "yyyy-MM-dd");

  var query = 'SELECT text, formatted_text FROM `pdf-ocr-extraction-461917.chats_database.all_googlechats` where timestamp_trunc(create_time,DAY)'
  query += `BETWEEN "${sDateFrom}" and "${sDateTo}" and (`;

  var allUserResources = [];
  var objUserResources = {};

  results.forEach((r, x) => {
    allUserResources.push(r.sender_name);
    if (x > 0) query += ' or ';
    query += `CONTAINS_SUBSTR(formatted_text, "<${r.sender_name}>")`
  });

  query += ')';

  var results = runBigQueryQuery_({ query, projectId: PROJECT_ID });
  if (results.length == 0) return;

  results.forEach(r => {
    allUserResources.forEach(resourcename => {
      if (!objUserResources[resourcename]) {
        var name = extractDisplayName_(r.text, r.formatted_text, resourcename);
        if (name) {
          objUserResources[resourcename] = name;
        }
      }
    });
  });

  Object.keys(objUserResources).forEach(resourcename => {
    var sender_user_name = objUserResources[resourcename];
    try {
      updateSenderUserName_(resourcename, sender_user_name);
    } catch (err) {
      console.log(err);
    }
  });

}

function testARTGWR() {
  var usersIds = getNotFoundUsers_();
  console.log(usersIds);
  console.log(usersIds.length);
}

function getNotFoundUsers_() {
  var objUsers = {};

  var existingUsers = getProperty_("allUsersDetails");
  if (existingUsers) {
    objUsers = JSON.parse(existingUsers);
  }

  var nfUsers = [];
  Object.keys(objUsers).forEach(key => {

    if (objUsers[key].displayName == "NOT_FOUND") {
      var userNameUsingMention = getUserNameUsingMention_(`users/${key}`);
      if (userNameUsingMention && userNameUsingMention != "") {
        objUsers[key].displayName = userNameUsingMention;
        setProperty_("allUsersDetails", JSON.stringify(objUsers));
      }
    }

    if (objUsers[key].displayName == "NOT_FOUND") {
      nfUsers.push(key);
    }

  });

  return nfUsers;
}

/**
 * Updates sender_user_name in BigQuery where sender_name matches
 *
 * @param {string} senderName       - Value to match in sender_name
 * @param {string} senderUserName   - New value for sender_user_name
 * @return {Object} BigQuery query results
 */
function updateSenderUserName_(senderName, senderUserName) {
  if (!senderName || !senderUserName) {
    console.log("senderName and senderUserName are required");
    return;
  }

  // Escape single quotes for safe SQL literals
  var safeSenderName = String(senderName).replace(/'/g, "''");
  var safeSenderUserName = String(senderUserName).replace(/'/g, "''");

  var sql = `
    UPDATE \`${PROJECT_ID}.${DATASET_ID}.${TABLE_ID}\`
    SET sender_user_name = '${safeSenderUserName}'
    WHERE sender_name = '${safeSenderName}'
  `;

  var queryRequest = {
    query: sql,
    useLegacySql: false
  };

  var queryResults = BigQuery.Jobs.query(queryRequest, PROJECT_ID);

  // Wait for job to finish
  var jobId = queryResults.jobReference.jobId;
  while (!queryResults.jobComplete) {
    Utilities.sleep(1000);
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId);
  }

  return queryResults;
}

/**
 * List members of a Google Chat space.
 * @param {string} space        Resource name, e.g. "spaces/AAAAB3NzaC1yc2EAAA..."
 * @param {string} subject      User to impersonate (must be a member of the space,
 *                              or a GW admin if useAdminAccess=true)
 * @param {Object} [opts]
 * @param {boolean} [opts.useAdminAccess=false]  Use admin privileges across org
 * @param {number}  [opts.pageSize=1000]         Max 1..1000 per page
 * @param {boolean} [opts.humansOnly=true]       Filter out bots (required when useAdminAccess=true)
 * @param {boolean} [opts.showGroups=false]      Include Google Group memberships
 * @param {boolean} [opts.showInvited=false]     Include invited (pending) members
 * @returns {Array<{memberName:string,userId:string|null,role:string,state:string,type:string}>}
 */
function chatListMembers_(space, subject, opts) {
  opts = opts || {};
  const useAdminAccess = !!opts.useAdminAccess;
  const pageSize = Math.min(Math.max(opts.pageSize || 1000, 1), 1000);
  const humansOnly = opts.humansOnly !== false; // default true
  const showGroups = !!opts.showGroups;
  const showInvited = !!opts.showInvited;

  // Choose the scope depending on useAdminAccess
  const scope = useAdminAccess
    ? 'https://www.googleapis.com/auth/chat.admin.memberships'
    : 'https://www.googleapis.com/auth/chat.memberships';

  // Build filter
  // When useAdminAccess=true, API REQUIRES a member.type filter for HUMANS (or != BOT). (docs)
  // We'll default to HUMAN only unless caller disables it.
  let filter = '';
  if (humansOnly) filter = 'member.type = "HUMAN"';

  let pageToken = '';
  const out = [];

  do {
    const params = [
      `pageSize=${pageSize}`,
      filter ? `filter=${encodeURIComponent(filter)}` : '',
      showGroups ? 'showGroups=true' : '',
      showInvited ? 'showInvited=true' : '',
      useAdminAccess ? 'useAdminAccess=true' : '',
      pageToken ? `pageToken=${encodeURIComponent(pageToken)}` : ''
    ].filter(Boolean).join('&');

    const url = `https://chat.googleapis.com/v1/${space}/members` + (params ? `?${params}` : '');
    const data = fetchJsonWithSA_(url, { scope, sub: subject });

    for (const m of (data.memberships || [])) {
      // Membership fields per API:
      // m.name: "spaces/.../members/..."
      // m.member: { name: "users/123..." | "groups/..." | "bots/...", type: "HUMAN"|"BOT"|... }
      // m.role: "ROLE_MEMBER" | "ROLE_MANAGER"
      // m.state: "INVITED" | "JOINED" | "NOT_A_MEMBER"
      const member = m.member || {};
      const memberName = String(member.name || '');
      const type = String(member.type || '');
      const userId = memberName.startsWith('users/') ? memberName : null;

      // out.push({
      //   memberName,                 // e.g. "users/115133606572223025900" or "groups/..."
      //   userId,                     // same as memberName if it's a user, else null
      //   role: String(m.role || ''), // "ROLE_MEMBER" | "ROLE_MANAGER"
      //   state: String(m.state || ''), // "JOINED" | "INVITED" | ...
      //   type                        // "HUMAN" | "BOT" | "GROUP"
      // });

      if (type == "HUMAN" && userId) {
        out.push(userId);
      }
    }

    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return out;
}

/**
 * Example runner.
 */
function demo_ListMembers() {
  const spaceName = 'spaces/tU4j8CAAAAE';   // <-- your space
  const sub = 'agonzalez@ssdspc.com';          // <-- user to impersonate
  const members = chatListMembers_(spaceName, sub);
  Logger.log(JSON.stringify(members, null, 2));
}
