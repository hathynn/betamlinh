import type { ReactNode } from "react";
import { BeAvatar } from "./BeAvatar";

interface BeErrorStateProps {
  title: string;
  message: string;
  actions?: ReactNode;
}

/** Friendly error / empty state in be's voice. */
export function BeErrorState({ title, message, actions }: BeErrorStateProps) {
  return (
    <div role="alert" className="glass mx-auto flex max-w-lg flex-col items-center rounded-3xl p-6 text-center sm:p-8">
      <BeAvatar mood="oops" size={96} />
      <h1 className="mt-4 font-display text-2xl font-extrabold text-cream">{title}</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-cream-dim">{message}</p>
      {actions && <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">{actions}</div>}
    </div>
  );
}
