# 🧠 TIL Log — Today I Learned

> A personal learning tracker powered by **Tambo AI's Generative UI**. Log what you learn every day, set goals, track streaks, and get AI-powered analytics and suggestions — all through natural conversation.

Built for the [**WeMakeDevs × Tambo "The UI Strikes Back" Hackathon**](https://www.wemakedevs.org/hackathons/tambo) (Feb 2–8, 2026).

---

## 🎯 Problem Statement

As developers, we learn something new every single day — a new API, a debugging trick, a design pattern. But most of it gets forgotten because we never write it down. Existing note-taking apps are too heavy for quick "today I learned" moments, and they don't help you see patterns in your learning or stay consistent.

**TIL Log** solves this by making it effortless to capture daily learnings through conversation with AI, while providing streak tracking, goal setting, and intelligent analytics to help you build a sustainable learning habit.

## Get Started

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TIL Log — App                           │
│                                                                 │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │              │     │           Tambo AI Engine             │  │
│  │   Chat       │     │                                      │  │
│  │   Panel      │────▶│  ┌─────────┐   ┌──────────────────┐ │  │
│  │              │     │  │ Intent  │   │ Component/Tool   │ │  │
│  │  (Message    │     │  │ Parser  │──▶│ Selector         │ │  │
│  │   Thread)    │     │  └─────────┘   └────────┬─────────┘ │  │
│  │              │     │                         │            │  │
│  └──────────────┘     └─────────────────────────┼────────────┘  │
│                                                 │               │
│                            ┌────────────────────┼──────┐        │
│                            │                    ▼      │        │
│                   ┌────────┴────────┐   ┌─────────────┐│        │
│                   │  Local Tools    │   │ Generative  ││        │
│                   │  (10 tools)     │   │ Components  ││        │
│                   │                 │   │ (7 comps)   ││        │
│                   │ • get-entries   │   │             ││        │
│                   │ • add-entry     │   │ • Dashboard ││        │
│                   │ • get-stats     │   │ • LogEntry  ││        │
│                   │ • add-goal      │   │   Card/Form ││        │
│                   │ • update-goal   │   │ • GoalCard  ││        │
│                   │ • delete-goal   │   │ • GoalForm  ││        │
│                   │ • search-tags   │   │ • Analytics ││        │
│                   │ • get-analytics │   │ • Suggest-  ││        │
│                   │ • clear-data    │   │   ions      ││        │
│                   └────────┬────────┘   └──────┬──────┘│        │
│                            │                   │       │        │
│                            ▼                   ▼       │        │
│  ┌──────────────────────────────────────────────────┐  │        │
│  │              Canvas (Drag & Drop)                │  │        │
│  │                                                  │  │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │        │
│  │  │Dashboard │ │GoalCard  │ │Analytics         │ │  │        │
│  │  │  ┌────┐  │ │ Progress │ │ ┌──────────────┐ │ │  │        │
│  │  │  │🔥 5│  │ │ ████░░░  │ │ │▓▓░░▓▓▓░▓▓▓▓ │ │ │  │        │
│  │  │  └────┘  │ │ 60%      │ │ │  Heatmap     │ │ │  │        │
│  │  │ Streak   │ │          │ │ └──────────────┘ │ │  │        │
│  │  └──────────┘ └──────────┘ └──────────────────┘ │  │        │
│  └──────────────────────────────────────────────────┘  │        │
│                            │                           │        │
│                            ▼                           │        │
│              ┌──────────────────────┐                  │        │
│              │   localStorage       │                  │        │
│              │                      │                  │        │
│              │ • til-log-entries     │                  │        │
│              │ • til-log-goals      │                  │        │
│              │ • tambo-canvas-state  │                  │        │
│              └──────────────────────┘                  │        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User types: "I learned about Docker volumes today"
  │
  ▼
Tambo AI parses intent → selects `add-learning-entry` tool
  │
  ▼
Tool runs: creates entry { content, tags: ["docker","volumes"], timestamp }
  │
  ▼
Entry saved to localStorage → TIL_STORE_CHANGED_EVENT emitted
  │
  ▼
Tambo renders LogEntryCard on canvas + Toast: "Entry saved! 🎉"
  │
  ▼
Dashboard / Analytics auto-refresh via event listener
```

---

## ✨ Features

### Core Features
- **📝 Log Learnings** — Quickly log what you learned with auto-detected tags and optional source links
- **🔥 Streak Tracking** — Build a daily learning habit with current streak and longest streak stats
- **🎯 Goal Setting** — Set learning goals with deadlines, target entry counts, and related tags to track progress
- **📊 Analytics Dashboard** — 28-day activity heatmap, weekly trends, topic distribution charts, and goal progress overview
- **💡 AI Suggestions** — Personalized recommendations based on your history, streak, and goals (streak reminders, goal nudges, topic diversity tips, review prompts)
- **🗑️ Data Management** — Clear all data to start fresh via UI button or AI chat command

### Tambo AI Integration
- **7 Generative UI Components** registered with Tambo — AI decides which to render based on conversation
- **10 Local Tools** — AI can read entries, create entries, manage goals, fetch analytics, and clear data
- **Canvas System** — Drag-and-drop components onto a canvas for custom dashboard layouts
- **Interactable Components** — Tabs and canvas details sync with AI state management

### How Tambo Is Used
| What You Say | What Tambo Renders |
|---|---|
| "I learned about React Server Components today" | Calls `add-learning-entry` tool → renders `LogEntryCard` |
| "Show me my dashboard" | Renders `Dashboard` component on canvas |
| "I want to set a goal to learn Kubernetes" | Renders `GoalForm` or calls `add-goal` tool → renders `GoalCard` |
| "Show my analytics" | Renders `Analytics` component with heatmap and charts |
| "What should I learn next?" | Renders `Suggestions` component with personalized tips |
| "Show my goals" | Calls `get-all-goals` → renders `GoalCard` for each |
| "How am I doing this week?" | Calls `get-analytics-summary` → responds with data insights |
| "Clear all my data" | Calls `clear-all-data` tool → resets everything |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework with App Router |
| **Tambo AI React SDK** | Generative UI — AI-driven component rendering |
| **TypeScript** | Type safety across the codebase |
| **Tailwind CSS 4** | Styling |
| **Zustand** | State management for canvas system |
| **Zod** | Schema validation for all data models and Tambo tool I/O |
| **Lucide React** | Icons |
| **@dnd-kit** | Drag-and-drop for canvas components |
| **localStorage** | Client-side data persistence |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with metadata
│   └── chat/page.tsx         # Main chat + canvas interface
├── components/
│   ├── til/                  # TIL-specific components
│   │   ├── LogEntryForm.tsx  # Form to log learnings (with toast)
│   │   ├── LogEntryCard.tsx  # Display a single entry
│   │   ├── GoalForm.tsx      # Form to create goals (with toast)
│   │   ├── GoalCard.tsx      # Display goal with progress bar
│   │   ├── Dashboard.tsx     # Stats, streaks, activity chart
│   │   ├── Analytics.tsx     # Heatmap, trends, topic charts
│   │   ├── Suggestions.tsx   # AI-powered learning suggestions
│   │   └── index.ts          # Barrel exports
│   ├── tambo/                # Tambo SDK chat components
│   └── ui/
│       ├── components-canvas.tsx  # Drag-and-drop canvas
│       └── toast.tsx              # Toast notification component
├── lib/
│   ├── tambo.ts              # Component + tool registrations
│   ├── store.ts              # localStorage CRUD + stats helpers
│   ├── canvas-storage.ts     # Canvas state (Zustand + persist)
│   └── ids.ts                # ID generation
├── types/
│   └── schemas.ts            # Zod schemas (LogEntry, Goal, etc.)
└── services/
    └── analytics-data.ts     # Analytics data utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Tambo API key ([get one here](https://tambo.co/cli-auth))

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/til-log.git
cd til-log

# Install dependencies
npm install

# Initialize Tambo (sets up API key in .env.local)
npx tambo init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Start Learning** to begin.

### Environment Variables

Create a `.env.local` file (or use `npx tambo init`):

```env
NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_api_key_here
```

---

## 📸 Screenshots

### Landing Page
The landing page explains what TIL Log does and how to get started.

### Chat + Canvas Interface
The main interface has a chat panel on the left where you talk to the AI, and a canvas on the right where components are rendered.

### Dashboard
Shows your streak, total entries, weekly activity bar chart, and top topics.

### Analytics
Detailed view with 28-day activity heatmap, weekly trend comparison, topic distribution bars, and goals progress.

### Suggestions
AI-generated personalized learning recommendations based on your patterns.

---

## 🏗️ Tambo Features Used

1. **Generative Components** (`TamboComponent[]`) — 7 components registered with schemas so the AI knows when and how to render each one
2. **Local Tools** (`TamboTool[]`) — 10 tools that let the AI read/write data, manage goals, and compute analytics
3. **Interactable Components** (`withInteractable`) — Canvas tabs and chart details sync bidirectionally with AI
4. **Canvas System** — Components auto-add to canvas with drag-and-drop reordering
5. **Component Schemas** (`propsSchema` with Zod) — Every component has a typed schema so the AI generates valid props
6. **Context Key Isolation** — Each browser session gets a unique context key for thread isolation
7. **MCP Integration** — MCP provider wraps the app for extensibility

---

## 📦 Data Storage

All data is stored in **browser `localStorage`**:

| Key | Content |
|---|---|
| `til-log-entries` | Array of learning log entries |
| `til-log-goals` | Array of learning goals |
| `tambo-canvas-storage` | Canvas layout and component positions |
| `tambo-demo-context-key` | Unique session identifier |

**To reset all data:**
- Click the **"Clear data"** button on the Dashboard (requires confirmation)
- Or tell the AI: *"Clear all my data"*
- Or in browser console: `localStorage.removeItem('til-log-entries'); localStorage.removeItem('til-log-goals');`

## 🤝 Contributing

This project was built for the WeMakeDevs × Tambo hackathon. Feel free to fork and extend!

---

## 📄 License

MIT

---

## 🙏 Acknowledgements

- [Tambo AI](https://tambo.co) — Generative UI SDK that powers the entire chat-to-component experience
- [WeMakeDevs](https://www.wemakedevs.org) — For organizing the hackathon
- [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Zustand](https://zustand-demo.pmnd.rs/), [Zod](https://zod.dev) — The amazing open source ecosystem