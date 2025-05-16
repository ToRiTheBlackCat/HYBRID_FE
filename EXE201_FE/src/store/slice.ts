import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { ConjunctionState, Entry } from '../types/index';

const initialState: ConjunctionState = {
  activityName: '',
  entries: [],
};

const conjunctionSlice = createSlice({
  name: 'conjunction',
  initialState,
  reducers: {
    setActivityName: (state, action: PayloadAction<string>) => {
      state.activityName = action.payload;
    },
    setEntries: (state, action: PayloadAction<Entry[]>) => {
      state.entries = action.payload;
    },
    reset: (state) => {
      state.activityName = '';
      state.entries = [];
    },
  },
});

export const { setActivityName, setEntries, reset } = conjunctionSlice.actions;    
export default conjunctionSlice.reducer;