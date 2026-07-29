# Auto SEO Pro - Architecture & Flow

Sorry for the confusion! Yeh document **Auto SEO Pro** project ke overall architecture, user journey, aur state management (Data Flow) ko explain karta hai.

---

## 1. User Journey & Authentication Flow (User Aayega Toh Kya Hoga)

**Auto SEO Pro** mein `NextAuth.js` ka use hua hai authentication ke liye.

```mermaid
sequenceDiagram
    actor User
    participant Frontend as AutoSEO Next.js App
    participant Auth as NextAuth.js (Session)
    participant Backend as Express API (Backend)

    User->>Frontend: Visits Website
    Frontend->>Auth: Checks Session (`useSession`)
    
    alt Not Logged In
        Auth-->>Frontend: Session = null
        Frontend-->>User: Shows Login / Google Sign-In
        User->>Auth: Authenticates via Google/Credentials
        Auth-->>Frontend: Returns User Session
        Frontend->>Frontend: Saves `user.email` in SessionStorage
    else Already Logged In
        Auth-->>Frontend: Valid Session Exists
    end

    Frontend-->>User: Redirect to Dashboard (/dashboard)
    User->>Frontend: Interacts with Dashboard (e.g. Map Leads)
    
    %% API Interception
    Frontend->>Frontend: Fetch Interceptor runs
    Frontend->>Frontend: Attaches `x-user-email` header
    Frontend->>Backend: API Request (e.g., GET /api/leads/map)
    Backend-->>Frontend: Returns JSON Data
    Frontend-->>User: UI updates with Data
```

---

## 2. State Management & Data Fetching

Is project mein **Redux ya Zustand ka use nahi hai**. Data fetching aur state management ke liye **SWR (Stale-While-Revalidate)** use kiya gaya hai. SWR APIs se data lata hai aur use locally cache kar leta hai.

```mermaid
graph TD
    subgraph Frontend [Next.js Client Components]
        
        subgraph GlobalProviders [Global Wrappers]
            P1[SessionProvider] --> |Provides user session| C
            P2[FetchInterceptor] --> |Injects Headers| C
        end

        subgraph Hooks [Custom SWR Hooks]
            H1[useLeads] --> |GET /api/leads/map| SWR1[SWR Cache]
            H2[useLinkedinLead] --> |GET /api/leads/linkedin/:id| SWR2[SWR Cache]
            H3[Other Hooks] --> |Other APIs| SWR3[SWR Cache]
        end

        C[UI Components] --> |Calls Hook| H1
        C --> |Calls Hook| H2
    end

    subgraph BackendAPI [External API Server]
        API1[Express.js Endpoints]
    end

    SWR1 <--> |Axios Requests| API1
    SWR2 <--> |Axios Requests| API1

    %% Styles
    classDef provider fill:#dbeafe,stroke:#2563eb,stroke-width:2px;
    classDef hook fill:#d1fae5,stroke:#059669,stroke-width:2px;
    classDef cache fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    class P1,P2 provider;
    class H1,H2 hook;
    class SWR1,SWR2,SWR3 cache;
```

### Key Highlights of Architecture:
1. **Next.js App Router:** Project latest App Router (`src/app`) use karta hai. UI server aur client components mein divided hai.
2. **SWR for State:** Redux ki jagah SWR ka cache as a global state kaam karta hai. Agar ek component data fetch karta hai, toh doosra component bina dobara API call kiye cache se data le sakta hai.
3. **Fetch Interceptor:** `Providers.tsx` mein ek custom fetch interceptor hai. Yeh har API call ko pakadta hai, SessionStorage se `user.email` nikalta hai, aur request ke headers mein `x-user-email` laga kar backend ko bhejta hai (For auth verification on backend).

---

## 3. Feature Flow Example: Generating Leads

Agar user "Generate Leads" par click karta hai toh under-the-hood kya hota hai:

```mermaid
flowchart LR
    A[User clicks 'Generate'] --> B[useMapLeads Hook]
    B -->|axios.post| C[Backend API /api/leads/map/generate]
    C -->|Starts Background Job| D[Queue/Worker]
    C -->|Returns Success| B
    B -->|mutate()| E[SWR re-fetches Data]
    E -->|Updates UI| F[User sees New Lead]
```

- Jab `mutate()` call hota hai, SWR background mein list ko dobara fetch karta hai aur UI ko instantly update karta hai bina page refresh kiye.
