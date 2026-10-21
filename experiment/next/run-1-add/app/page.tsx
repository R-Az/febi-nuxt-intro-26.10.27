import { redirect } from "next/navigation";

// "/" は proxy.ts が役割に応じた画面へ振り分ける。ここに来るのは proxy を通らなかった場合だけ。
export default function Home() {
  redirect("/login");
}
