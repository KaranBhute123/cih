# 🚀 Complete IDE Team Collaboration System

## Overview

This document explains the comprehensive IDE system with team collaboration, branch management, and deployment features for HackShield hackathons.

---

## 1. System Flow

### Phase 1: Team Registration & Qualification
1. Teams register for hackathons through the registration system
2. Organization reviews and qualifies teams
3. Once qualified, the system generates IDE credentials for the team leader

### Phase 2: Credential Distribution
1. **Team Leader** receives:
   - Access ID (8 characters)
   - Password (16 characters)
   - Email with full details and instructions
   
2. **Team Members** receive:
   - Notification that team is qualified
   - Information that team leader will create branches for them

### Phase 3: IDE Access & Branch Creation
1. **Team Leader** logs into IDE with credentials
2. **Timer starts immediately** upon login
3. Team leader creates child branches for each teammate
4. Each branch gets its own credentials
5. Team leader shares credentials with respective teammates

### Phase 4: Development & Collaboration
1. All team members work on their assigned branches
2. Create files with any extension (.py, .tsx, .json, etc.)
3. Write code in VS Code-like editor
4. Test locally with live preview
5. Commit changes and create pull requests
6. Team leader reviews and merges to main branch

### Phase 5: Deployment
1. Team leader deploys project from IDE
2. Project hosted on HackShield servers
3. Live URL generated for judging

---

## 2. API Endpoints

### Send Credentials Email
```
POST /api/hackathons/[id]/send-credentials
```

**Body:**
```json
{
  "participantId": "string",
  "teamMemberEmails": ["email1@example.com", "email2@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credentials sent successfully"
}
```

---

### Branch Management

#### Get All Branches
```
GET /api/hackathons/[id]/branches?accessId=XXXXXXXX
```

**Response:**
```json
{
  "branches": [
    {
      "_id": "string",
      "branchName": "main",
      "branchType": "main",
      "createdBy": "Team Leader",
      "files": [],
      "commits": [],
      "pullRequests": []
    },
    {
      "_id": "string",
      "branchName": "feature/user-auth",
      "branchType": "feature",
      "assignedTo": "John Doe",
      "assignedToEmail": "john@example.com",
      "branchAccessId": "XXXXXXXX-ABC",
      "branchAccessPassword": "YYYYYYYY",
      "files": [],
      "commits": [],
      "pullRequests": []
    }
  ]
}
```

#### Create New Branch
```
POST /api/hackathons/[id]/branches
```

**Body:**
```json
{
  "accessId": "XXXXXXXX",
  "branchName": "feature/payment-gateway",
  "assignedTo": "Jane Smith",
  "assignedToEmail": "jane@example.com",
  "createdBy": "Team Leader"
}
```

**Response:**
```json
{
  "success": true,
  "branch": { /* branch object */ },
  "credentials": {
    "branchAccessId": "XXXXXXXX-XYZ",
    "branchAccessPassword": "ZZZZZZZZ"
  }
}
```

#### Update Branch (Commit, Merge)
```
PUT /api/hackathons/[id]/branches
```

**Commit Action:**
```json
{
  "accessId": "XXXXXXXX",
  "branchName": "feature/user-auth",
  "action": "commit",
  "data": {
    "message": "Added login functionality",
    "author": "John Doe",
    "filesChanged": ["auth.py", "login.tsx"]
  }
}
```

**Merge Action:**
```json
{
  "accessId": "XXXXXXXX",
  "branchName": "feature/user-auth",
  "action": "merge",
  "data": {
    "author": "Team Leader",
    "prId": "123456789"
  }
}
```

**Create Pull Request:**
```json
{
  "accessId": "XXXXXXXX",
  "branchName": "feature/user-auth",
  "action": "create_pr",
  "data": {
    "title": "Add user authentication",
    "description": "Implemented login and signup features",
    "author": "John Doe"
  }
}
```

#### Delete Branch
```
DELETE /api/hackathons/[id]/branches?accessId=XXXXXXXX&branchName=feature/old-feature
```

---

### Deployment

#### Deploy Project
```
POST /api/hackathons/[id]/deploy
```

