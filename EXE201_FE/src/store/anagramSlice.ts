import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { AnagramState, Words } from '../types/index';

const initialState: AnagramState = {
  activityName: '',
  words: [],
};

const anagramSlice = createSlice({
    name: 'anagram',
    initialState,
    reducers: {
        setActivityName: (state, action: PayloadAction<string>) => {
            state.activityName = action.payload;
        },
        setWords: (state, action: PayloadAction<Words>) => {
            state.words = action.payload.words;
        },
        reset: (state) => {
            state.activityName = '';
            state.words = [];
        },
    },
})
export const { setActivityName, setWords, reset } = anagramSlice.actions;
export default anagramSlice.reducer;