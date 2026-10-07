import { auth } from "@/auth";
import ProductExplorer from "./components/ProductExplorer";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <ProductExplorer
        isLoggedIn={Boolean(session?.user)}
        userName={session?.user?.name ?? null}
      />
    </main>
  );
}