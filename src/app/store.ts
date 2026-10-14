import { configureStore } from '@reduxjs/toolkit'
import { pokeApi } from '../services/pokeApi.ts'

export const store = configureStore({
  reducer: {
    [pokeApi.reducerPath]: pokeApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokeApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
