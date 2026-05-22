# Form Controllers

This directory contains accessible form controller wrappers for use with `react-hook-form`. These components integrate seamlessly with `zod` schemas and usage of `FormShell` (context).

## Components

### FormInput

Wrapper for `Input` component.

```tsx
<FormInput
  control={control}
  name="email"
  label="Email Address"
  placeholder="Enter your email"
/>
```

### FormSelect

Wrapper for `Select` component.

```tsx
<FormSelect
  control={control}
  name="role"
  label="Role"
  options={roleOptions}
  searchable
/>
```

### FormMultiSelect

Wrapper for `MultiSelect` component.

```tsx
<FormMultiSelect
  control={control}
  name="permissions"
  label="Permissions"
  options={permissionOptions}
/>
```

### FormPasswordInput

Wrapper for `PasswordInput` component.

```tsx
<FormPasswordInput
  control={control}
  name="password"
  label="Password"
/>
```

### FormPhoneInput

Wrapper for `PhoneInput` component.

```tsx
<FormPhoneInput
  control={control}
  name="phoneNumber"
  label="Phone Number"
/>
```

### FormAmount

Wrapper for `AmountInput` component.

```tsx
<CustomAmount
  control={control}
  name="salary"
  label="Salary"
  options={{ numeral: true }}
/>
```

### FormTextarea

Wrapper for `Textarea` component.

```tsx
<FormTextarea
  control={control}
  name="description"
  label="Description"
/>
```

### FormCheckbox

Wrapper for `Checkbox` component.

```tsx
<FormCheckbox
  control={control}
  name="terms"
  label="I agree to terms"
/>
```

## Accessibility

All controllers automatically handle:
- `aria-invalid` state based on errors.
- Association of label and input via `id`.
- Display of error messages using `FieldError`.
- Display of description using `FieldDescription`.