**Body:**
```json
{
  "accessId": "XXXXXXXX",
  "projectName": "MyAwesomeApp",
  "deploymentType": "static",
  "files": [
    {
      "name": "index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "name": "app.js",
      "content": "// JavaScript code..."
    },
    {
      "name": "styles.css",
      "content": "/* CSS styles... */"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "deployment": {
    "id": "1706731200000",
    "projectName": "MyAwesomeApp",
    "url": "https://hackshield.com/deployments/XXXXXXXX/index.html",
    "status": "deployed",
    "deployedAt": "2024-01-31T12:00:00.000Z"
  }
}
```

#### Check Deployment Status
```
GET /api/hackathons/[id]/deploy?accessId=XXXXXXXX
```

**Response:**
```json
{
  "deployed": true,
  "url": "https://hackshield.com/deployments/XXXXXXXX/index.html",
  "status": "active"
}
```

---

## 3. Lockdown Mode Rules

### Timer System
- ⏱️ Timer starts **immediately** when team leader logs in
- ⏰ Timer runs continuously until hackathon ends
- 🚫 Cannot pause or stop timer
- ✅ Timer visible at all times in IDE

### Leave Detection
When user attempts to leave IDE:
1. **15-second warning** displayed
2. **Strike counted** (max 3 strikes)
3. **After 3 strikes**: Team automatically disqualified

### Violation Triggers
- Switching browser tabs
- Minimizing browser window
- Switching to another application
- Pressing Alt+Tab, Cmd+Tab
- Browser losing focus
- Pressing F12 (DevTools)
- Right-clicking (context menu disabled)

### Warning System
```
Strike 1: ⚠️ Warning! Do not leave IDE. (2 strikes remaining)
Strike 2: ⚠️⚠️ Final Warning! One more violation = Disqualification
Strike 3: ❌ DISQUALIFIED - Team removed from hackathon
```

---

## 4. File Creation System

### Supported Extensions

#### Web Development
- `.html` - HTML files
- `.css` - CSS stylesheets
- `.scss`, `.sass` - SASS/SCSS files
- `.js` - JavaScript
- `.jsx` - React JSX
- `.ts` - TypeScript
- `.tsx` - React TypeScript
- `.json` - JSON data

#### Backend Languages
- `.py` - Python
- `.java` - Java
- `.cpp`, `.cc`, `.cxx` - C++
- `.c` - C
- `.cs` - C#
- `.go` - Go
- `.rb` - Ruby
- `.php` - PHP
- `.rs` - Rust

#### Data & Config
- `.sql` - SQL scripts
- `.xml` - XML files
- `.yaml`, `.yml` - YAML config
- `.toml` - TOML config
- `.env` - Environment variables

#### Documentation
- `.md`, `.markdown` - Markdown
- `.txt` - Plain text
- `.rst` - reStructuredText

### File Creation Flow

1. Click **"Create File"** button
2. Enter filename with extension (e.g., `app.tsx`)
3. System automatically detects:
   - Language based on extension
   - Syntax highlighting theme
   - Code completion rules
   - Execution environment

Example:
```
Filename: server.py
→ Language: Python
→ Syntax: Python highlighting
→ Execution: Python interpreter
```

---

## 5. Code Editor Features

### VS Code-like Experience
✅ **Syntax Highlighting** - Color-coded syntax for all languages
✅ **Auto-completion** - IntelliSense for code suggestions
✅ **Line Numbers** - Track code lines easily
✅ **Bracket Matching** - Automatic bracket pairing
✅ **Code Folding** - Collapse/expand code blocks
✅ **Multi-cursor** - Edit multiple lines simultaneously
✅ **Find & Replace** - Search and replace text
✅ **Minimap** - Code overview on right side
✅ **Tab Support** - Multiple files in tabs

