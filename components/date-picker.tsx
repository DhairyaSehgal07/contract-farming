import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatDateOnly,
  isDateOnlyString,
  parseDateOnlyInput,
  toLocalDateOnly,
} from "@/lib/date";
import { cn } from "@/lib/utils";

function formatInputDate(date: Date | undefined) {
  return date ? formatDateOnly(date) : "";
}

export type DatePickerInputProps = {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  /** Emits `YYYY-MM-DD` in local timezone — use instead of `date.toISOString()`. */
  onDateChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-invalid"?: boolean;
};

export function DatePickerInput({
  id: idProp,
  label,
  placeholder = "YYYY-MM-DD",
  value: valueProp,
  defaultValue,
  onChange,
  onDateChange,
  onBlur,
  className,
  disabled,
  required,
  "aria-invalid": ariaInvalid,
}: DatePickerInputProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const isControlled = valueProp !== undefined;

  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue,
  );
  const date = isControlled ? valueProp : internalDate;

  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(formatInputDate(date));

  const setDate = React.useCallback(
    (next: Date | undefined) => {
      const normalized = next ? toLocalDateOnly(next) : undefined;
      if (!isControlled) {
        setInternalDate(normalized);
      }
      onChange?.(normalized);
      onDateChange?.(normalized ? formatDateOnly(normalized) : "");
    },
    [isControlled, onChange, onDateChange],
  );

  const [prevDate, setPrevDate] = React.useState(date);
  if (date !== prevDate) {
    setPrevDate(date);
    setInputValue(formatInputDate(date));
    if (date) {
      setMonth(date);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    if (isDateOnlyString(nextValue)) {
      const parsed = parseDateOnlyInput(nextValue);
      if (parsed) {
        setDate(parsed);
        setMonth(parsed);
      }
    }
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const trimmed = inputValue.trim();

    if (trimmed === "") {
      setInputValue("");
      setDate(undefined);
    } else {
      const parsed = parseDateOnlyInput(trimmed);
      if (parsed) {
        setInputValue(formatDateOnly(parsed));
        setDate(parsed);
        setMonth(parsed);
      } else {
        setInputValue(formatInputDate(date));
      }
    }

    onBlur?.(event);
  };

  const handleCalendarSelect = (selected: Date | undefined) => {
    const normalized = selected ? toLocalDateOnly(selected) : undefined;
    setDate(normalized);
    setInputValue(formatInputDate(normalized));
    setOpen(false);
  };

  const field = (
    <InputGroup>
      <InputGroupInput
        id={id}
        name={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid}
        inputMode="numeric"
        autoComplete="off"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              aria-label="Select date"
            >
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );

  if (!label) {
    return <div className={cn("w-full", className)}>{field}</div>;
  }

  return (
    <Field className={cn("w-full", className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {field}
    </Field>
  );
}
