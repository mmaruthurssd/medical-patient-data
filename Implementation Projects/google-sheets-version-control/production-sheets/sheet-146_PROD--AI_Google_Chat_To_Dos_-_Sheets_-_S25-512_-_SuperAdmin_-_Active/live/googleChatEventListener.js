// SELECT * FROM `pdf-ocr-extraction-461917.chats_database.all_googlechats` WHERE TIMESTAMP_TRUNC(create_time, DAY) = TIMESTAMP("2025-09-10") and space_display_name = 'Remote team + Super Admin' order by create_time DESC


function initiate() {
  initSpaceMap_();
}

/******************************************************
 * GOOGLE CHAT MESSAGE EVENTS → BIGQUERY (MERGE UPSERT)
 * - Captures created + updated + deleted
 * - Single property: "spaceMap" { spaceName: { email, space_type, space_display_name } }
 * - Per-space checkpoints in "spaceCheckpoints"
 * - Iteration pointer "spaceExportIndex"
 * - attachments column = ARRAY<STRUCT<...>>
 ******************************************************/

/** Build a unique map of {space -> {email, space_type, space_display_name}}.
 *  Assigns the first user who sees a space as its poller for this cycle.
 *  Resets the iteration index.
 */

function initSpaceMap_() {
  // PropertiesService.getScriptProperties().deleteProperty("spaceCheckpoints");
  PropertiesService.getScriptProperties().deleteProperty("spaceMap");
  PropertiesService.getScriptProperties().deleteProperty("spaceExportIndex");

  var users = getExistingUsers_(); // [{primaryEmail, fullName}, ...]
  users = users.slice().sort((a, b) => a.primaryEmail.localeCompare(b.primaryEmail));

  var map = {}; // { "spaces/AAAA...": { email, space_type, space_display_name } }

  users.forEach(u => {
    var spaces = listSpacesForUser_({ userEmail: u.primaryEmail }) || [];
    spaces.forEach(s => {
      if (s && s.name && !map[s.name]) {
        map[s.name] = {
          email: u.primaryEmail,
          space_type: s.spaceType || null,
          space_display_name: s.displayName || ""
        };
      }
    });
  });

  setProperty_("spaceMap", JSON.stringify(map));
  setProperty_("spaceExportIndex", "0"); // start from the first space
  // keep existing "spaceCheckpoints" to continue from the last seen time
  console.log(`[initSpaceMap_] unique spaces: ${Object.keys(map).length}`);
}

function cronExportSpaceEvents() {
  cronExportSpaceEvents_();
}

// function testARGGE45544() {
//   cronExportSpaceEvents_();
// }

