import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  prompt: "",
  generationType: "content",
};

const pendingPromptSlice = createSlice({
  name: "pendingPrompt",
  initialState,
  reducers: {
    setPendingPrompt: (state, action) => {
      state.prompt = action.payload.prompt || "";
      state.generationType = action.payload.generationType || "content";
      // optional backup
      localStorage.setItem("pendingPrompt", JSON.stringify(state));
    },
    clearPendingPrompt: (state) => {
      state.prompt = "";
      state.generationType = "content";
      localStorage.removeItem("pendingPrompt");
    },
    hydratePendingPrompt: (state) => {
      const raw = localStorage.getItem("pendingPrompt");
      if (raw) {
        const data = JSON.parse(raw);
        state.prompt = data.prompt || "";
        state.generationType = data.generationType || "content";
      }
    },
  },
});

export const { setPendingPrompt, clearPendingPrompt, hydratePendingPrompt } =
  pendingPromptSlice.actions;

export default pendingPromptSlice.reducer;
