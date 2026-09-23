import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/Button";

interface ShareButtonProps {
  title: string;
  text: string;
}

type Status = "idle" | "copied" | "failed";

/**
 * Shares a text summary via the Web Share API, falling back to copying it.
 * Readings are not stored on a server, so we share text rather than a link.
 * If neither API exists the button is not rendered at all.
 */
export function ShareButton({ title, text }: ShareButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const canCopy = typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText);

  if (!canShare && !canCopy) return null;

  const handleClick = async () => {
    if (canShare) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // user closed the sheet
        if (!canCopy) {
          setStatus("failed");
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        onClick={handleClick}
        icon={status === "copied" ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
      >
        {status === "copied" ? "Đã copy tóm tắt!" : canShare ? "Chia sẻ kết quả" : "Copy tóm tắt để chia sẻ"}
      </Button>
      <p aria-live="polite" className="min-h-0 text-center text-xs text-cream-dim sm:text-left">
        {status === "failed" && "Ủa, không chia sẻ được. Bạn chụp màn hình giúp be nha."}
      </p>
    </div>
  );
}
