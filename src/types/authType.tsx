export type RootState = {
  auth: {
    user: {};
    error: string;
    token: string;
  };
};

export type loginUser = {
  email: string;
  password: string;
};

export type registerUser = {
  username: string;
  email: string;
  password: string;
};
