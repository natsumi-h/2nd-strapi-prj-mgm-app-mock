import { createContext, useEffect, ReactNode, FC, ReactElement } from "react";
import { useRouter } from "next/router";
import { NEXT_URL } from "../config/index";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { setUser, setError, setToken } from "../state/authSlice";
import { RootState } from "../state/authType";
import { AppDispatch } from "../state";

type Props = {
  // children?: ReactNode;
  children: ReactElement;
};

const AuthContext = createContext("dummy");

export const AuthProvider: FC<Props> = ({ children }) => {
  const resolvedUrl = children && children.props.resolvedUrl;

  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
  // 分割代入
  const { user, error } = useTypedSelector((state) => state.auth);

  //DOMになる瞬間（マウントされる瞬間）に、checkUserLoggedInの処理が走る
  useEffect(() => {
    dispatch(checkUserLoggedIn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // userが無効なら
    if (!user && resolvedUrl !== "/account/signup") {
      router.push("/account/login");
    }
    if (user) {
      router.push("/");
      dispatch(setError(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    // userが無効なら
    if (error) {
      console.log(error);
    }
    if (!error) {
      dispatch(setError(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const checkUserLoggedIn = () => async (dispatch: AppDispatch) => {
    const res = await fetch(`${NEXT_URL}/api/user`);
    const data = await res.json();
    if (res.ok) {
      dispatch(setUser(data.user));
      dispatch(setToken(data.token));
      router.push("/");
    } else {
      dispatch(setUser(null));
      dispatch(setToken(null));
      router.push("/account/login");
    }
  };

  return <AuthContext.Provider value="dummy">{children}</AuthContext.Provider>;
};

export default AuthContext;
