import { cookies } from "next/headers";
export async function POST(req){
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) return new Response("No", { status: 401 });
  cookies().set("admin", process.env.ADMIN_PASSWORD, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60*60*24*7 });
  return new Response("OK");
}
