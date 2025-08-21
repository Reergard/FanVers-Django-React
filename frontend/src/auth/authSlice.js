import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from './authService';

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
    user: user ? user : null,
    userInfo: {},
    isAuthenticated: !!user,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

// Register user
export const register = createAsyncThunk(
    "auth/register",
    async (userData, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Login user
export const login = createAsyncThunk(
    "auth/login",
    async (userData, thunkAPI) => {
        try {
            return await authService.login(userData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Logout
export const logout = createAsyncThunk(
    "auth/logout",
    async () => {
        authService.logout();
    }
);

// Activate user
export const activate = createAsyncThunk(
    "auth/activate",
    async (userData, thunkAPI) => {
        try {
            return await authService.activate(userData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Reset Password
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (userData, thunkAPI) => {
        try {
            return await authService.resetPassword(userData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Reset Password Confirm
export const resetPasswordConfirm = createAsyncThunk(
    "auth/resetPasswordConfirm",
    async (userData, thunkAPI) => {
        try {
            return await authService.resetPasswordConfirm(userData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get Profile
export const getProfile = createAsyncThunk(
    "auth/getProfile",
    async (_, thunkAPI) => {
        try {
            return await authService.getProfile();
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    },
    {
        condition: (_, { getState }) => {
            const { auth } = getState();
            // не звати, якщо вже завантажуємо або профіль є
            return !auth.isLoading && (!auth.userInfo || Object.keys(auth.userInfo).length === 0);
        }
    }
);

// Update Profile
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (profileData, thunkAPI) => {
        try {
            return await authService.updateProfile(profileData);
        } catch (error) {
            const message = (error.response && error.response.data
                && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        // Новий reducer для force logout
        forceLogout: (state) => {
            state.user = null;
            state.userInfo = {};
            state.isAuthenticated = false;
            state.isError = false;
            state.isSuccess = false;
            state.isLoading = false;
            state.message = "";
        },
        // Очищення помилок
        clearErrors: (state) => {
            state.isError = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAuthenticated = true;
                state.user = {
                    token: action.payload.access
                };
                // НЕ встановлюємо userInfo тут - він буде завантажений через getProfile
                localStorage.setItem("token", action.payload.access);
                localStorage.setItem("refresh", action.payload.refresh);
                localStorage.setItem("user", JSON.stringify({
                    token: action.payload.access
                }));
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.isAuthenticated = false;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.userInfo = {};
                state.isAuthenticated = false;
                state.isError = false;
                state.isSuccess = false;
                state.isLoading = false;
                state.message = "";
            })
            .addCase(activate.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(activate.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(activate.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(resetPasswordConfirm.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(resetPasswordConfirm.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(resetPasswordConfirm.rejected, (state, action) => {
                state.isLoading = false;
                state.isSuccess = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
            })
            .addCase(getProfile.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.userInfo = action.payload;
                state.user = {
                    token: state.user?.token,
                    ...action.payload
                };
                // Встановлюємо isAuthenticated тільки після успішного завантаження профілю
                state.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify({
                    token: state.user?.token,
                    ...action.payload
                }));
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                // НЕ скидаємо isAuthenticated тут - можливо це тимчасова помилка
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.userInfo = action.payload;
            });
    }
});

export const { reset, setIsAuthenticated, forceLogout, clearErrors } = authSlice.actions;

export default authSlice.reducer;
