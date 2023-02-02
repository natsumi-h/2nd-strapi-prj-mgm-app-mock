import { API_URL } from "../../config";
import cookie from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export default async function registerHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { username, email, password } = req.body;
    // console.log(req.body);

    const strapiRes = await fetch(`${API_URL}/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await strapiRes.json();
    // console.log(data);

    if (strapiRes.ok) {
      //ここでJWTを取得
      // https://github.com/jshttp/cookie
      //   console.log(data.jwt);
      // curl -X POST http://localhost:1337/api/auth/local \
      // -H 'Content-Type: application/json' \
      // -d '{"identifier":"natsmy.1211@gmail.com","password":"nats723S"}'

      // APIをヒットするときに、Bearerトークン（JWT）がないとforbiddenになる
      // curl -X GET http://localhost:1337/api/projects \
      // -H 'Content-Type: application/json' \
      // -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjYxODQxNzY5LCJleHAiOjE2NjQ0MzM3Njl9.SWHq5fIdiJYwss2PuzFx-RMd1q5cVumsz26NBMAGEhs'
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
      //   res.status(data.statusCode).json("");
      // res.status(400).json("error");
      // .json({ message: data.message[0].messages[0].message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}
