

function grantEditorsToFolder(folderId, emails) {

  // folderId="1wh2F8VY4YOCbbufQPvlgRPSMhPMNYqU0"
  // emails=["khenriquez@ssdspc.com"]
  const folder = DriveApp.getFolderById(folderId);

  // Build a set of current editors to avoid redundant calls
  const existing = new Set(folder.getEditors().map(u => u.getEmail().toLowerCase()));

  // Clean + de-duplicate incoming emails
  const toAdd = (emails || [])
    .map(e => (e || '').trim().toLowerCase())
    .filter(e => e && !existing.has(e));

  try {
    if (toAdd.length) {
      folder.addEditors(toAdd); // adds, does NOT remove anyone
    }
  } catch (perr) { }
}



/**
 * Grant Content manager on a Shared Drive folder to a list of principals.
 * - Uses Drive Advanced Service (Drive.*)
 * - Does NOT remove existing editors
 * - Upgrades lower roles to Content manager when needed
 *
 * @param {string} folderId  The Drive folder ID (in a Shared Drive)
 * @param {string[]} users   Email addresses of users (type "user")
 * @param {string[]} groups  (optional) Google Group emails (type "group")
 * @param {boolean} notify   (optional) send notification email (default false)
 */
function grantContentManagersToSharedFolder(folderId, users, groups = [], notify = false) {
  const ROLE = 'fileOrganizer'; // Content manager
  const supports = { supportsAllDrives: true };

  // 1) Read current permissions on the folder
  const perms = Drive.Permissions.list(folderId, supports).items || [];
  // Map existing user/group email -> {id, role, type}
  const current = new Map(
    perms
      .filter(p => (p.type === 'user' || p.type === 'group') && p.emailAddress)
      .map(p => [p.emailAddress.toLowerCase(), { id: p.id, role: p.role, type: p.type }])
  );

  // Utility to compare/upgrade roles. Lowest -> highest
  const rank = r => ({ reader: 1, commenter: 2, writer: 3, fileOrganizer: 4, organizer: 5, owner: 6 }[r] || 0);

  // Helper to create or upgrade a permission
  function ensureRole(email, type) {
    const key = (email || '').toLowerCase().trim();
    if (!key) return;

    const existing = current.get(key);

    // If no permission exists -> create
    if (!existing) {
      const resource = {
        type,
        role: ROLE,
        value: key
      };
      Drive.Permissions.insert(resource, folderId, {
        supportsAllDrives: true,
        sendNotificationEmails: notify
      });
      return;
    }

    // If permission exists with lower role -> upgrade
    if (rank(existing.role) < rank(ROLE)) {
      const resource = { role: ROLE };
      Drive.Permissions.update(resource, folderId, existing.id, { supportsAllDrives: true });
    }
    // If same-or-higher role already present -> nothing to do
  }

  // 2) Apply for users
  (users || []).forEach(email => ensureRole(email, 'user'));

  // 3) Apply for groups (if any)
  (groups || []).forEach(email => ensureRole(email, 'group'));
}


