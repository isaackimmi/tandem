import { buttonStyles } from "@/components/Button/buttonStyles";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Brand } from "@/components/Brand/Brand";

export function Header({ workspace = false }: { workspace?: boolean }) {
  return (
    <header className="border-b border-[#e1e1dd] bg-[#ffffffed]">
      <a
        href="#main"
        className="absolute z-50 -translate-y-[150%] bg-base-content p-3 text-white focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="m-auto flex min-h-20 max-w-[1500px] items-center gap-[58px] px-[42px] max-[900px]:gap-[30px] max-[900px]:px-6 max-[640px]:min-h-[70px] max-[640px]:gap-4 max-[640px]:px-5">
        <Brand />
        {workspace ? (
          <>
            <nav
              className="flex gap-8 self-stretch max-[640px]:hidden"
              aria-label="Main navigation"
            >
              <Link
                className="relative flex items-center px-[5px] text-sm"
                href="/"
              >
                Home
              </Link>
              <Link
                className="relative flex items-center px-[5px] text-sm font-[650] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-[3px] after:bg-base-content"
                href="/recommender"
                aria-current="page"
              >
                Workspace
              </Link>
            </nav>
            <span className="ml-auto text-sm text-[#454540] max-[900px]:hidden">
              Market basket recommender
            </span>
            <Link
              className="ml-auto hidden text-sm text-[var(--muted)] max-[640px]:block"
              href="/"
            >
              Home
            </Link>
          </>
        ) : (
          <>
            <a
              className="text-sm text-[var(--muted)] max-[640px]:hidden"
              href="#how-it-works"
            >
              How it works
            </a>
            <Link
              className={`${buttonStyles.header} ${buttonStyles.primary} ml-auto`}
              href="/recommender"
            >
              Open workspace <LuArrowRight aria-hidden="true" />
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
