import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Field } from "./ui";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { sendSurvey } from "../lib/account";
import { buttonClass, cardClass, chipClass, inputClass } from "../lib/styles";

// The survey on the Learning guide page: which topics and kinds of course
// learners want next. Answers are saved with the feedback (see sendSurvey).
// Guests see a prompt to log in, because only logged-in learners can save.

// The choices. These English ids are what gets saved in Firestore.
const topicChoices = ["work", "shopping", "transport", "health", "offices", "bank", "home", "friends"];
const typeChoices = ["phrases", "dialogues", "listening", "reading", "writing", "grammar"];
const levelChoices = ["new", "some", "good"];

const emptyAnswers = { topics: [], types: [], level: "", job: "", comment: "" };

// A row of pill-shaped choices. `multiple` makes them checkboxes (pick many),
// otherwise they are radio buttons (pick one).
function ChoiceGroup({ name, choices, selected, multiple, onChange }) {
  const { t } = useLocale();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">{t(`guide.survey.${name}`)}</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const isOn = multiple ? selected.includes(choice) : selected === choice;
          return (
            <label
              key={choice}
              className={`${chipClass(isOn)} cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500/40`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={choice}
                checked={isOn}
                onChange={() => onChange(choice)}
                className="sr-only"
              />
              {t(`guide.survey.${name}.${choice}`)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

// Shown to guests instead of the form
function LoginPrompt() {
  const { t } = useLocale();
  return (
    <div className={`${cardClass} space-y-3 p-5 text-center`}>
      <p className="text-slate-600">{t("guide.survey.loginText")}</p>
      <div className="flex flex-col justify-center gap-2 sm:flex-row">
        <Link to="/signup" className={buttonClass("primary")}>
          {t("nav.start")}
        </Link>
        <Link to="/login" className={buttonClass("secondary")}>
          {t("nav.login")}
        </Link>
      </div>
    </div>
  );
}

export default function GuideSurvey() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [answers, setAnswers] = useState(emptyAnswers);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  if (!user) return <LoginPrompt />;

  if (status === "sent") {
    return (
      <div className={`${cardClass} space-y-3 p-5 text-center`}>
        <p className="text-3xl" aria-hidden="true">🙏</p>
        <p className="font-semibold text-slate-900">{t("guide.survey.thanks")}</p>
        <button type="button" onClick={() => setStatus("idle")} className={buttonClass("secondary", "sm")}>
          {t("guide.survey.again")}
        </button>
      </div>
    );
  }

  // Adds the choice to a list, or removes it if it's already there
  function toggle(field, choice) {
    setAnswers((current) => {
      const list = current[field];
      const next = list.includes(choice) ? list.filter((c) => c !== choice) : [...list, choice];
      return { ...current, [field]: next };
    });
  }

  function setField(field, value) {
    setAnswers((current) => ({ ...current, [field]: value }));
  }

  // The form can be sent once at least one question has an answer
  const hasAnswer =
    answers.topics.length > 0 ||
    answers.types.length > 0 ||
    answers.level !== "" ||
    answers.job.trim() !== "" ||
    answers.comment.trim() !== "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hasAnswer) return;
    setStatus("sending");
    try {
      await sendSurvey(user, answers, locale);
      setAnswers(emptyAnswers);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} space-y-6 p-5`}>
      {status === "error" && <Alert>{t("guide.survey.error")}</Alert>}

      <ChoiceGroup
        name="topics"
        choices={topicChoices}
        selected={answers.topics}
        multiple
        onChange={(choice) => toggle("topics", choice)}
      />
      <ChoiceGroup
        name="types"
        choices={typeChoices}
        selected={answers.types}
        multiple
        onChange={(choice) => toggle("types", choice)}
      />
      <ChoiceGroup
        name="level"
        choices={levelChoices}
        selected={answers.level}
        onChange={(choice) => setField("level", choice)}
      />

      <Field label={t("guide.survey.job")} hint={t("guide.survey.jobHint")}>
        <input
          value={answers.job}
          maxLength={100}
          onChange={(e) => setField("job", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={t("guide.survey.comment")} hint={t("guide.survey.commentHint")}>
        <textarea
          rows={4}
          maxLength={1000}
          value={answers.comment}
          onChange={(e) => setField("comment", e.target.value)}
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={!hasAnswer || status === "sending"} className={buttonClass("primary", "lg", "w-full")}>
        {status === "sending" ? t("guide.survey.sending") : t("guide.survey.send")}
      </button>
    </form>
  );
}
