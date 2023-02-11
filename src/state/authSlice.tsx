import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AppDispatch } from ".";
import { NEXT_URL } from "../config";
import { loginUser, registerUser } from "../types/authType";
// import { useRouter } from "next/router";

// export const fetchLoginApi = createAsyncThunk(
//   "auth/fetchLoginApi",
//   async ({ email: identifier, password }: loginUser) => {
//     const res = await fetch(`${NEXT_URL}/api/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         identifier,
//         password,
//       }),
//     });
//     const data = await res.json();
//     return data;
//   }
// );

const initialState = {
  user: null,
  error: null,
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
  // extraReducers: (builder) => {
  //   // Add reducers for additional action types here, and handle loading state as needed
  //   // fetchAllTodosというcreateAsyncThunkが正常終了した場合のReducer
  //   builder.addCase(fetchLoginApi.fulfilled, (state, action) => {
  //     // Add user to the state array
  //     // state.entities.push(action.payload);
  //     // handle data fetched successfully
  //     setUser(action.payload.user);
  //     setToken(action.payload.jwt);
  //     setError(null);
  //   });
  //   builder.addCase(fetchLoginApi.rejected, (state, action) => {
  //     setError(action.error.message);
  //   });
  // },
});

// export const LoginAndPushRoute =
//   ({ email: identifier, password }: loginUser) =>
//   async (dispatch: AppDispatch) => {
//     const router = useRouter();
//     dispatch(fetchLoginApi({ email: identifier, password }));
//     router.push("/");
//   };

export const logout = () => {
  return async (dispatch: AppDispatch) => {
    const res = await fetch(`${NEXT_URL}/api/logout`, {
      method: "POST",
    });
    const data = await res.json();
    if (res.ok) {
      dispatch(setUser(null));
      dispatch(setToken(null));
    } else {
      dispatch(setError(data.message));
      dispatch(setError(null));
    }
  };
};

// //Login user
export const login = ({ email: identifier, password }: loginUser) => {
  // const router = useRouter();
  return async (dispatch: AppDispatch) => {
    try {
      const res = await fetch(`${NEXT_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });
      const data = await res.json();
      // console.log(res.status);
      if (res.ok) {
        dispatch(setUser(data.user));
        dispatch(setToken(data.jwt));
        dispatch(setError(null));
      } else {
        dispatch(setError(data.message));
      }
    } catch (error) {
      dispatch(setError("Something wrong. Please try again."));
    }
  };
};

export const register = (user: registerUser) => {
  return async (dispatch: AppDispatch) => {
    const res = await fetch(`${NEXT_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (res.ok) {
      dispatch(setUser(data.user));
      dispatch(setToken(data.jwt));
      dispatch(setError(null));
    } else {
      dispatch(setError(data.message));
    }
  };
};

export const { setUser, setError, setToken } = authSlice.actions;

export const authReducer = authSlice.reducer;
