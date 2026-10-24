"use client";
// Migbits preview composed with shadcn/ui (MIT); see ../ui/LICENSE.
import { useState } from "react";
import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireDescription,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireActions,
  QuestionnaireSubmit,
} from "../ui/questionnaire";
const items = [
  {
    name: "focus",
    required: true,
    choices: [{ value: "design" }, { value: "build" }, { value: "both" }],
  },
];
export default function Example() {
  const [done, setDone] = useState(false);
  return (
    <div className="w-full max-w-sm">
      {done ? (
        <div className="rounded-xl border p-6">
          <strong>A little direction goes a long way.</strong>
          <p className="mt-3 text-sm text-muted-foreground">
            Your preview answer stayed in this browser.
          </p>
          <button className="mt-4 underline" onClick={() => setDone(false)}>
            Start again
          </button>
        </div>
      ) : (
        <Questionnaire
          items={items}
          defaultItem="focus"
          onSubmit={() => {
            setDone(true);
          }}
        >
          <QuestionnaireItem name="focus">
            <QuestionnaireTitle>Where do you want to begin?</QuestionnaireTitle>
            <QuestionnaireDescription>
              Choose the part that feels right.
            </QuestionnaireDescription>
            <QuestionnaireChoices>
              <QuestionnaireChoice value="design">
                Design the idea
              </QuestionnaireChoice>
              <QuestionnaireChoice value="build">
                Build the details
              </QuestionnaireChoice>
              <QuestionnaireChoice value="both">
                A bit of both
              </QuestionnaireChoice>
            </QuestionnaireChoices>
          </QuestionnaireItem>
          <QuestionnaireActions>
            <QuestionnaireSubmit>Continue</QuestionnaireSubmit>
          </QuestionnaireActions>
        </Questionnaire>
      )}
    </div>
  );
}
