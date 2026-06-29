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
  formatDateDmy,
  formatDateOnly,
  isDateDmyString,
  isDateOnlyString,
  parseDateDmyInput,
  parseDateOnlyInput,
  toLocalDateOnly,
} from "@/lib/date";
import { cn } from "@/lib/utils";

type DatePickerInputFormat = "iso" | "dmy";

function formatInputDate(date: Date | undefined, format: DatePickerInputFormat) {
  if (!date) return "";
  return format === "dmy" ? formatDateDmy(date) : formatDateOnly(date);
}

function parseInputDate(
  value: string,
  format: DatePickerInputFormat,
): Date | undefined {
  return format === "dmy" ? parseDateDmyInput(value) : parseDateOnlyInput(value);
}

function isCompleteInputDate(value: string, format: DatePickerInputFormat) {
  return format === "dmy" ? isDateDmyString(value) : isDateOnlyString(value);
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
  /** Display and typed input format. `onDateChange` always emits `YYYY-MM-DD`. */
  inputFormat?: DatePickerInputFormat;
  "aria-invalid"?: boolean;
};

export function DatePickerInput({
  id: idProp,
  label,
  placeholder,
  value: valueProp,
  defaultValue,
  onChange,
  onDateChange,
  onBlur,
  className,
  disabled,
  required,
  inputFormat = "iso",
  "aria-invalid": ariaInvalid,
}: DatePickerInputProps) {
  const generatedId = React.useId();
  const id = idProp ?? generatedId;
  const isControlled = valueProp !== undefined;
  const resolvedPlaceholder =
    placeholder ?? (inputFormat === "dmy" ? "DD/MM/YYYY" : "YYYY-MM-DD");

  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    defaultValue,
  );
  const date = isControlled ? valueProp : internalDate;

  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [inputValue, setInputValue] = React.useState(
    formatInputDate(date, inputFormat),
  );

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
  const [prevInputFormat, setPrevInputFormat] =
    React.useState<DatePickerInputFormat>(inputFormat);
  if (date !== prevDate || inputFormat !== prevInputFormat) {
    setPrevDate(date);
    setPrevInputFormat(inputFormat);
    setInputValue(formatInputDate(date, inputFormat));
    if (date) {
      setMonth(date);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);

    if (isCompleteInputDate(nextValue, inputFormat)) {
      const parsed = parseInputDate(nextValue, inputFormat);
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
      const parsed = parseInputDate(trimmed, inputFormat);
      if (parsed) {
        setInputValue(formatInputDate(parsed, inputFormat));
        setDate(parsed);
        setMonth(parsed);
      } else {
        setInputValue(formatInputDate(date, inputFormat));
      }
    }

    onBlur?.(event);
  };

  const handleCalendarSelect = (selected: Date | undefined) => {
    const normalized = selected ? toLocalDateOnly(selected) : undefined;
    setDate(normalized);
    setInputValue(formatInputDate(normalized, inputFormat));
    setOpen(false);
  };

  const field = (
    <InputGroup>
      <InputGroupInput
        id={id}
        name={id}
        value={inputValue}
        placeholder={resolvedPlaceholder}
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