### Keyboard Shortcuts
- `Ctrl+S` - Save file
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `Ctrl+/` - Toggle comment
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+D` - Duplicate line
- `Alt+↑/↓` - Move line up/down

---

## 6. Local Hosting & Preview

### Live Preview
- Click **"Preview"** button
- Opens live preview pane
- Auto-refreshes on file save
- Supports HTML/CSS/JS projects
- Real-time console output
- Error display

### Local Server
- Runs on IDE server
- Accessible within IDE
- Port forwarding not required
- Hot reload enabled

---

## 7. Deployment System

### Deployment Types

#### Static Site
- HTML, CSS, JavaScript files
- No server-side processing
- Instant deployment
- CDN-ready

#### Node.js App
- Express, Next.js, etc.
- Server-side rendering
- API endpoints
- WebSocket support

#### Python App
- Flask, Django, FastAPI
- WSGI/ASGI server
- Database connection
- Background tasks

### Deployment Steps
1. Click **"Deploy"** button in IDE
2. Select deployment type
3. System packages all files
4. Deploys to HackShield servers
5. Generates live URL
6. URL visible to judges

### Deployment URL Format
```
https://hackshield.com/deployments/XXXXXXXX/
```

---

## 8. Team Collaboration Workflow

### Example Team: "CodeNinjas" (4 members)

#### Step 1: Team Leader Setup
```
Team Leader: Alice
Email: alice@team.com
Credentials: ABCD1234 / PASS1234PASS5678
```

Alice logs in → Timer starts → Creates branches:

#### Step 2: Branch Creation
```
Branch: feature/frontend
Assigned: Bob (bob@team.com)
Credentials: ABCD1234-FRT / PASS9876PASS5432

Branch: feature/backend
Assigned: Charlie (charlie@team.com)
Credentials: ABCD1234-BCK / PASS1111PASS2222

Branch: feature/database
Assigned: Diana (diana@team.com)
Credentials: ABCD1234-DB / PASS3333PASS4444
```

#### Step 3: Parallel Development
```
Alice (main):
- Creates project structure
- Sets up configuration
- Manages merges

Bob (frontend):
- Creates React components
- Implements UI/UX
- Styles with CSS

Charlie (backend):
- Builds API endpoints
- Handles authentication
- Database connections

Diana (database):
- Designs schema
- Writes migrations
- Seeds test data
```

#### Step 4: Code Integration
```
1. Bob commits: "Add login page"
2. Bob creates PR: "Login UI ready for review"
3. Alice reviews code
4. Alice merges to main
5. Repeat for other branches
```

#### Step 5: Final Deployment
```
1. All features merged to main
2. Alice tests complete project
3. Alice deploys from IDE
4. Live URL shared with judges
```

---

## 9. Security Features

### Credential Security
- ✅ Encrypted storage
- ✅ One-time password generation
- ✅ Auto-expiry after hackathon
- ✅ No reuse across hackathons

### Code Execution Safety
- ✅ Sandboxed environment
- ✅ Resource limits (CPU, RAM)
- ✅ Timeout protection
- ✅ Command whitelist

### Data Protection
- ✅ Isolated storage per team
- ✅ Encrypted file transmission
- ✅ Access control per branch
- ✅ Audit logging

---

## 10. Environment Variables

Add to `.env.local`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hackshield.com

# Base URL
NEXTAUTH_URL=http://localhost:3000

# MongoDB
MONGODB_URI=your-mongodb-connection-string
```

---

## 11. Usage Examples

### For Organizations (Qualifying Teams)

```javascript
// After team registers and is approved
const response = await fetch(`/api/hackathons/${hackathonId}/send-credentials`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participantId: '12345',
    teamMemberEmails: ['member1@team.com', 'member2@team.com']
  })
});

// Credentials sent via email to team leader
```

### For Team Leaders (Creating Branches)

```javascript
// Create branch for teammate
const response = await fetch(`/api/hackathons/${hackathonId}/branches`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessId: 'ABCD1234',
    branchName: 'feature/user-dashboard',
    assignedTo: 'John Doe',
    assignedToEmail: 'john@team.com',
    createdBy: 'Team Leader'
  })
});

const { credentials } = await response.json();
// Share credentials.branchAccessId and credentials.branchAccessPassword with John
```

### For Team Members (Committing Code)

