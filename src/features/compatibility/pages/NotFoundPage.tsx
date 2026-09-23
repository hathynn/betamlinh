import { Home } from "lucide-react";
import { BeErrorState } from "../../../components/be/BeErrorState";
import { LinkButton } from "../../../components/ui/Button";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Lạc trôi");
  return (
    <div className="px-4 pt-6 sm:px-6">
      <BeErrorState
        title="Ủa alo, trang này lạc trôi đâu rồi?"
        message="be tìm khắp dải Ngân Hà mà không thấy trang bạn cần. Quay về trang chủ chọn mode lại nha."
        actions={
          <LinkButton to="/" icon={<Home size={18} aria-hidden="true" />}>
            Về trang chủ
          </LinkButton>
        }
      />
    </div>
  );
}
