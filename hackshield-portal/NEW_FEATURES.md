# New Registration Features

## Overview
The HackShield registration system now includes **Smart Team Matching** and **PPT Upload for Selection Rounds** to enhance the hackathon experience.

---

## 1. Smart Team Matching 🤝

### What is it?
If a participant doesn't have a team, they can use AI-powered smart matching to find teammates based on complementary skills.

### How it works:

#### For Participants:
1. **During Registration:**
   - Select "I need a team" option
   - Enable "Smart matching based on my skills"
   - Add your skills (e.g., React, Python, UI/UX Design, Machine Learning)
   - Choose your preferred team size

2. **Matching Algorithm:**
   - 30% score for common skills (ensures collaboration compatibility)
   - 70% score for complementary skills (ensures diverse team)
   - Returns top 10 matches sorted by score

3. **Collaboration:**
   - View potential teammates with their skills and details
   - Send collaboration invites
   - Receive invites from others
   - Form teams together

#### API Endpoints:
- **POST** `/api/hackathons/[id]/smart-matching` - Find matches
- **PATCH** `/api/hackathons/[id]/smart-matching` - Send/accept invites

### Database Fields:
```typescript
hasTeam: boolean                    // Does user have a team?
needSmartMatching: boolean          // Enable smart matching?
skills: string[]                    // List of skills
preferredTeamSize: number           // Desired team size
matchingStatus: 'pending' | 'matched' | 'not-needed'
matchedWith: string[]               // User IDs of matched teammates
```

---

## 2. PPT Upload for Selection Rounds 📊

### What is it?
Participants can upload their PowerPoint presentation for the first selection round. After clearing this round, they proceed to the live modeling hackathon.

### Selection Process Flow:
```
Registration → Round 1 (PPT Evaluation) → Round 2 (Live Modeling Hackathon)
```

### Features:
- **File Types:** .ppt, .pptx
- **Max Size:** 50MB
- **Storage:** `/public/uploads/ppts/[hackathonId]/`
- **Validation:** File type and size validation
- **Status Tracking:** pending, approved, rejected

### How it works:

#### For Participants:
1. During registration, scroll to "Selection Round 1 - PPT Submission"
2. Click to upload your PowerPoint presentation
3. See file name and size confirmation
4. Submit registration with PPT

#### For Organizations:
- View uploaded PPTs in registration dashboard
- Evaluate presentations
- Approve/reject for Round 2
- Provide feedback

### Database Fields:
```typescript
pptUrl: string                      // URL to uploaded PPT
pptUploadedAt: Date                 // Upload timestamp
selectionRound1Status: 'pending' | 'approved' | 'rejected'
selectionRound1Feedback: string     // Feedback from evaluators
```

### API Endpoint:
- **POST** `/api/hackathons/upload-ppt` - Upload PPT file

---

## 3. Updated Registration Form

### New UI Sections:

#### Team Formation Mode:
- Radio buttons: "I have a team" or "I need a team"
- Conditional rendering based on selection
- Team name field only shown if user has team

#### Smart Matching Section (when "I need a team"):
- Checkbox to enable smart matching
- Skills input with tag display
- Preferred team size dropdown
- Info message about AI matching

#### PPT Upload Section:
- Drag & drop / click to upload
- File preview with size display
- Delete uploaded file option
- Selection process explanation

### Form Validation:
- If has team: Team name and members required
- If needs matching: At least one skill required
- PPT upload is optional

---

## 4. Technical Implementation

### Components Updated:
1. **RegistrationForm.tsx** - Main form with new sections
2. **RegistrationButton.tsx** - Modal trigger (unchanged)

### API Routes Created:
1. **upload-ppt/route.ts** - File upload handling
2. **smart-matching/route.ts** - Team matching logic

### Schema Updates:
- **Hackathon.ts** - Added 10+ new participant fields

### Registration API Updated:
- **[id]/register/route.ts** - Handles all new fields

---

## 5. Usage Examples

### Register with Team:
```typescript
{
  hasTeam: true,
  teamName: "Tech Warriors",
  teamSize: 3,
  teamLeaderName: "John Doe",
  // ... other fields
  teamMembers: [/* array of members */],
  pptUrl: "/uploads/ppts/abc123/ppt_1234567890.pptx"
}
```

### Register without Team (Smart Matching):
```typescript
{
  hasTeam: false,
  needSmartMatching: true,
  skills: ["React", "Node.js", "MongoDB"],
  preferredTeamSize: 4,
  teamLeaderName: "Jane Smith",
  // ... other fields
  matchingStatus: "pending"
}
```

---

## 6. Future Enhancements

### Potential Improvements:
- Real-time notifications for collaboration invites
- Chat system for matched teammates
- Video interviews for selection round
- Automated team formation based on matches
- Round 2 workspace with live coding environment

---

## 7. Testing

### Test Cases:
1. ✅ Register with existing team + PPT upload
2. ✅ Register without team + smart matching enabled
3. ✅ Upload PPT (valid file types and sizes)
4. ✅ Upload PPT (invalid file types - should fail)
5. ✅ Find smart matches based on skills
6. ✅ Send collaboration invites
7. ✅ View all registrations in organization dashboard

---

## 8. File Structure

```
hackshield-portal/
├── components/
│   └── hackathons/
│       ├── RegistrationForm.tsx      (Updated - 810 lines)
│       └── RegistrationButton.tsx    (Unchanged)
├── app/api/hackathons/
│   ├── upload-ppt/
│   │   └── route.ts                  (New - PPT upload)
│   └── [id]/
│       ├── register/
│       │   └── route.ts              (Updated - new fields)
│       └── smart-matching/
│           └── route.ts              (New - team matching)
├── lib/db/models/
│   └── Hackathon.ts                  (Updated - schema)
└── public/uploads/ppts/              (Created - file storage)
```

---

## Summary

The HackShield platform now offers:
- 🤝 **Smart Team Matching** - AI-powered teammate discovery
- 📊 **PPT Upload** - Selection round 1 submission
- 🎯 **Two-Round Process** - PPT evaluation → Live hackathon
- 🚀 **Enhanced UX** - Better registration flow

All features are production-ready and integrated! 🎉
