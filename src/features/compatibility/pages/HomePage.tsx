import { Heart, ListChecks, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BeAvatar } from "../../../components/be/BeAvatar";
import { useDocumentTitle } from "../../../components/layout/useDocumentTitle";
import { ZodiacWheel } from "../../../components/layout/ZodiacWheel";
import { ModeSelector } from "../components/ModeSelector";
import { paths } from "../config/routes";
import { useCompatibility } from "../state/CompatibilityContext";
import type { CompatibilityMode } from "../types/compatibility";

const HOW = [
  { icon: Heart, title: "Chọn mode", text: "tình iu hay bè bạn — mỗi mode một bộ tiêu chí riêng." },
  { icon: ListChecks, title: "Nhập hai người", text: "Chỉ cần tên và ngày sinh. Giờ & nơi sinh thì tùy." },
  { icon: Sparkles, title: "be luận giải", text: "Điểm số, biệt danh, lời khuyên — kèm vài câu cà khịa." },
];

export function HomePage() {
  useDocumentTitle("");
  const navigate = useNavigate();
  const { selectMode } = useCompatibility();

  const choose = (mode: CompatibilityMode) => {
    selectMode(mode);
    navigate(paths.personA(mode));
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid items-center gap-8 pt-2 pb-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-10">
        {/* be + greeting */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="relative grid size-52 place-items-center sm:size-64">
            <ZodiacWheel className="absolute inset-0 size-full text-lavender" />
            <BeAvatar mood="wink" size={150} animated className="sm:hidden" />
            <BeAvatar mood="wink" size={180} animated className="hidden sm:block" />
          </div>

          <p className="mt-4 font-accent text-base text-gold italic">Your stars, be's tea ☕🔮</p>
          <h1 className="mt-2 font-display text-4xl leading-[1.05] font-extrabold text-cream sm:text-5xl lg:text-6xl">
            hellooooo, tui là <span className="text-gradient">be</span>.
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-cream/90">
            Hôm nay, bạn muốn khám phá sự kết nối giữa hai người qua <strong className="text-blush">tình iu</strong> hay{" "}
            <strong className="text-periwinkle">tình bạn</strong>?
          </p>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-cream-dim">
            be là thầy tử vi hệ Gen Z: biết đọc sao, biết pha trà, và biết cà khịa đúng lúc. Không phán số phận, chỉ kể bạn nghe
            vũ trụ đang “tea” gì về hai người — còn quyết định là của hai bạn.
          </p>
        </div>

        {/* mode cards */}
        <div>
          <h2 className="mb-4 text-center font-display text-lg font-bold text-cream-dim lg:text-left">Chọn một mode để bắt đầu</h2>
          <ModeSelector onSelect={choose} />
        </div>
      </section>

      <section aria-labelledby="how-title" className="border-t border-lavender/10 pt-8">
        <h2 id="how-title" className="sr-only">
          Cách betamlinh hoạt động
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          {HOW.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo text-gold">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display font-bold text-cream">
                  {i + 1}. {title}
                </span>
                <span className="text-sm text-cream-dim">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
