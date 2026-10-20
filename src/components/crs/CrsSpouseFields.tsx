"use client";

import { useState } from "react";

const LEVELS = ["below_4", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

export function CrsSpouseFields({
  checked,
  education,
  educations,
  levels,
}: {
  checked: boolean;
  education: string;
  educations: Array<[string, string]>;
  levels: { reading: string; writing: string; listening: string; speaking: string };
}) {
  const [open, setOpen] = useState(checked);

  return (
    <fieldset className="space-y-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-ink/5">
      <legend className="px-1 text-base font-semibold">Spouse or partner</legend>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="spouse"
          value="yes"
          checked={open}
          onChange={(event) => setOpen(event.target.checked)}
        />
        Applying with a spouse or common-law partner
      </label>
      {open ? (
        <>
          <label className="block text-sm font-medium">
            Spouse education
            <select
              name="se"
              defaultValue={education}
              className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2"
            >
              {educations.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Level name="pr" label="Spouse reading" value={levels.reading} />
            <Level name="pwr" label="Spouse writing" value={levels.writing} />
            <Level name="pl" label="Spouse listening" value={levels.listening} />
            <Level name="ps" label="Spouse speaking" value={levels.speaking} />
          </div>
        </>
      ) : (
        <p className="text-sm text-ink/70">Spouse points stay at zero until this box is checked.</p>
      )}
    </fieldset>
  );
}

function Level({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className="block text-sm font-medium text-ink">
      {label}
      <select
        name={name}
        defaultValue={value || "7"}
        className="mt-1 block w-full rounded-xl border border-ink/15 bg-white px-3 py-2"
      >
        {LEVELS.map((item) => (
          <option key={item} value={item}>
            {item === "below_4" ? "Below 4" : `CELPIP ${item}`}
          </option>
        ))}
      </select>
    </label>
  );
}
