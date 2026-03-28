# UI Mockups

## Screen Designs

### 1. Welcome / Auth Screen

```
┌─────────────────────────────────────┐
│                                     │
│           ┌─────────┐               │
│           │  📱    │               │
│           │ LOGO   │               │
│           └─────────┘               │
│                                     │
│         Permaweb Mobile             │
│     Your AI Coding Assistant        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Connect with Wander      │   │
│   │   🔗 Arweave Wallet         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Connect with MetaMask     │   │
│   │   🦊 Ethereum Wallet         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │   Connect with WalletConnect│   │
│   │   📲 Any Wallet              │   │
│   └─────────────────────────────┘   │
│                                     │
│          ─────────────              │
│          Or continue as            │
│         ┌─────────────┐            │
│         │   Guest     │            │
│         └─────────────┘            │
│                                     │
└─────────────────────────────────────┘
```

**Design Notes:**
- Clean, minimal design
- Large touch targets for mobile
- Clear wallet options
- Option for guest mode (limited features)

---

### 2. Home / Pod List Screen

```
┌─────────────────────────────────────┐
│ ☰              Permaweb      🔔    │
│                                     │
│   Your Coding Pods                  │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🟢 my-project               │   │
│   │    React + TypeScript       │   │
│   │    Last active: 2 min ago   │   │
│   │    ─────────────────────    │   │
│   │    Files: 23  │  Sessions: 5 │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 🟡 api-server               │   │
│   │    Node.js + Express        │   │
│   │    Last active: 1 hour ago  │   │
│   │    ─────────────────────    │   │
│   │    Files: 15  │  Sessions: 12│   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ ⚪ experiment                 │   │
│   │    Python + FastAPI          │   │
│   │    Last active: 3 days ago  │   │
│   │    ─────────────────────    │   │
│   │    Files: 8   │  Sessions: 2  │   │
│   └─────────────────────────────┘   │
│                                     │
│         ┌─────────────┐              │
│         │  + New Pod  │              │
│         └─────────────┘              │
│                                     │
├─────────────────────────────────────┤
│  🏠 Home  │  📂 Files │  ⚙️ Settings │
└─────────────────────────────────────┘
```

**Design Notes:**
- Status indicators (🟢 active, 🟡 sleeping, ⚪ inactive)
- Quick stats per pod
- FAB for creating new pods
- Bottom navigation

---

### 3. Coding Session Screen (Main)

```
┌─────────────────────────────────────┐
│ ← my-project              ⋯        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Chat                        │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 🤖 How can I help you   │ │   │
│   │ │    today?               │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 👤 Create a React       │ │   │
│   │ │    component for...     │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   │ ┌─────────────────────────┐ │   │
│   │ │ 🤖 I'll create that     │ │   │
│   │ │    component. Let me   │ │   │
│   │ │    write the code...   │ │   │
│   │ │    ─────────────────── │ │   │
│   │ │    ```tsx              │ │   │
│   │ │    export function...   │ │   │
│   │ │    ```                 │ │   │
│   │ └─────────────────────────┘ │   │
│   │                             │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ Type a message...      📎 🚀 │   │
│   └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  💬 Chat │ 📝 Editor │ 📂 Files │ 💻 │
└─────────────────────────────────────┘
```

**Design Notes:**
- Chat-first interface
- Code blocks with syntax highlighting
- Attachment and send buttons
- Tab navigation for Chat/Editor/Files/Terminal

---

### 4. Code Editor Screen

```
┌─────────────────────────────────────┐
│ ← src/App.tsx           💾  ⋯      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 1│ import React from 'react';│  │
│   │ 2│ import { View } from '...';│  │
│   │ 3│                            │  │
│   │ 4│ export function App() {   │  │
│   │ 5│   return (                │  │
│   │ 6│     <View style={...}>    │  │
│   │ 7│       <Header />          │  │
│   │ 8│       <Content />         │  │
│   │ 9│     </View>               │  │
│   │10│   );                      │  │
│   │11│ }                         │  │
│   │12│                            │  │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ AI Assistant                │   │
│   │ ┌───────────────────────────┐│   │
│   │ │ 🔧 I've optimized your   ││   │
│   │ │    component by...        ││   │
│   │ └───────────────────────────┘│   │
│   │ [Apply] [Dismiss]            │   │
│   └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  💬 Chat │ 📝 Editor │ 📂 Files │ 💻 │
└─────────────────────────────────────┘
```

