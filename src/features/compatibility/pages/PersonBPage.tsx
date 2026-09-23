import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { PersonForm } from "../components/PersonForm";
import { StepLayout } from "../components/StepLayout";
import { paths, type FromReviewState } from "../config/routes";
import { useCompatibility } from "../state/CompatibilityContext";
import { isPersonValid } from "../utils/validation";
import { useModeContext } from "./ModeLayout";

export function PersonBPage() {
  const { mode, config } = useModeContext();
  const { personA, personB, setPersonB } = useCompatibility();
  const navigate = useNavigate();
  const fromReview = (useLocation().state as FromReviewState | null)?.fromReview;
  useDocumentTitle(`${config.personBLabel} — ${config.label}`);

  if (!isPersonValid(personA)) return <Navigate to={paths.personA(mode)} replace />;

  const message =
    mode === "love"
      ? `Ok, ${personA.name} xong rồi. Giờ tới người kia nè — hồi hộp chưa?`
      : `Ok, ${personA.name} xong rồi. Giờ tới chiến hữu của ${personA.name} nha.`;

  return (
    <StepLayout step={2} modeLabel={config.label} beMessage={message} beMood="wink">
      <PersonForm
        key={mode}
        initial={personB}
        heading={config.personBLabel}
        hint={config.personBHint}
        submitLabel={fromReview ? "Lưu & về trang kiểm tra" : "Kiểm tra lại"}
        backLabel={`Quay lại ${personA.name}`}
        onDraftChange={setPersonB}
        onBack={() => navigate(paths.personA(mode))}
        onSubmit={(p) => {
          setPersonB(p);
          navigate(paths.review(mode));
        }}
      />
    </StepLayout>
  );
}
