import { Home, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BeErrorState } from "../../../components/be/BeErrorState";
import { LinkButton } from "../../../components/ui/Button";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { CompatibilityResult } from "../components/CompatibilityResult";
import { paths } from "../config/routes";
import { useCompatibility } from "../state/CompatibilityContext";
import { isPersonValid } from "../utils/validation";
import { useModeContext } from "./ModeLayout";

export function ResultPage() {
  const { mode, config } = useModeContext();
  const { result, personA, personB, reset } = useCompatibility();
  const navigate = useNavigate();
  useDocumentTitle(personA && personB ? `${personA.name} × ${personB.name} — ${config.label}` : "Kết quả");

  const valid = isPersonValid(personA) && isPersonValid(personB);

  // Empty state: no reading for this mode yet (e.g. opened the URL directly, or switched mode).
  if (!result || result.mode !== mode || !valid) {
    return (
      <div className="px-4 pt-6 sm:px-6">
        <BeErrorState
          title="Chưa có gì để đọc hết trơn"
          message="be chưa có bản luận giải nào cho mode này. Nhập thông tin hai người rồi be đọc liền cho nha."
          actions={
            <>
              <LinkButton
                to={valid ? paths.review(mode) : paths.personA(mode)}
                icon={<Sparkles size={18} aria-hidden="true" />}
              >
                {valid ? "Xem ngay" : "Nhập thông tin"}
              </LinkButton>
              <LinkButton to={paths.home} variant="secondary" icon={<Home size={18} aria-hidden="true" />}>
                Về trang chủ
              </LinkButton>
            </>
          }
        />
      </div>
    );
  }

  return (
    <CompatibilityResult
      result={result}
      nameA={personA.name}
      nameB={personB.name}
      onNewReading={() => {
        reset();
        navigate(paths.home);
      }}
      onEdit={() => navigate(paths.review(mode))}
    />
  );
}