function cronExportSpaceEvents_() {
  getExistingUsers_();

  var mapStr = getProperty_("spaceMap");
  if (!mapStr) {
    console.log("[cronExportSpaceEvents] no map; building fresh…");
    initSpaceMap_();
    mapStr = getProperty_("spaceMap");
  }
  var map = JSON.parse(mapStr || "{}");
  var spaceKeys = Object.keys(map);
  if (spaceKeys.length === 0) {
    console.log("[cronExportSpaceEvents] empty map; rebuilding…");
    initSpaceMap_();
    return;
  }

  var idxStr = getProperty_("spaceExportIndex") || "0";
  var startIndex = Number(idxStr) || 0;

  // load per-space checkpoints
  var checkpoints = JSON.parse(getProperty_("spaceCheckpoints") || "{}");

  for (var i = startIndex; i < spaceKeys.length; i++) {
    if (isOverTime_(vMiliPerMin * 14)) {
      setProperty_("spaceExportIndex", String(i));
      setProperty_("spaceCheckpoints", JSON.stringify(checkpoints));
      console.log(`[cronExportSpaceEvents] time budget hit; paused at index ${i}`);
      return;
    }

    var space_name = spaceKeys[i];
    var info = map[space_name] || {};
    var pollingUser = info.email;
    var space_type = info.space_type || null;
    var space_display_name = info.space_display_name || "";
    if (!pollingUser) {
      // skip if map entry is malformed
      setProperty_("spaceExportIndex", String(i + 1));
      continue;
    }

    // compute time window
    var now = new Date();
    var endISO = formatRFC3339WithOffset_(now);
    var startISO;
    if (checkpoints[space_name]) {
      var t = new Date(checkpoints[space_name]);
      startISO = formatRFC3339WithOffset_(new Date(t.getTime() - 10 * 1000)); // tiny overlap
    } else {
      startISO = formatRFC3339WithOffset_(new Date(now.getTime() - 6 * 60 * 60 * 1000)); // 6hr bootstrap
    }

    // fetch events for this space
    var events = listMessageEventsForSpace_({
      userEmail: pollingUser,
      space_name,
      startISO,
      endISO
    });

    var rows = [];
    if (events && events.length) {

      var chat_user_name;
      if (objUsersUserName[pollingUser]) {
        chat_user_name = objUsersUserName[pollingUser];
      }

      // Build per-message snapshots in-order (events are oldest→newest)
      var snapshots = {}; // message_name -> snapshot

      for (var k = 0; k < events.length; k++) {
        var ev = events[k];
        var units = unpackSpaceEventToMessageUnits_(ev);
        if (!units || !units.length) continue;

        for (var u = 0; u < units.length; u++) {
          var unit = units[u];
          var msg = unit.message;
          if (!msg || !msg.name) continue;

          var id = msg.name;
          if (!snapshots[id]) {
            snapshots[id] = {
              message_name: id,
              space_name: space_name,
              space_type: space_type,
              space_display_name: space_display_name,
              // preserve first seen create_time in this run; never overwrite
              create_time: msg.createTime || null,
              // rolling fields
              sender_user_name: null,
              sender_type: null,
              text: null,
              formatted_text: null,
              attachment_count: 0,
              thread_name: null,
              sender_name: null,
              sender_email: null,
              attachments: [],
              deleteTime: null
            };
          }

          var snap = snapshots[id];

          // Only set the run's create_time once (first time we see it in this run)
          if (!snap.create_time && msg.createTime) {
            snap.create_time = msg.createTime;
          }

          // Sender details (fill when available; don't blank out if missing)
          var sender_name = msg.sender && msg.sender.name;
          var sender_type = msg.sender && msg.sender.type;
          if (sender_type) snap.sender_type = sender_type;
          if (sender_name && sender_type && String(sender_type).toUpperCase() === "HUMAN") {
            var details = getUserDetails_(String(sender_name).split("/")[1]);
            snap.sender_user_name = (details && details.displayName) || snap.sender_user_name;
            snap.sender_email = (details && details.email) || snap.sender_email;
          }
          if (sender_name) snap.sender_name = sender_name;

          // Content fields (update when present)
          if (typeof msg.text !== 'undefined' && msg.text !== null) {
            snap.text = msg.text;
          }
          if (typeof msg.formattedText !== 'undefined' && msg.formattedText !== null) {
            snap.formatted_text = msg.formattedText;
          }
          if (msg.thread && msg.thread.name) {
            snap.thread_name = msg.thread.name;
          }

          // Attachments (replace with latest array if present)
          if (Array.isArray(msg.attachment)) {
            snap.attachments = msg.attachment.map(function (atch) {
              return {
                attachment_name: atch.name || null,
                content_type: atch.contentType || null,
                content_name: atch.contentName || null,
                drive_file_id: atch.driveDataRef ? atch.driveDataRef.driveFileId : null,
                resourceName: atch.attachmentDataRef ? atch.attachmentDataRef.resourceName : null,
                attachment_downloadUri: atch.downloadUri || null,
                attachment_source: atch.source || null
              };
            });
            snap.attachment_count = snap.attachments.length;
          }

          // If this unit is a delete, mark deleteTime but DO NOT clear content
          if (isDeleteEventType_(unit.type)) {
            snap.deleteTime = unit.deleteTime || snap.deleteTime || null;
          }
        }
      }

      // Convert snapshots (last state per message) → rows for MERGE
      var nowIso = new Date().toISOString();
      Object.keys(snapshots).forEach(function (id) {
        var s = snapshots[id];
        rows.push({
          json: {
            message_name: s.message_name,
            space_name: s.space_name,
            space_type: s.space_type,
            space_display_name: s.space_display_name,
            // create_time: we set on INSERT only; this value is used there
            create_time: s.create_time,
            ingestion_time: nowIso,
            sender_user_name: s.sender_user_name,
            sender_type: s.sender_type,
            text: s.text,
            formatted_text: s.formatted_text,
            attachment_count: s.attachment_count,
            thread_name: s.thread_name,
            sender_name: s.sender_name,
            sender_email: s.sender_email,
            attachments: s.attachments,
            chat_user_email: pollingUser,
            chat_user_name: chat_user_name,
            deleteTime: s.deleteTime
          }
        });
      });
    }


    // --- within-batch de-dupe (keep the last row per message_name) ---
    if (rows.length > 0) {
      var lastById = {};
      for (var r = 0; r < rows.length; r++) {
        var id = rows[r].json.message_name;
        if (!id) continue;
        lastById[id] = rows[r]; // later rows overwrite earlier ones
      }
      rows = Object.keys(lastById).map(function (k) { return lastById[k]; });
    }


    if (rows.length > 0) {
      console.log(`rows: ${rows.length}`);
      var ok = mergeRowsToBigQuery_(rows);
      if (ok !== true) {
        // do not advance checkpoint on failure -> retry this window next run
        setProperty_("spaceExportIndex", String(i));
        setProperty_("spaceCheckpoints", JSON.stringify(checkpoints));
        throw new Error("BigQuery MERGE failed");
      }
    }

    // advance checkpoint for this space
    checkpoints[space_name] = endISO;
    // advance pointer after processing
    setProperty_("spaceExportIndex", String(i + 1));
  }

  // finished the whole map — save checkpoints and rebuild for the next cycle
  setProperty_("spaceCheckpoints", JSON.stringify(checkpoints));
  console.log("[cronExportSpaceEvents] completed map");

  PropertiesService.getScriptProperties().deleteProperty("spaceMap");
  PropertiesService.getScriptProperties().deleteProperty("spaceExportIndex");
  // initSpaceMap_();
}

