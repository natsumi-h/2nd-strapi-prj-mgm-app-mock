import { API_URL } from "../../config";
import cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function loginHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { identifier, password } = req.body;

    const strapiRes = await fetch(`${API_URL}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    const data = await strapiRes.json();

    if (strapiRes.ok) {
      res.setHeader(
        //HTTPのヘッダーのCookieに、JWTをtokenとして送る
        "Set-Cookie",
        cookie.serialize("token", data.jwt, {
          httpOnly: true, //JavaScript が Document.cookie プロパティなどを介してこのクッキーにアクセスすることを禁止します。
          secure: process.env.NODE_ENV !== "development", // クッキーが、リクエストが SSL と HTTPS プロトコルを使用して行われた場合にのみサーバーに送信されることを示します
          maxAge: 60 * 60 * 24 * 7, // 1 week
          sameSite: "strict", //ブラウザーが同一サイトのリクエストに対してのみクッキーを送信することを意味します。
          path: "/",
        })
      );

      res.status(200).json({ user: data.user, jwt: data.jwt });
    } else {
      res.status(data.error.status).json({ message: data.error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
