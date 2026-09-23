import { Moon } from "lucide-react";
import { Link, Outlet, ScrollRestoration } from "react-router-dom";
import { useCompatibility } from "../../features/compatibility/state/CompatibilityContext";
import { Starfield } from "./Starfield";

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-cream">
      <span className="grid size-8 place-items-center rounded-xl bg-indigo ring-1 ring-gold/40">
        <Moon size={16} className="text-gold" fill="currentColor" aria-hidden="true" />
      </span>
      betamlinh
    </span>
  );
}

export function AppShell() {
  const { reset } = useCompatibility();

  return (
    <div className="relative isolate flex min-h-dvh flex-col">
      <Starfield />
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-gold px-4 py-2 font-semibold text-midnight focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Bỏ qua tới nội dung chính
      </a>

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="betamlinh — về trang chủ" onClick={reset} className="rounded-xl">
            <Logo />
          </Link>
          <p className="hidden font-accent text-sm text-cream-dim italic sm:block">Your stars, be's tea ☕🔮</p>
        </div>
      </header>

      <main id="main" className="relative z-10 flex-1">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-12 border-t border-lavender/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-[13px] text-cream-dim/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <span className="font-display font-bold text-cream">betamlinh</span> — nội dung mang tính giải trí, không phải
            lời tiên tri hay tư vấn chuyên môn.
          </p>
          <p>Dữ liệu chỉ nằm trong tab này và tự xóa khi bạn đóng tab.</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