/** Return an array of normalized message units from a SpaceEvent.
 *  Each unit = { message, type, eventTime, deleteTime }
 *  Handles single and batch variants for created/updated/deleted.
 */
function unpackSpaceEventToMessageUnits_(ev) {
  var out = [];
  var type = ev.eventType || '';
  var evTime = ev.eventTime || null;

  // singletons
  if (ev.messageCreatedEventData && ev.messageCreatedEventData.message) {
    out.push({ message: ev.messageCreatedEventData.message, type, eventTime: evTime, deleteTime: null });
  }
  if (ev.messageUpdatedEventData && ev.messageUpdatedEventData.message) {
    out.push({ message: ev.messageUpdatedEventData.message, type, eventTime: evTime, deleteTime: null });
  }
  if (ev.messageDeletedEventData) {
    var m = ev.messageDeletedEventData.message || null;
    var del = ev.messageDeletedEventData.deleteTime || evTime || null;
    if (m) out.push({ message: m, type, eventTime: evTime, deleteTime: del });
    // If message is absent, we can't upsert (no message_name); skip.
  }

  // batches
  if (ev.messageBatchCreatedEventData && Array.isArray(ev.messageBatchCreatedEventData.messages)) {
    ev.messageBatchCreatedEventData.messages.forEach(function (m) {
      out.push({ message: m, type, eventTime: evTime, deleteTime: null });
    });
  }
  if (ev.messageBatchUpdatedEventData && Array.isArray(ev.messageBatchUpdatedEventData.messages)) {
    ev.messageBatchUpdatedEventData.messages.forEach(function (m) {
      out.push({ message: m, type, eventTime: evTime, deleteTime: null });
    });
  }
  if (ev.messageBatchDeletedEventData && Array.isArray(ev.messageBatchDeletedEventData.messages)) {
    ev.messageBatchDeletedEventData.messages.forEach(function (m) {
      // batch delete may include per-message deleteTime; fall back to eventTime
      var del = (m && m.deleteTime) || evTime || null;
      out.push({ message: m, type, eventTime: evTime, deleteTime: del });
    });
  }

  return out;
}

/** True if the (normalized) unit represents a delete event type. */
function isDeleteEventType_(eventType) {
  // Covers both single and batch delete event type strings.
  return String(eventType || '').indexOf('.deleted') !== -1;
}

