import { Pencil, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BeErrorState } from "../../../components/be/BeErrorState";
import { Button } from "../../../components/ui/Button";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { ReadingLoader } from "../components/ReadingLoader";
import { paths } from "../config/routes";
import { ReadingServiceError, type ReadingErrorKind } from "../services/kimiService";
import { fetchReading } from "../services/readingService";
import { useCompatibility } from "../state/CompatibilityContext";
import { ReadingParseError } from "../utils/parseResult";
import { isPersonValid } from "../utils/validation";
import { useModeContext } from "./ModeLayout";

const ERROR_COPY: Record<ReadingErrorKind | "unknown", { title: string; message: string }> = {
  network: {
    title: "Tín hiệu vũ trụ bị lag rồi",
    message: "Ủa, hình như tín hiệu từ vũ trụ bị lag rồi. be chưa lấy được bản luận giải, bạn kiểm tra mạng rồi thử lại giúp be nha.",
  },
  timeout: {
    title: "Vũ trụ trả lời chậm quá",
    message: "be chờ lâu quá mà sao vẫn chưa nói gì. Chắc đang kẹt xe trên dải Ngân Hà, bạn thử lại nha.",
  },
  invalid: {
    title: "Bản luận giải bị lỗi font vũ trụ",
    message: "be nhận được kết quả nhưng nó lộn xộn quá, không dám đưa cho bạn đọc. Thử lại một lần nữa giúp be nha.",
  },
  server: {
    title: "Máy chủ đang hơi mệt",
    message: "Máy chủ của be đang trục trặc chút xíu. Bạn đợi một lát rồi thử lại nha.",
  },
  quota: {
    title: "be hết lượt đọc sao hôm nay rồi",
    message:
      "Ủa, hôm nay nhiều người rủ be xem quá, vũ trụ cắt lượt của be rồi. Bạn quay lại sau vài tiếng (hoặc ngày mai) nha, thông tin hai người vẫn được giữ nguyên, lúc đó bấm Thử lại là xong.",
  },
  not_configured: {
    title: "be chưa được nối với AI",
    message: "Máy chủ chưa có API key cho AI nên be chưa đọc bằng AI được. Người quản trị cần cấu hình GEMINI_API_KEY ở server.",
  },
  unknown: {
    title: "Ủa, có gì đó sai sai",
    message: "be gặp một lỗi lạ chưa từng thấy. Bạn thử lại giúp be nha.",
  },
};

function toErrorKind(err: unknown): ReadingErrorKind | "unknown" {
  if (err instanceof ReadingServiceError) return err.kind;
  if (err instanceof ReadingParseError) return "invalid";
  return "unknown";
}

export function ReadingPage() {
  const { mode, config } = useModeContext();
  const flow = useCompatibility();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(0);
  useDocumentTitle(`be đang đọc sao — ${config.label}`);

  // Keep the latest context in a ref so the fetch effect only re-runs on retry.
  const flowRef = useRef(flow);
  flowRef.current = flow;

  const ready = isPersonValid(flow.personA) && isPersonValid(flow.personB);

  useEffect(() => {
    if (!ready) return;
    const { personA, personB, startReading, finishReading, failReading } = flowRef.current;
    if (!personA || !personB) return;

    const controller = new AbortController();
    startReading();
    fetchReading({ mode, personA, personB }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        finishReading(result);
        navigate(paths.result(mode), { replace: true });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        failReading(toErrorKind(err));
      });

    return () => controller.abort();
  }, [attempt, mode, ready, navigate]);

  if (!ready) return <Navigate to={paths.review(mode)} replace />;

  if (flow.status === "error") {
    const copy = ERROR_COPY[(flow.errorKind as ReadingErrorKind | null) ?? "unknown"] ?? ERROR_COPY.unknown;
    return (
      <div className="px-4 pt-6 sm:px-6">
        <BeErrorState
          title={copy.title}
          message={copy.message}
          actions={
            <>
              <Button onClick={() => setAttempt((n) => n + 1)} icon={<RefreshCw size={18} aria-hidden="true" />}>
                Thử lại
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(paths.review(mode))}
                icon={<Pencil size={18} aria-hidden="true" />}
              >
                Sửa thông tin
              </Button>
            </>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="mb-6">
        <ProgressIndicator current={4} />
      </div>
      <ReadingLoader mode={mode} nameA={flow.personA!.name} nameB={flow.personB!.name} />
    </div>
  );
}
