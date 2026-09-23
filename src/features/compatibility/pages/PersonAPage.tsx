import { useLocation, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { PersonForm } from "../components/PersonForm";
import { StepLayout } from "../components/StepLayout";
import { paths, type FromReviewState } from "../config/routes";
import { useCompatibility } from "../state/CompatibilityContext";
import { isPersonValid } from "../utils/validation";
import { useModeContext } from "./ModeLayout";

export function PersonAPage() {
  const { mode, config } = useModeContext();
  const { personA, personB, setPersonA } = useCompatibility();
  const navigate = useNavigate();
  const fromReview = (useLocation().state as FromReviewState | null)?.fromReview;
  useDocumentTitle(`${config.personALabel} — ${config.label}`);

  return (
    <StepLayout step={1} modeLabel={config.label} beMessage={config.beIntro}>
      <PersonForm
        key={mode}
        initial={personA}
        heading={config.personALabel}
        hint={config.personAHint}
        submitLabel={fromReview && isPersonValid(personB) ? "Lưu & về trang kiểm tra" : "Tiếp tục"}
        backLabel="Đổi mode"
        onDraftChange={setPersonA}
        onBack={() => navigate(paths.home)}
        onSubmit={(p) => {
          setPersonA(p);
          navigate(fromReview && isPersonValid(personB) ? paths.review(mode) : paths.personB(mode));
        }}
      />
    </StepLayout>
  );
}
