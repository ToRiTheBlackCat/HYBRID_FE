import { configureStore } from "@reduxjs/toolkit";
import conjunctionSliceReducer from './slice';
import anagramSliceReducer from './anagramSlice';

export const store = configureStore({
    reducer: {
        conjunction: conjunctionSliceReducer,
        anagram: anagramSliceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;