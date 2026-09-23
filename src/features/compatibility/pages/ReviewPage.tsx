import { ArrowLeft, Sparkles } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { ReviewInformation } from "../components/ReviewInformation";
import { StepLayout } from "../components/StepLayout";
import { paths } from "../config/routes";
import { READING_SOURCE } from "../services/readingService";
import { useCompatibility } from "../state/CompatibilityContext";
import { isPersonValid } from "../utils/validation";
import { useModeContext } from "./ModeLayout";

export function ReviewPage() {
  const { mode, config } = useModeContext();
  const { personA, personB } = useCompatibility();
  const navigate = useNavigate();
  useDocumentTitle(`Kiểm tra — ${config.label}`);

  if (!isPersonValid(personA)) return <Navigate to={paths.personA(mode)} replace />;
  if (!isPersonValid(personB)) return <Navigate to={paths.personB(mode)} replace />;

  return (
    <StepLayout
      step={3}
      modeLabel={config.label}
      beMood="thinking"
      beMessage={
        <>
          Khoan, kiểm tra lại cái đã. Sai ngày sinh là be đọc nhầm cung, lúc đó đừng đổ tại vũ trụ nha =)))
        </>
      }
    >
      <h2 className="mb-4 font-display text-2xl font-extrabold text-cream sm:text-3xl">Thông tin hai người</h2>
      <ReviewInformation
        personA={personA}
        personB={personB}
        labelA={config.personALabel}
        labelB={config.personBLabel}
        editA={paths.personA(mode)}
        editB={paths.personB(mode)}
      />

      <p className="mt-5 text-[13px] leading-relaxed text-cream-dim">
        {READING_SOURCE === "api"
          ? "Thông tin sẽ được gửi tới máy chủ của betamlinh để AI luận giải, không lưu lại sau khi trả kết quả."
          : "Bản hiện tại chạy bằng mock service (template), chưa gọi AI. Thông tin không rời khỏi trình duyệt của bạn."}
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={() => navigate(paths.personB(mode))} icon={<ArrowLeft size={18} aria-hidden="true" />}>
          Quay lại
        </Button>
        <Button onClick={() => navigate(paths.reading(mode))} icon={<Sparkles size={18} aria-hidden="true" />}>
          be ơi, xem giùm!
        </Button>
      </div>
    </StepLayout>
  );
}
