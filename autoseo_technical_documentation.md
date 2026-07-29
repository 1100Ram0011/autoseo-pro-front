# Auto SEO Pro - Official Technical Documentation

<br>

> [!IMPORTANT]  
> This is the complete, professional, and detailed technical documentation for **Auto SEO Pro**. It covers the entire architecture, technology stack, database schema, and core business workflows of the platform.

---

## 1. Executive Summary
**Auto SEO Pro** is an automated, AI-driven SEO platform designed to simplify website optimization, lead generation, and technical SEO analysis. The platform operates on a "plug-and-play" model where users provide a URL, and the system automatically audits the site, fixes issues, writes SEO-optimized content, and generates local leads (Google Maps & LinkedIn) using background workers.

---

## 2. Technology Stack

### Frontend (Client App)
- **Framework:** Next.js 15 (App Router)
- **Authentication:** NextAuth.js
- **State Management & Fetching:** SWR (Stale-While-Revalidate) & Axios

### Backend (API & Workers)
- **Framework:** Node.js with Express.js (TypeScript)
- **Database:** PostgreSQL (managed via Prisma ORM)
- **Job Queues:** Redis + BullMQ
- **Scraping/Crawling:** Apify, Puppeteer, Firecrawl API
- **AI Integrations:** Google Generative AI (`@google/genai`)

---

