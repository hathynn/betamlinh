import { CalendarHeart, Clock, MapPin, Pencil } from "lucide-react";
import { LinkButton } from "../../../components/ui/Button";
import { computeAstroFacts } from "../astrology";
import type { Person } from "../types/compatibility";
import { formatDateVi } from "../utils/date";

interface PersonSummaryProps {
  label: string;
  person: Person;
  editTo: string;
}

function PersonSummary({ label, person, editTo }: PersonSummaryProps) {
  const facts = computeAstroFacts(person);
  const { sunSign, chineseYear } = facts;

  return (
    <section className="glass flex flex-col rounded-3xl p-5 sm:p-6" aria-label={`${label}: ${person.name}`}>
      <p className="text-xs font-semibold tracking-widest text-accent uppercase">{label}</p>
      <h3 className="mt-1 font-display text-2xl font-extrabold break-words text-cream">{person.name}</h3>

      <dl className="mt-4 space-y-2.5 text-[15px]">
        <div className="flex items-center gap-2.5">
          <dt className="text-cream-dim">
            <CalendarHeart size={17} aria-hidden="true" />
            <span className="sr-only">Ngày sinh</span>
          </dt>
          <dd>{formatDateVi(person.birthDate)}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt className="text-cream-dim">
            <Clock size={17} aria-hidden="true" />
            <span className="sr-only">Giờ sinh</span>
          </dt>
          <dd className={person.birthTime ? "" : "text-cream-dim/70 italic"}>{person.birthTime ?? "Không cung cấp"}</dd>
        </div>
        <div className="flex items-center gap-2.5">
          <dt className="text-cream-dim">
            <MapPin size={17} aria-hidden="true" />
            <span className="sr-only">Nơi sinh</span>
          </dt>
          <dd className={person.birthPlace ? "break-words" : "text-cream-dim/70 italic"}>
            {person.birthPlace ?? "Không cung cấp"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-cream ring-1 ring-accent/25">
          {sunSign.symbol}
          {"︎"} {sunSign.nameVi}
          {sunSign.onCusp && <span className="text-cream-dim"> · sát {sunSign.cuspWith}</span>}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-cream ring-1 ring-white/10">
          {chineseYear.uncertain && chineseYear.alternate
            ? `${chineseYear.alternate.animal} hoặc ${chineseYear.animal} (sinh gần Tết)`
            : `Tuổi ${chineseYear.animal} · ${chineseYear.canChi}`}
        </span>
      </div>

      <LinkButton
        to={editTo}
        state={{ fromReview: true }}
        variant="secondary"
        className="mt-5 self-start min-h-11! px-4! text-sm"
        icon={<Pencil size={16} aria-hidden="true" />}
        aria-label={`Sửa thông tin ${person.name}`}
      >
        Sửa
      </LinkButton>
    </section>
  );
}

interface ReviewInformationProps {
  personA: Person;
  personB: Person;
  labelA: string;
  labelB: string;
  editA: string;
  editB: string;
}

export function ReviewInformation({ personA, personB, labelA, labelB, editA, editB }: ReviewInformationProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PersonSummary label={labelA} person={personA} editTo={editA} />
      <PersonSummary label={labelB} person={personB} editTo={editB} />
    </div>
  );
}