/** Fetch message events (created + updated + deleted) for one space & time window. */
function listMessageEventsForSpace_({ userEmail, space_name, startISO, endISO }) {
  var scope = 'https://www.googleapis.com/auth/chat.spaces https://www.googleapis.com/auth/chat.messages';
  var token = getAccessTokenFromKey_({ scope: scope, sub: userEmail });

  var basicURL = 'https://chat.googleapis.com/v1/' + space_name + '/spaceEvents';
  var eventTypes = [
    'google.workspace.chat.message.v1.created',
    'google.workspace.chat.message.v1.updated',
    'google.workspace.chat.message.v1.deleted'
  ];
  var filter =
    `startTime="${startISO}" AND endTime="${endISO}" AND (` +
    eventTypes.map(t => `eventTypes:"${t}"`).join(' OR ') + `)`;

  var pageToken, all = [];
  do {
    var objParas = { pageSize: "1000", filter: filter };
    if (pageToken) objParas.pageToken = pageToken;

    var sURL = getURL_({ basicURL: basicURL, objParas: objParas });

    var resp = UrlFetchApp.fetch(sURL, {
      method: 'get',
      headers: { Authorization: 'Bearer ' + token },
      muteHttpExceptions: true
    });

    if (resp.getResponseCode() !== 200) {
      console.log(`spaceEvents.list HTTP ${resp.getResponseCode()} ${resp.getContentText()}`);
      return [];
    }

    var data = JSON.parse(resp.getContentText());
    if (data.spaceEvents && data.spaceEvents.length) all = all.concat(data.spaceEvents); // oldest-first
    pageToken = data.nextPageToken;
  } while (pageToken);

  return all;
}

