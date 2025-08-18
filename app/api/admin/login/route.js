import { cookies } from "next/headers";

export async function POST(req){
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) return new Response("No", { status: 401 });
  
  // Set httpOnly cookie: admin=1 with proper security settings
  const isProduction = process.env.NODE_ENV === 'production';
  cookies().set("admin", "1", { 
    httpOnly: true, 
    sameSite: "lax", 
    secure: isProduction, 
    path: "/", 
    maxAge: 7200 // 2 hours as specified
  });
  return new Response("OK");
}
