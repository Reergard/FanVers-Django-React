import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    hideAdultContent: localStorage.getItem('hideAdultContent') === 'true' || false
};

const userSettingsSlice = createSlice({
    name: 'userSettings',
    initialState,
    reducers: {
        setHideAdultContent: (state, action) => {
            state.hideAdultContent = action.payload;
            localStorage.setItem('hideAdultContent', action.payload);
        }
    }
});

export const { setHideAdultContent } = userSettingsSlice.actions;
export default userSettingsSlice.reducer;