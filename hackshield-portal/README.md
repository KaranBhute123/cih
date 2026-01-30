# HackShield Portal

A comprehensive hackathon management platform with secure coding environment, real-time collaboration, and project marketplace.

## 🚀 Features

### For Participants
- 🔒 **Lockdown IDE** - Secure coding environment with Monaco Editor
- 👥 **Team Collaboration** - Real-time code editing and chat
- 🏆 **Gamification** - XP, levels, badges, and leaderboards
- 📊 **Dashboard** - Track hackathons, teams, and progress

### For Organizations
- 📋 **Hackathon Management** - Create and manage hackathons
- ⚙️ **Customizable Settings** - Prizes, judging criteria, security rules
- 📈 **Live Monitoring** - Real-time participant monitoring
- 🎯 **Judging Interface** - Score submissions with detailed criteria

### For Contributors/Investors
- 🛒 **Project Marketplace** - Discover hackathon projects
- 💰 **Investment Opportunities** - Connect with winning teams
- 📬 **Direct Messaging** - Contact project owners

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **Real-time**: Socket.io (optional)
- **UI Components**: Custom components with Framer Motion

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (free tier available)

### Step 1: Clone and Install

```bash
cd hackshield-portal
npm install
```

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root directory (copy from `.env.example`)
2. Update the following variables:

```env
# MongoDB - Get from https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/hackshield

# NextAuth - Generate a random secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# JWT Secret
JWT_SECRET=your-jwt-secret-here
```

### Step 3: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get your connection string
6. Replace the placeholder in `.env.local`

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hackshield-portal/
├── app/
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── hackathons/      # Hackathon CRUD
│   │   ├── teams/           # Team management
│   │   ├── projects/        # Project marketplace
│   │   └── notifications/   # Notification system
│   ├── auth/                 # Auth pages (login, register)
│   ├── dashboard/            # Protected dashboard pages
│   │   ├── hackathons/      # Hackathon browsing & creation
│   │   ├── teams/           # Team management
│   │   ├── ide/             # Lockdown IDE
│   │   ├── projects/        # Project marketplace
│   │   └── notifications/   # Notifications
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── providers.tsx         # Context providers
├── components/
│   └── dashboard/            # Dashboard components
├── lib/
│   ├── auth/                 # Auth configuration
│   └── db/                   # Database models
├── types/                    # TypeScript types
├── middleware.ts             # Auth middleware
├── tailwind.config.js        # Tailwind configuration
└── package.json
```

## 🎮 User Roles

### Participant
- Browse and join hackathons
- Create/join teams
- Access Lockdown IDE during hackathons
- Submit projects
- View leaderboards and achievements

### Organization
- Create and manage hackathons
- Set prizes, rules, and judging criteria
- Monitor participants in real-time
- Judge submissions
- Announce winners

### Contributor/Investor
- Browse project marketplace
- View project details and demos
- Contact teams for investment
- Track interested projects

## 🔐 Security Features

- **Lockdown Mode**: Secure coding environment
- **Tab Switch Detection**: Monitors participant focus
- **Fullscreen Enforcement**: Required during hackathons
- **Code Recording**: All changes are logged
- **Plagiarism Detection**: Check for code similarity

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
npm run build
```

### Docker

```bash
docker build -t hackshield-portal .
docker run -p 3000:3000 hackshield-portal
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Hackathons
- `GET /api/hackathons` - List hackathons
- `POST /api/hackathons` - Create hackathon (org only)
- `GET /api/hackathons/:id` - Get hackathon details
- `PUT /api/hackathons/:id` - Update hackathon
- `DELETE /api/hackathons/:id` - Delete hackathon

### Teams
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/join` - Join team with code
- `POST /api/teams/:id/leave` - Leave team

### Projects
- `GET /api/projects` - List marketplace projects
- `POST /api/projects` - Create project

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/read-all` - Mark all as read

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use for your hackathon!

## 🆘 Support

For issues or questions:
- Create a GitHub issue
- Contact: support@hackshield.io

---

Built with ❤️ for hackathon enthusiasts
