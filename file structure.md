my-app/
├── public/ # Static assets (served as-is)
│ └── favicon.svg
│
├── src/
│ ├── assets/ # Images, fonts, icons
│ ├── components/ # Reusable UI components
│ │ ├── Button/
│ │ │ ├── Button.tsx
│ │ │ ├── Button.module.css
│ │ │ └── Button.types.ts
│ │ └── index.ts
│ │
│ ├── features/ # Feature-based modules (recommended for scaling)
│ │ ├── auth/
│ │ │ ├── api.ts
│ │ │ ├── authSlice.ts
│ │ │ ├── AuthPage.tsx
│ │ │ └── types.ts
│ │ └── dashboard/
│ │
│ ├── hooks/ # Custom React hooks
│ │ └── useAuth.ts
│ │
│ ├── layouts/ # Layout components (e.g., Navbar, Sidebar)
│ │ └── MainLayout.tsx
│ │
│ ├── pages/ # Route-level pages (if using routing)
│ │ ├── Home.tsx
│ │ └── Login.tsx
│ │
│ ├── services/ # API calls, external services
│ │ └── apiClient.ts
│ │
│ ├── store/ # Global state (Redux/Zustand/etc.)
│ │ └── index.ts
│ │
│ ├── styles/ # Global styles, variables
│ │ └── global.css
│ │
│ ├── utils/ # Helper functions
│ │ └── formatDate.ts
│ │
│ ├── types/ # Global TypeScript types/interfaces
│ │ └── index.ts
│ │
│ ├── App.tsx # Root component
│ ├── main.tsx # Entry point (Vite bootstraps here)
│ └── vite-env.d.ts # Vite TS types
│
├── .env # Environment variables
├── .gitignore
├── index.html # Root HTML (Vite entry)
├── tsconfig.json
├── vite.config.ts
└── package.json
