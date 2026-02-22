import { createSlice } from "@reduxjs/toolkit";
const userSlices = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    addUser(state, action) {
      return action.payload;
    },
    logout: () => {
      return null;
    },
  },
});
export const { addUser, logout } = userSlices.actions;
export default userSlices.reducer;
// store/slices/UserSlices.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // Async thunk to fetch current user
// export const fetchCurrentUser = createAsyncThunk(
//   "user/fetchCurrentUser",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axios.get("http://localhost:3000/api/auth/getMe", {
//         withCredentials: true, // send cookies
//       });
//       return res.data; // user object
//     } catch (err) {
//       return rejectWithValue(err.response?.data || { message: "Error" });
//     }
//   },
// );

// const userSlice = createSlice({
//   name: "user",
//   initialState: {
//     user: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     logout: (state) => {
//       state.user = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCurrentUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchCurrentUser.fulfilled, (state, action) => {
//         state.user = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchCurrentUser.rejected, (state, action) => {
//         state.user = null;
//         state.loading = false;
//         state.error = action.payload.message;
//       });
//   },
// });

// export const { logout } = userSlice.actions;
// export default userSlice.reducer;
