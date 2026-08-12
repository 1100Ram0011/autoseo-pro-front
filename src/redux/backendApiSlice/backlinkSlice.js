

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* ─── Cache helpers (localStorage, 30 min TTL) ─── */
const CACHE_TTL = 30 * 60 * 1000;
const cacheKey  = (d) => `bl_v2_${d}`;

const cacheLoad = (domain) => {
  try {
    const raw = localStorage.getItem(cacheKey(domain));
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (Date.now() - p.savedAt > CACHE_TTL) { localStorage.removeItem(cacheKey(domain)); return null; }
    return p;
  } catch { return null; }
};

const cacheSave = (domain, payload) => {
  try { localStorage.setItem(cacheKey(domain), JSON.stringify({ ...payload, savedAt: Date.now() })); }
  catch { /* storage full */ }
};

/* ─────────────────────────────────────────────────
   THUNK — fetches ALL data in ONE API call
   Backend scrapes once, returns all rows.
   Frontend paginates locally — zero re-scraping.
───────────────────────────────────────────────── */
export const fetchAllBacklinksThunk = createAsyncThunk(
  "backlinks/fetchAll",
  async ({ domain }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))}/api/backlinks?domain=${encodeURIComponent(domain)}&page=1&limit=500`
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      return { ...json, domain };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ─── Slice ─── */
const backlinkSlice = createSlice({
  name: "backlinks",
  initialState: {
    domain:      "",
    allData:     [],
    total:       0,
    authority:   null,
    currentPage: 1,
    pageSize:    20,
    loading:     false,
    error:       null,
    searched:    false,
    fromCache:   false,
    
  },

  reducers: {
    setDomain(state, action)      { state.domain = action.payload; },
    setCurrentPage(state, action) { state.currentPage = action.payload; },
    

    resetBacklinks(state) {
      state.allData     = [];
      state.total       = 0;
      state.authority   = null;
      state.currentPage = 1;
      state.error       = null;
      state.searched    = false;
      state.fromCache   = false;
      state.toast       = null;
    },

    hydrateFromCache(state, action) {
      const cached = cacheLoad(action.payload);
      if (!cached) return;
      state.allData   = cached.allData   ?? [];
      state.total     = cached.total     ?? 0;
      state.authority = cached.authority ?? null;
      state.searched  = true;
      state.fromCache = true;
      state.domain    = action.payload;
      state.toast     = {
        type: "success",
        message: `Loaded ${cached.allData?.length ?? 0} cached backlinks for ${action.payload}`,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBacklinksThunk.pending, (state) => {
        state.loading     = true;
        state.error       = null;
        state.toast       = null;
        state.fromCache   = false;
        state.currentPage = 1;
        state.allData     = [];
      })
      .addCase(fetchAllBacklinksThunk.fulfilled, (state, action) => {
        state.loading  = false;
        state.searched = true;

        const rows      = action.payload.backlinks       ?? [];
        const total     = action.payload.total_backlinks ?? rows.length;
        const authority = action.payload.authority       ?? null;
        const domain    = action.payload.domain;

        state.domain    = domain;
        state.allData   = rows;
        state.total     = total;
        state.authority = authority;

        if (rows.length > 0) {
          state.toast = { type: "success", message: `✓ Found ${total} backlinks for ${domain}` };
          cacheSave(domain, { allData: rows, total, authority });
        } else {
         state.toast = {
          type: "info",
          message: `No backlinks found for ${domain}`
        };
        }
      })
      .addCase(fetchAllBacklinksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
        state.toast   = { type: "error", message: `Scrape failed: ${action.payload}` };
      });
  },
});

export const {
  setDomain, setCurrentPage, resetBacklinks, hydrateFromCache,
} = backlinkSlice.actions;

export default backlinkSlice.reducer;