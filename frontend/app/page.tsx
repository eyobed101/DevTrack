import getServerSession from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">Protected Page</h1>
      <pre className="mt-4 p-4 bg-gray-100 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
    </main>
  );
}