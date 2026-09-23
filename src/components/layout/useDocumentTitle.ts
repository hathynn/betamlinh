import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · betamlinh` : "betamlinh — Your stars, be's tea";
  }, [title]);
}
