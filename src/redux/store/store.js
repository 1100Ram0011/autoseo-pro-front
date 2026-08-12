import { configureStore, combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/redux/app/auth.slice'
import pendingPromptReducer from '@/redux/app/promptslice'
import creditModalReducer from '@/redux/app/creditModalSlice'
import individualFormReducer from '@/redux/app/individualFormSlice'
import businessFormReducer from '@/redux/app/businessFormSlice'
import adminOutreachReducer from '@/redux/app/adminOutreachSlice'
import whatsappSelectionReducer from '@/redux/app/whatsappSelectionSlice'
import googlemapReducer from '@/redux/app/googlemapSlice'
import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

import storage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'
import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'
import { analyticsApi } from '../apis/analytics.api'
import backlinkReducer from '@/redux/backendApiSlice/backlinkSlice'
import emailSelectionReducer from '@/redux/backendApiSlice/emailSelectionSlice'
import { googleMapApi } from '../apis/googlemap.api.js';
import { blogApi} from '../apis/blogApiSlice.js';

// ✅ Force clear stale persisted state
const PERSIST_VERSION = 'v4'
if (typeof window !== 'undefined') {
  if (localStorage.getItem('persist_version') !== PERSIST_VERSION) {
    localStorage.removeItem('persist:root')
    localStorage.setItem('persist_version', PERSIST_VERSION)
  }
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'pendingPrompt', 'businessForm', 'adminOutreach', 'whatsappSelection', 'googlemap'],
  stateReconciler: autoMergeLevel2,
}

const appReducer = combineReducers({
  auth: authReducer,
  pendingPrompt: pendingPromptReducer,
  creditModal: creditModalReducer,
  backlinks: backlinkReducer,
  emailSelection: emailSelectionReducer,
  individualForm: individualFormReducer,
  businessForm: businessFormReducer,
  adminOutreach: adminOutreachReducer,
  whatsappSelection: whatsappSelectionReducer,
  googlemap: googlemapReducer,

  [apiSlice.reducerPath]: apiSlice.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer, // ✅
  [googleMapApi.reducerPath]: googleMapApi.reducer,
  [blogApi.reducerPath]: blogApi.reducer,
})

const getAuthUserKey = (user) =>
  user?._id || user?.id || user?.email || user?.phone || null

const rootReducer = (state, action) => {
  if (action.type === 'auth/clearAuth') {
    return appReducer(
      {
        ...state,
        individualForm: undefined,
        [apiSlice.reducerPath]: undefined,
      },
      action
    )
  }

  if (action.type === 'auth/setAuth') {
    const currentUserKey = getAuthUserKey(state?.auth?.user)
    const nextUserKey = getAuthUserKey(action.payload?.user)
    const isDifferentUser =
      currentUserKey && nextUserKey && currentUserKey !== nextUserKey

    if (isDifferentUser) {
      return appReducer(
        {
          ...state,
          individualForm: undefined,
          [apiSlice.reducerPath]: undefined,
        },
        action
      )
    }
  }

  return appReducer(state, action)
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(
        apiSlice.middleware,
        analyticsApi.middleware,// ✅ REQUIRED
        googleMapApi.middleware,
        blogApi.middleware,
      ),
  devTools: true,
})

export const persistor = persistStore(store)