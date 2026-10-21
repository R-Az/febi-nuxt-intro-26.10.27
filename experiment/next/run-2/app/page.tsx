import { redirect } from "next/navigation";

// 通常は proxy.ts が役割に応じたトップへ移す。ここはその手前で止まった場合の保険。
export default function Home() {
  redirect("/login");
}
