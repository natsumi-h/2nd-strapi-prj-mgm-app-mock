import {
  createContext,
  useEffect,
  ReactNode,
  FC,
  ReactElement,
  useState,
  // ContextType,
} from "react";
import { useRouter } from "next/router";
import { NEXT_URL } from "../config/index";
import { loginUser, registerUser } from "../types/authType";
import { showNotification } from "@mantine/notifications";

type Props = {
  // children?: ReactNode;
  children: ReactElement;
};

export type User = {
  username: string;
};

export type ContextType = {
  user: User | null;
  error: string | null;
  logout: Function;
  login: Function;
  register: Function;
};

const AuthContext = createContext<ContextType>({
  user: null,
  error: null,
  logout: () => {},
  login: () => {},
  register: () => {},
});

export const AuthProvider: FC<Props> = ({ children }) => {
  const resolvedUrl = children && children.props.resolvedUrl;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  //DOMになる瞬間（マウントされる瞬間）に、checkUserLoggedInの処理が走る
  useEffect(() => {
    checkUserLoggedIn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUserLoggedIn = async () => {
    const res = await fetch(`${NEXT_URL}/api/user`);
    const data = await res.json();
    // console.log(resolvedUrl);

    if (res.ok) {
      setUser(data.user);
      //   if (resolvedUrl == ("/account/signup" || "/account/login")) {
      //     router.push("/");
      //   }
    } else {
      setUser(null);
      if (resolvedUrl !== "/account/signup") {
        router.push("/account/login");
      }
    }
  };

  // Logout user
  const logout = async () => {
    const res = await fetch(`${NEXT_URL}/api/logout`, {
      method: "POST",
    });

    if (res.ok) {
      router.push("/account/login");
      setUser(null);
      showNotification({
        autoClose: 5000,
        title: "Yay!",
        message: "You have successfully logged out!",
      });
    }
  };

  // Login user
  const login = async ({ email: identifier, password }: loginUser) => {
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

      if (res.ok) {
        router.push("/");
        setUser(data.user);
        showNotification({
          autoClose: 5000,
          title: "Yay!",
          message: "You have successfully logged in!",
        });
      } else {
        setError(data.message);
        // setError(null);
        // console.log(error);
      }
    } catch (error) {
      setError("something wrong");
    }
  };

  // Register user
  const register = async (user: registerUser) => {
    const res = await fetch(`${NEXT_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      router.push("/");
      showNotification({
        autoClose: 5000,
        title: "Yay!",
        message: "You have successfully been registered!",
      });
    } else {
      setError(data.message);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, error, logout, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
