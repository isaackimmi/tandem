import { Header } from "@/components/header";
import { BasketProvider } from "@/components/basket-provider";
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <><Header workspace /><BasketProvider>{children}</BasketProvider></>;
}
