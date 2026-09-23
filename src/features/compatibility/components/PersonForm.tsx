import { ArrowLeft, ArrowRight, CalendarHeart, Clock, MapPin, UserRound } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";
import { computeAstroFacts } from "../astrology";
import type { Person } from "../types/compatibility";
import { todayIso } from "../utils/date";
import { NAME_MAX, PLACE_MAX, isPersonValid, sanitizePerson, validatePerson, type PersonField } from "../utils/validation";

interface PersonFormProps {
  initial: Person | null;
  heading: string;
  hint: string;
  submitLabel: string;
  onSubmit: (person: Person) => void;
  onBack: () => void;
  backLabel: string;
  /** Called on every change so going Back never loses typed data */
  onDraftChange?: (person: Person) => void;
}

const EMPTY: Person = { name: "", birthDate: "", birthTime: "", birthPlace: "" };
const FIELD_ORDER: PersonField[] = ["name", "birthDate", "birthTime", "birthPlace"];

export function PersonForm({ initial, heading, hint, submitLabel, onSubmit, onBack, backLabel, onDraftChange }: PersonFormProps) {
  const [values, setValues] = useState<Person>({ ...EMPTY, ...initial });
  const [touched, setTouched] = useState<Partial<Record<PersonField, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const refs = useRef<Partial<Record<PersonField, HTMLInputElement | null>>>({});

  const errors = useMemo(() => validatePerson(values), [values]);
  const visibleError = (field: PersonField) => (submitted || touched[field] ? errors[field] : undefined);

  // Show the computed sun sign as soon as the date is valid — real data, not a guess.
  const preview = useMemo(() => {
    if (!values.birthDate || errors.birthDate) return null;
    try {
      return computeAstroFacts(values).sunSign;
    } catch {
      return null;
    }
  }, [values, errors.birthDate]);

  const update = (field: PersonField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    onDraftChange?.(next);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isPersonValid(values)) {
      const first = FIELD_ORDER.find((f) => errors[f]);
      if (first) refs.current[first]?.focus();
      return;
    }
    onSubmit(sanitizePerson(values));
  };

  const blur = (field: PersonField) => () => setTouched((t) => ({ ...t, [field]: true }));

  return (
    <form onSubmit={handleSubmit} noValidate className="glass rounded-3xl p-5 sm:p-7" aria-labelledby="person-form-heading">
      <h2 id="person-form-heading" className="font-display text-2xl font-extrabold text-cream sm:text-3xl">
        {heading}
      </h2>
      <p className="mt-1 text-[15px] text-cream-dim">{hint}</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextField
          ref={(el) => {
            refs.current.name = el;
          }}
          className="md:col-span-2"
          label="Tên hoặc nickname"
          required
          icon={<UserRound size={18} />}
          autoComplete="off"
          maxLength={NAME_MAX + 10}
          placeholder="VD: Linh, Bé Mây, Tùng Núi…"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          onBlur={blur("name")}
          error={visibleError("name")}
        />
        <TextField
          ref={(el) => {
            refs.current.birthDate = el;
          }}
          className="md:col-span-2"
          type="date"
          label="Ngày sinh (dương lịch)"
          required
          icon={<CalendarHeart size={18} />}
          min="1900-01-01"
          max={todayIso()}
          value={values.birthDate}
          onChange={(e) => update("birthDate", e.target.value)}
          onBlur={blur("birthDate")}
          error={visibleError("birthDate")}
          hint={
            preview ? (
              <span aria-live="polite">
                be thấy cung Mặt Trời:{" "}
                <strong className="text-accent">
                  {preview.nameVi} {preview.symbol}
                  {"︎"}
                </strong>
                {preview.onCusp && ` (sát ranh giới với ${preview.cuspWith}, be sẽ đọc thận trọng)`}
              </span>
            ) : (
              "Chỉ cần ngày sinh là be đọc được rồi."
            )
          }
        />
        <TextField
          ref={(el) => {
            refs.current.birthTime = el;
          }}
          type="time"
          label="Giờ sinh"
          icon={<Clock size={18} />}
          value={values.birthTime ?? ""}
          onChange={(e) => update("birthTime", e.target.value)}
          onBlur={blur("birthTime")}
          error={visibleError("birthTime")}
          hint="Không nhớ thì bỏ qua, be không giận."
        />
        <TextField
          ref={(el) => {
            refs.current.birthPlace = el;
          }}
          label="Nơi sinh"
          icon={<MapPin size={18} />}
          autoComplete="off"
          maxLength={PLACE_MAX + 10}
          placeholder="VD: Đà Lạt"
          value={values.birthPlace ?? ""}
          onChange={(e) => update("birthPlace", e.target.value)}
          onBlur={blur("birthPlace")}
          error={visibleError("birthPlace")}
          hint="Tỉnh/thành là đủ."
        />
      </div>

      <p className="mt-5 rounded-2xl bg-white/5 px-4 py-3 text-[13px] leading-relaxed text-cream-dim">
        Nói thiệt nha: hiện be mới tính được <strong className="text-cream">cung Mặt Trời</strong> và{" "}
        <strong className="text-cream">năm con giáp</strong> từ ngày sinh. Giờ sinh và nơi sinh sẽ được ghi nhận nhưng chưa dùng
        để lập lá số.
      </p>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft size={18} aria-hidden="true" />}>
          {backLabel}
        </Button>
        <Button type="submit" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
