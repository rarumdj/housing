# Custom Components

This directory contains reusable custom components built on top of shadcn/ui primitives.

## List of Components

- [AmountInput](#amountinput)
- [IconButton](#iconbutton)
- [MultiSelect](#multiselect)
- [PasswordInput](#passwordinput)
- [PhoneInput](#phoneinput)
- [Select](#select)

## AmountInput

A numeric input component that formats values with currency/number delimiters using `cleave-zen`.

```tsx
import { AmountInput } from "@/components/custom/amount-input";

<AmountInput
  placeholder="Enter amount"
  onChange={(rawValue) => console.log(rawValue)} // Returns raw numeric string
/>
```

## IconButton

A button component extending the standard `Button` that simplifies adding icons and loading states.

```tsx
import { IconButton } from "@/components/custom/icon-button";
import { Plus } from "lucide-react";

<IconButton icon={<Plus />} iconPlacement="left" loading={isLoading}>
  Add Item
</IconButton>
```

## MultiSelect

A powerful multi-select component based on `shadcn-multi-select-component`.

See full documentation here: [https://shadcn-multi-select-component.vercel.app/](https://shadcn-multi-select-component.vercel.app/)

```tsx
import { MultiSelect } from "@/components/custom/multi-select";

<MultiSelect
  options={options}
  onValueChange={setSelected}
  defaultValue={selected}
  placeholder="Select options"
  variant="inverted"
/>
```

## PasswordInput

A password input field with a toggle button to show/hide the password.

```tsx
import { PasswordInput, passwordChecklist } from "@/components/custom/password-input"

<PasswordInput
  placeholder="Enter password"
  checklist // Shows the password rules checklist
/>
```

The component also exports `passwordChecklist` for use in form schemas (e.g., Zod validation).

## PhoneInput

A phone number input component with country selection and flag display.

```tsx
import { PhoneInput } from "@/components/custom/phone-input"

<PhoneInput
  placeholder="Enter phone number"
  defaultCountry="NG"
  onChange={(value) => console.log(value)}
/>
```

## Select

A generic single-select component with optional search/filtering capabilities.

```tsx
import { Select } from "@/components/custom/select";

const options = [
  { label: "Option 1", value: "1" },
  { label: "Option 2", value: "2" },
];

<Select
  options={options}
  value={value}
  onChange={setValue}
  searchable
  placeholder="Select an option"
/>
```
