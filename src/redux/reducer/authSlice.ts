import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { updateUser, User, userUpdate } from '../../models/User';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null; // Clear user info on logout
    },
    checkAuthStatus(state, action) {
      state.isAuthenticated = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.avatarUrl = action.payload;
      }
    },
    updateCover(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.coverUrl = action.payload;
      }
    },
    updateInformation(state, action: PayloadAction<updateUser>) {
      // change firstName, lastName, middleName, birthDay, provinces, districts, wards, hamlet.
      if (state.user) {
        state.user.firstName = action.payload.firstName;
        state.user.lastName = action.payload.lastName;
        state.user.middleName = action.payload.middleName;
        state.user.addressElements = action.payload.addressElement;
        state.user.birthday = action.payload.birthday;
        state.user.provinces = action.payload.province;
        state.user.districts = action.payload.district;
        state.user.wards = action.payload.ward;
        state.user.hamlet = action.payload.hamlet;
        state.user.phone = action.payload.phone;
        state.user.avatarUrl = action.payload.avatarUrl;
        state.user.coverUrl = action.payload.coverUrl;
      }
    }
  }
});

export const { login, logout, checkAuthStatus, setAuthLoading, setUser, updateAvatar, updateCover, updateInformation } = authSlice.actions;
export default authSlice.reducer;