```javascript
// Commit changes to branch
await fetch(`/api/hackathons/${hackathonId}/branches`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessId: 'ABCD1234',
    branchName: 'feature/user-dashboard',
    action: 'commit',
    data: {
      message: 'Added user profile page',
      author: 'John Doe',
      filesChanged: ['profile.tsx', 'profile.css']
    }
  })
});
```

### For Team Leaders (Merging Branches)

```javascript
// Merge feature branch to main
await fetch(`/api/hackathons/${hackathonId}/branches`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessId: 'ABCD1234',
    branchName: 'feature/user-dashboard',
    action: 'merge',
    data: {
      author: 'Team Leader',
      prId: '123456789'
    }
  })
});
```

### For Team Leaders (Deploying)

```javascript
// Deploy complete project
const response = await fetch(`/api/hackathons/${hackathonId}/deploy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    accessId: 'ABCD1234',
    projectName: 'AwesomeApp',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html>...' },
      { name: 'app.js', content: 'const app = ...' },
      { name: 'styles.css', content: 'body { ... }' }
    ]
  })
});

const { deployment } = await response.json();
console.log('Live URL:', deployment.url);
```

---

## 12. Troubleshooting

### Issue: Email not received
**Solution:** Check spam folder, verify SMTP credentials in `.env.local`

### Issue: Cannot create branch
**Solution:** Ensure main branch exists first, check access ID

### Issue: Code execution fails
**Solution:** Check language support, verify file extension, check syntax errors

### Issue: Deployment fails
**Solution:** Ensure all files are saved, check for errors, verify file paths

### Issue: Timer not starting
**Solution:** Clear browser cache, re-login with credentials

---

## 13. Best Practices

### For Teams
1. ✅ Plan branch structure before starting
2. ✅ Use descriptive branch names
3. ✅ Commit frequently with clear messages
4. ✅ Test before creating pull requests
5. ✅ Review code before merging
6. ✅ Deploy early to test live environment

### For Organizations
1. ✅ Qualify teams well before hackathon starts
2. ✅ Send credentials at least 24 hours early
3. ✅ Provide clear instructions
4. ✅ Test email delivery
5. ✅ Monitor team activity during hackathon

---

## 14. System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Team Registration                       │
│         (Registration Form Component)                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         Organization Reviews & Qualifies             │
│            (Admin Dashboard)                         │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Generate IDE Credentials                    │
│    (POST /api/hackathons/[id]/generate-access)      │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│           Send Email with Credentials                │
│    (POST /api/hackathons/[id]/send-credentials)     │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│      Team Leader Logs into IDE                       │
│         (IDE Authentication Screen)                  │
│              TIMER STARTS                            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         Create Branches for Team                     │
│      (POST /api/hackathons/[id]/branches)           │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Team Members Get Credentials                │
│      (Share branch access credentials)               │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│        All Members Work on Branches                  │
│     - Create files (.py, .tsx, .json, etc.)         │
│     - Write code in VS Code-like editor              │
│     - Test locally with live preview                 │
│     - Commit & push to branch                        │
│              LOCKDOWN MODE ACTIVE                    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│       Team Leader Reviews & Merges                   │
│      (PUT /api/hackathons/[id]/branches)            │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│           Deploy Complete Project                    │
│      (POST /api/hackathons/[id]/deploy)             │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│          Live URL Generated                          │
│         Project Ready for Judging                    │
└─────────────────────────────────────────────────────┘
```

---

## 15. Summary

This complete IDE system provides:

✅ **Email-based credential distribution** for qualified teams
✅ **Git-like branch management** with main and feature branches
✅ **Multi-file creation** with all programming language extensions
✅ **VS Code-like editor** with syntax highlighting and shortcuts
✅ **Local hosting** with live preview
✅ **One-click deployment** to production
✅ **Lockdown mode** with 15-second warnings and 3-strike system
✅ **Timer system** that starts on login
✅ **Team collaboration** with commits, pull requests, and merges
✅ **Automatic disqualification** after 3 violations

The system is production-ready and handles the complete lifecycle from team qualification to project deployment!

---

*Last Updated: January 31, 2024*
*HackShield IDE Platform v2.0*
