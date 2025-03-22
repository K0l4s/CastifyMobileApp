import { createSlice } from '@reduxjs/toolkit';

interface notificationState {
    totalUnRead:number
}

const initialState: notificationState = {
    totalUnRead: 0
};

const sidebarSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setTotalUnRead: (state, action) => {
        state.totalUnRead = action.payload
    },
    addNewTotalUnRead: (state) => {
        state.totalUnRead += 1
    },
    removeTotalUnRead: (state) => {
        state.totalUnRead -= 1
    },
    makeAllAsRead: (state) => {
        state.totalUnRead = 0
    }
  },
});

export const { setTotalUnRead,addNewTotalUnRead,removeTotalUnRead,makeAllAsRead } = sidebarSlice.actions;
export default sidebarSlice.reducer;