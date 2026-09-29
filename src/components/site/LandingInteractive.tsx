"use client";

import { useState } from "react";
import { WHICH_ANSWER } from "@/features/public-site/seed";
import { buildStudyPlanner, type PlannerInputs } from "@/features/public-site/study-planner";
import { SignUpPrompt } from "./SignUpPrompt";

export function WhichAnswer() {
  const [choice, setChoice] = useState<"left" | "right" | null>(null);
  const item = WHICH_ANSWER;

  return (
    <div>
      <p className="text-base leading-7">{item.prompt}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(["left", "right"] as const).map((side) => (
          <button
            key={side}
            type="button"
            className="min-h-11 rounded-2xl bg-white p-4 text-left text-base leading-7 ring-1 ring-ink/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => setChoice(side)}
          >
            {side === "left" ? item.left : item.right}
          </button>
        ))}
      </div>
      {choice ? (
        <div className="mt-4" aria-live="polite">
          <p className="font-semibold">
            The higher practice estimate is the {item.higher} answer ({item.higher === "left" ? item.leftLevel : item.rightLevel}).
          </p>
          <p className="mt-1 text-sm">
            Practice estimates: left {item.leftLevel}, right {item.rightLevel}.
          </p>
          <p className="mt-2 text-base leading-7">{item.explanation}</p>
          <div className="mt-4">
            <SignUpPrompt context="which_answer" presentation="inline" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StudyPlannerForm() {
  const [plan, setPlan] = useState<ReturnType<typeof buildStudyPlanner> | null>(null);
  const [saved, setSaved] = useState<PlannerInputs | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const input: PlannerInputs = {
          testDate: String(data.get("testDate") || "") || null,
          notBooked: data.get("notBooked") === "on",
          target: (String(data.get("target") || "not_sure") as PlannerInputs["target"]),
          worry: String(data.get("worry") || "Speaking") as PlannerInputs["worry"],
        };
        setSaved(input);
        setPlan(buildStudyPlanner(input, new Date().toISOString().slice(0, 10)));
        if (typeof window !== "undefined") {
          window.localStorage.setItem("cd_study_planner", JSON.stringify(input));
        }
      }}
    >
      <label className="block text-sm font-semibold">
        Test date
        <input name="testDate" type="date" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base" />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input name="notBooked" type="checkbox" /> Not booked yet
      </label>
      <label className="block text-sm font-semibold">
        Target CLB
        <select name="target" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base">
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10 or higher</option>
          <option value="not_sure">Not sure yet</option>
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Section that worries you most
        <select name="worry" className="mt-1 min-h-11 w-full rounded-xl border border-ink/15 px-3 text-base">
          <option>Listening</option>
          <option>Reading</option>
          <option>Writing</option>
          <option>Speaking</option>
        </select>
      </label>
      <button type="submit" className="min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white">
        Build my plan
      </button>
      {plan ? (
        <div className="space-y-3">
          {plan.map((week) => (
            <article key={week.title}>
              <h3 className="font-semibold">{week.title}</h3>
              <ul className="mt-1 list-disc pl-5 text-base leading-7">
                {week.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
          {saved ? (
            <SignUpPrompt
              context="study_planner"
              presentation="inline"
              items={[
                `Target ${saved.target}`,
                `Worry ${saved.worry}`,
                saved.testDate ? `Test date ${saved.testDate}` : "Not booked yet",
              ]}
            />
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
