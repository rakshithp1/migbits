"use client";
// Composition of shadcn/ui MIT components. See ../ui/LICENSE.
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";

export default function DatePickerExample() {
  const [date, setDate] = useState<Date | undefined>();
  return (
    <div className="grid gap-3">
      <span className="text-sm font-medium">Make a little time.</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-64 justify-start">
            <CalendarDays />
            {date
              ? date.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={new Date(2026, 9, 1)}
          />
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground">
        Your next chapter starts here.
      </p>
    </div>
  );
}
