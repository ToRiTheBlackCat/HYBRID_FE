import { configureStore } from "@reduxjs/toolkit";
import sliceReducer from './slice';

export const store = configureStore({
    reducer: {
        conjunction: sliceReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;