## 3. Database Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ SITE : owns
    USER ||--o{ MAP_LEAD : generates
    USER ||--o{ LINKEDIN_LEAD : tracks

    SITE ||--o{ PAGE : contains
    SITE ||--o{ KEYWORD : ranks_for
    SITE ||--o{ BLOG : publishes
    SITE ||--o{ AI_ANOMALY : has
    SITE ||--o{ AUTO_SEO_REPORT : generates
    SITE ||--o{ GMB_PROFILE : manages

    AI_ANOMALY ||--o{ AI_ACTION : recommends

    MAP_LEAD ||--o| LINKEDIN_LEAD : enriches
    LINKEDIN_LEAD ||--o{ LINKEDIN_EMPLOYEE : extracts

    USER {
        string id PK
        string email UK
        string planId
    }
    
    SITE {
        string id PK
        string url
        string userId FK
    }

    MAP_LEAD {
        string id PK
        string name
        string placeId
    }
```

---

## 4. Comprehensive Feature Flows (Step-by-Step Diagrams)

Below are the exact execution sequences for **EVERY major feature** inside Auto SEO Pro.

### Flow 1: Firecrawl & AI Site Auditing (Technical SEO)
When a user adds a new site or requests an audit, Firecrawl scrapes the site, and Google AI generates a report.

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Frontend (SWR)
    participant API as Express API
    participant BullMQ as Firecrawl Queue
    participant Firecrawl as Firecrawl.dev
    participant AI as Google GenAI
    participant DB as Postgres

    User->>NextJS: Clicks "Audit Site"
    NextJS->>API: POST /api/seo/audit { siteId, url }
    API->>BullMQ: Add Job (firecrawlQueue)
    API-->>NextJS: Status: "InProgress"
    
    BullMQ->>Firecrawl: Scrape URL content
    Firecrawl-->>BullMQ: Returns Website Markdown / HTML
    BullMQ->>AI: Send Markdown + Prompt (Analyze SEO)
    AI-->>BullMQ: Returns JSON Report (Issues & Fixes)
    BullMQ->>DB: Save to `AutoSeoReport` & Create `AiAnomaly`
    
    NextJS->>API: Polls for updates
    API-->>NextJS: Status: "Completed" + Report Data
    NextJS-->>User: Renders Audit Dashboard
```

### Flow 2: Google Business Profile & Review Auto-Reply
Managing local reputation via Google APIs.

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant API
    participant GoogleAPI as Google Business API
    participant AI as Google GenAI
    participant DB

    User->>NextJS: Syncs GMB Account
    NextJS->>API: GET /api/gmb/sync
    API->>GoogleAPI: Fetch Locations & Reviews
    GoogleAPI-->>API: Returns Reviews List
    API->>DB: Save/Update `GMBProfile` & `GMBReview`
    
    User->>NextJS: Clicks "Auto Reply via AI" on 1-Star Review
    NextJS->>API: POST /api/gmb/reply { reviewId }
    API->>DB: Fetch Review details
    API->>AI: Prompt: "Draft polite apology for this review..."
    AI-->>API: Generated Reply Text
    
    API->>GoogleAPI: POST Reply to Google
    GoogleAPI-->>API: Success
    API->>DB: Update `isReplied = true`
    API-->>NextJS: Reply Posted!
```

### Flow 3: AI Content & Blog Generation
Writing SEO-optimized content automatically and publishing it.

```mermaid
sequenceDiagram
    participant User
    participant NextJS
    participant API
    participant GoogleAPI as Google Search Console
    participant AI as Google GenAI
    participant DB

    User->>NextJS: Clicks "Write Blog on: Best Plumbers"
    NextJS->>API: POST /api/blog/generate
    
    API->>GoogleAPI: Fetch current ranking keywords (Optional)
    API->>AI: Prompt: "Write 1500-word SEO blog targeting Best Plumbers"
    AI-->>API: Returns HTML/Markdown Content
    
    API->>DB: Save to `Blog` Table
    API-->>NextJS: Returns Generated Blog
    
    User->>NextJS: Clicks "Publish & Index"
    NextJS->>API: POST /api/indexing/publish
    API->>GoogleAPI: Ping Google Indexing API (URL Updated)
    API->>DB: Update `Page` indexingStatus to 'Submitted'
    API-->>NextJS: Success
```

### Flow 4: Map Leads & LinkedIn Enrichment (B2B Lead Gen)
The most complex background job flow in the system. Scraping Google Maps, finding the company on LinkedIn, and extracting employee emails.

```mermaid
stateDiagram-v2
    [*] --> Map_Scrape : User Enters "Plumbers in Delhi"
    
    state Map_Scrape {
        [*] --> GoogleMapsAPI : Search Query
        GoogleMapsAPI --> DB_MapLead : Save Basic Info (Name, Phone)
    }
    
    Map_Scrape --> Validation : WhatsApp Check
    state Validation {
        DB_MapLead --> WhatsApp_API : Validate Phone Number
        WhatsApp_API --> DB_MapLead : Mark isWhatsAppNumber (True/False)
    }
    
    Validation --> Enrichment : User Clicks "Find Employees"
    
    state Enrichment {
        [*] --> Apify_Queue : Add LinkedIn Job
        Apify_Queue --> Scrape_Company : Find LinkedIn URL
        Scrape_Company --> Scrape_Employees : Extract Profiles & Emails
        Scrape_Employees --> DB_LinkedinLead : Save Employees
    }
    
    Enrichment --> [*] : Data Available in UI via SWR
```

### Flow 5: Nightly Monitoring (CRON Jobs)
How the system tracks rank drops automatically while the user is asleep.

```mermaid
sequenceDiagram
    participant Cron as node-cron (Scheduler)
    participant API as Worker Process
    participant GSC as Google Search Console
    participant DB as Postgres

    Cron->>API: Triggers Daily at 00:00 (nightlyMonitor)
    API->>DB: Fetch all active `Site`s
    
    loop For Every Site
        API->>GSC: Fetch Yesterday's Clicks/Impressions
        GSC-->>API: Returns Data
        
        alt Traffic Drop > 15%
            API->>DB: Create `AiAnomaly` (type: TRAFFIC_DROP)
            API->>DB: Create `Alert` for User
        end
        
        API->>DB: Update `Keyword` positions
    end
```

---

## 5. System Architecture & Queue Processing

Because scraping LinkedIn or running a Lighthouse audit takes time, the system relies on an asynchronous queue pattern:

```mermaid
graph TD
    subgraph Express API Server
        Endpoint[Route Handlers]
        BullMQ_Publisher[BullMQ Add Job]
    end

    subgraph Redis Cache
        Queue[(Job Queue)]
    end

    subgraph Background Workers (Processor)
        W_LinkedIn[LinkedIn Apify Worker]
        W_Map[Google Maps Worker]
        W_WA[WhatsApp Validation Worker]
        W_Fire[Firecrawl Audit Worker]
    end

    Endpoint --> |Push| BullMQ_Publisher
    BullMQ_Publisher --> |Enqueue| Queue
    Queue --> |Consume| W_LinkedIn & W_Map & W_WA & W_Fire
```

---

## 6. Next Steps & Scaling
- Because workers are decoupled via Redis, you can scale the `backend` horizontally by adding more Node.js instances just to process jobs faster.
- SWR on the frontend ensures that even with hundreds of leads loading, the UI remains snappy and caches aggressively without refreshing the page.
