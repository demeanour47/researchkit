"use client";

import { useState } from "react";
import { Button, ChoiceChips, SelectField, TextField } from "@/ui";
import { PROJECT_TYPE_INFO } from "@/knowledge/project/sections";
import { CITATION_STYLE_IDS, type CitationStyleId, type ProjectType } from "@/knowledge/project/state";
import { projectActions } from "./store";

const STYLE_NAMES: Record<CitationStyleId, string> = { apa: "APA 7", mla: "MLA 9", chicago: "Chicago", harvard: "Harvard", ieee: "IEEE" };

/** "What are you working on?" Everything but the type is optional; an interest alone is enough. */
export function StartProject() {
  const [type, setType] = useState<ProjectType>("paper");
  const [interest, setInterest] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [level, setLevel] = useState("");
  const [institution, setInstitution] = useState("");
  const [style, setStyle] = useState("");
  const [failed, setFailed] = useState(false);
  const info = PROJECT_TYPE_INFO.find((item) => item.type === type)!;

  return (
    <form
      className="grid max-w-2xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setFailed(!projectActions.start(type, { interest, discipline, level, institution, citationStyle: style ? (style as CitationStyleId) : undefined }));
      }}
    >
      <ChoiceChips name="project-type" legend="What are you working on?" options={PROJECT_TYPE_INFO.map((item) => ({ value: item.type, label: item.name }))} value={type} onChange={setType} />
      <p className="text-small text-text-muted">{info.tagline} {info.results}</p>
      <TextField label="What are you interested in researching?" hint="Optional. A rough idea is enough." multiline rows={3} value={interest} onChange={(event) => setInterest(event.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Discipline" hint="Optional" value={discipline} onChange={(event) => setDiscipline(event.target.value)} />
        <TextField label="Level" hint="Optional, such as undergraduate or master's" value={level} onChange={(event) => setLevel(event.target.value)} />
      </div>
      <SelectField label="Citation style" hint="Optional. Your institution may require one." value={style} onChange={(event) => setStyle(event.target.value)} options={[{ value: "", label: "Not decided yet" }, ...CITATION_STYLE_IDS.map((id) => ({ value: id, label: STYLE_NAMES[id] }))]} />
      <TextField label="Institution requirements" hint="Optional. Paste anything your institution or supervisor requires." multiline rows={3} value={institution} onChange={(event) => setInstitution(event.target.value)} />
      <div>
        <Button type="submit">Start my research journey</Button>
        {failed && <p role="alert" className="mt-2 text-small text-danger">Your browser didn&apos;t allow the project to be saved. Check that storage is enabled.</p>}
      </div>
    </form>
  );
}