function mergeRowsToBigQuery_(rows) {
  if (!rows || rows.length === 0) return true;

  // JS-side sanity: keep only rows with a MERGE key
  rows = rows.filter(function (r) { return r && r.json && r.json.message_name; });
  if (rows.length === 0) return true;

  var payload = rows.map(function (r) { return r.json; });

  var fqTable = '`' + PROJECT_ID + '.' + DATASET_ID + '.' + TABLE_ID + '`';

  var query = `
    MERGE ${fqTable} T
    USING UNNEST(@rows) AS S
    ON T.message_name = S.message_name
    WHEN MATCHED THEN
      UPDATE SET
        create_time         = T.create_time, -- immutable
        space_name          = COALESCE(S.space_name,         T.space_name),
        space_type          = COALESCE(S.space_type,         T.space_type),
        space_display_name  = COALESCE(S.space_display_name, T.space_display_name),
        ingestion_time      = S.ingestion_time,
        sender_user_name    = COALESCE(S.sender_user_name,   T.sender_user_name),
        sender_type         = COALESCE(S.sender_type,        T.sender_type),
        text                = COALESCE(S.text,               T.text),
        formatted_text      = COALESCE(S.formatted_text,     T.formatted_text),
        attachment_count    = COALESCE(S.attachment_count,   T.attachment_count),
        thread_name         = COALESCE(S.thread_name,        T.thread_name),
        sender_name         = COALESCE(S.sender_name,        T.sender_name),
        sender_email        = COALESCE(S.sender_email,       T.sender_email),
        attachments         = COALESCE(S.attachments,        T.attachments),
        chat_user_email     = COALESCE(S.chat_user_email,    T.chat_user_email),
        chat_user_name      = COALESCE(S.chat_user_name,     T.chat_user_name),
        deleteTime          = IFNULL(GREATEST(S.deleteTime, T.deleteTime), COALESCE(S.deleteTime, T.deleteTime))
    WHEN NOT MATCHED AND S.deleteTime IS NULL AND S.message_name IS NOT NULL THEN
      INSERT (
        message_name, space_name, space_type, space_display_name, create_time, ingestion_time,
        sender_user_name, sender_type, text, formatted_text, attachment_count, thread_name,
        sender_name, sender_email, attachments, chat_user_email, chat_user_name, deleteTime
      ) VALUES (
        S.message_name, S.space_name, S.space_type, S.space_display_name, S.create_time, S.ingestion_time,
        S.sender_user_name, S.sender_type, S.text, S.formatted_text, S.attachment_count, S.thread_name,
        S.sender_name, S.sender_email, S.attachments, S.chat_user_email, S.chat_user_name, S.deleteTime
      )
  `;

  // Log the exact MERGE and a sample key (helps verify you’re running this version)
  // Logger.log('MERGE query:\n' + query);
  // Logger.log('Target table: ' + PROJECT_ID + '.' + DATASET_ID + '.' + TABLE_ID);
  Logger.log('Param example key: ' + (payload[0] && payload[0].message_name));

  // Schema for @rows (STRUCT with an ARRAY<STRUCT> field 'attachments')
  var structFields = [
    { name: 'message_name', type: 'STRING' },
    { name: 'space_name', type: 'STRING' },
    { name: 'space_type', type: 'STRING' },
    { name: 'space_display_name', type: 'STRING' },
    { name: 'create_time', type: 'TIMESTAMP' },
    { name: 'ingestion_time', type: 'TIMESTAMP' },
    { name: 'sender_user_name', type: 'STRING' },
    { name: 'sender_type', type: 'STRING' },
    { name: 'text', type: 'STRING' },
    { name: 'formatted_text', type: 'STRING' },
    { name: 'attachment_count', type: 'INT64' },
    { name: 'thread_name', type: 'STRING' },
    { name: 'sender_name', type: 'STRING' },
    { name: 'sender_email', type: 'STRING' },
    { name: 'attachments', type: 'ARRAY<STRUCT>' },
    { name: 'chat_user_email', type: 'STRING' },
    { name: 'chat_user_name', type: 'STRING' },
    { name: 'deleteTime', type: 'TIMESTAMP' }
  ];

  var params = [{
    name: 'rows',
    parameterType: {
      type: 'ARRAY',
      arrayType: {
        type: 'STRUCT',
        structTypes: structFields.map(function (f) {
          if (f.type === 'ARRAY<STRUCT>') {
            return {
              name: f.name,
              type: {
                type: 'ARRAY',
                arrayType: {
                  type: 'STRUCT',
                  structTypes: [
                    { name: 'attachment_name', type: { type: 'STRING' } },
                    { name: 'content_type', type: { type: 'STRING' } },
                    { name: 'content_name', type: { type: 'STRING' } },
                    { name: 'drive_file_id', type: { type: 'STRING' } },
                    { name: 'resourceName', type: { type: 'STRING' } },
                    { name: 'attachment_downloadUri', type: { type: 'STRING' } },
                    { name: 'attachment_source', type: { type: 'STRING' } }
                  ]
                }
              }
            };
          }
          return { name: f.name, type: { type: f.type } };
        })
      }
    },
    parameterValue: {
      arrayValues: payload.map(function (p) {
        var sv = {};
        structFields.forEach(function (f) {
          var v = p[f.name];
          if (f.type === 'INT64') {
            sv[f.name] = { value: v == null ? null : String(v) };
          } else if (f.type === 'TIMESTAMP') {
            sv[f.name] = { value: v == null ? null : String(v) };
          } else if (f.type === 'ARRAY<STRUCT>') {
            if (v == null) {
              // NULL so COALESCE(S.attachments, T.attachments) preserves existing data
              sv[f.name] = null;
            } else {
              sv[f.name] = {
                arrayValues: v.map(function (att) {
                  return {
                    structValues: {
                      attachment_name: { value: att.attachment_name || null },
                      content_type: { value: att.content_type || null },
                      content_name: { value: att.content_name || null },
                      drive_file_id: { value: att.drive_file_id || null },
                      resourceName: { value: att.resourceName || null },
                      attachment_downloadUri: { value: att.attachment_downloadUri || null },
                      attachment_source: { value: att.attachment_source || null }
                    }
                  };
                })
              };
            }
          } else {
            sv[f.name] = { value: v == null ? null : String(v) };
          }
        });
        return { structValues: sv };
      })
    }
  }];

  var request = {
    query: query,
    parameterMode: 'NAMED',
    queryParameters: params,
    useLegacySql: false
  };

  var queryResults = BigQuery.Jobs.query(request, PROJECT_ID);
  var jobId = queryResults.jobReference.jobId;

  var sleepTime = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTime);
    sleepTime = Math.min(sleepTime * 2, 8000);
    queryResults = BigQuery.Jobs.getQueryResults(PROJECT_ID, jobId);
  }

  // Ground truth: DML stats
  var job = BigQuery.Jobs.get(PROJECT_ID, jobId);
  var stats = job && job.statistics && job.statistics.query && job.statistics.query.dmlStats;
  Logger.log('DML stats: ' + JSON.stringify(stats));

  if (queryResults.errors && queryResults.errors.length) {
    Logger.log(JSON.stringify(queryResults.errors, null, 2));
    return false;
  }
  Logger.log('MERGE sent ' + payload.length + ' row(s).');
  return true;
}