**Design Notes:**
- Syntax-highlighted code editor
- Line numbers
- AI suggestions panel at bottom
- Quick apply/dismiss actions
- Swipe between files

---

### 5. File Browser Screen

```
┌─────────────────────────────────────┐
│ ← Workspace              🔍  +      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ 📁 src/                 ↓   │   │
│   │   ├── 📁 components/        │   │
│   │   │   ├── 📄 Header.tsx     │   │
│   │   │   ├── 📄 Footer.tsx     │   │
│   │   │   └── 📄 Button.tsx     │   │
│   │   ├── 📁 hooks/             │   │
│   │   │   └── 📄 useAuth.ts     │   │
│   │   ├── 📄 App.tsx            │   │
│   │   └── 📄 index.ts           │   │
│   │                              │   │
│   │ 📁 public/                   │   │
│   │ 📁 node_modules/             │   │
│   │ 📄 package.json             │   │
│   │ 📄 tsconfig.json            │   │
│   │ 📄 README.md                │   │
│   └─────────────────────────────┘   │
│                                     │
│   Pull to refresh                   │
│   Long press for options            │
│                                     │
├─────────────────────────────────────┤
│  💬 Chat │ 📝 Editor │ 📂 Files │ 💻 │
└─────────────────────────────────────┘
```

**Design Notes:**
- Tree structure navigation
- Pull to refresh
- Long press for context menu (rename, delete, etc.)
- Swipe left/right for actions

---

### 6. Terminal Screen

```
┌─────────────────────────────────────┐
│ ← Terminal                ⚡  ⋯      │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ $ npm run dev               │   │
│   │ > Starting development...   │   │
│   │ > Server running on :3000   │   │
│   │                             │   │
│   │ $ git status                │   │
│   │ On branch main              │   │
│   │ Changes not staged:         │   │
│   │   modified: src/App.tsx     │   │
│   │                             │   │
│   │ $ _                         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ $ _________________    ▶   │   │
│   └─────────────────────────────┘   │
│                                     │
│   Quick commands:                   │
│   [npm run] [git status] [clear]   │
│                                     │
├─────────────────────────────────────┤
│  💬 Chat │ 📝 Editor │ 📂 Files │ 💻 │
└─────────────────────────────────────┘
```

**Design Notes:**
- Dark terminal theme
- Quick command buttons
- Input field at bottom
- Scrollable output

---

## Design System

### Colors

```
Primary:    #6366F1 (Indigo)
Secondary:  #8B5CF6 (Purple)
Success:    #10B981 (Green)
Warning:    #F59E0B (Amber)
Error:      #EF4444 (Red)
Background: #0F172A (Dark)
Surface:    #1E293B (Dark Surface)
Text:       #F8FAFC (Light)
TextMuted:  #94A3B8 (Gray)
```

### Typography

```
Heading:    Inter Bold
Body:       Inter Regular
Code:       JetBrains Mono
```

### Spacing

```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
```

### Components

- **Button**: Rounded corners, filled background
- **Card**: Elevated surface with border
- **Input**: Underline style, clean
- **List Item**: Left icon, title, subtitle, right action
- **Modal**: Full-screen on mobile
- **Tab Bar**: Bottom navigation with icons

## Getting Professional Mockups

For high-fidelity mockups, consider:

1. **Figma** - Free for personal use
2. **ram.zenbin.org** - AI-powered design generation
3. **Dribbble** - Hire designers
4. **Fiverr/Upwork** - Freelance designers

### Prompt for ram.zenbin.org

```
Create a mobile app UI design for "Permaweb Mobile":

1. Auth screen with wallet connection options (Arweave, Ethereum, WalletConnect)
2. Home screen showing list of coding pods with status indicators
3. Chat interface for AI coding assistant
4. Code editor screen with syntax highlighting
5. File browser with tree navigation
6. Terminal screen for command line access

Style: Dark mode, modern, clean, developer-focused
Colors: Indigo primary (#6366F1), dark background (#0F172A)
Typography: Inter for UI, JetBrains Mono for code
```