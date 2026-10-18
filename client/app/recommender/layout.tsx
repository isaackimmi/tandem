import { Header } from "@/components/Header/Header";
import { BasketProvider } from "@/components/Basket/BasketProvider";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header workspace />
      <BasketProvider>{children}</BasketProvider>
    </>
  );
}
