import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Componente compartilhado para campos de formulário
 * Elimina duplicação de estrutura de formulários nas páginas
 */

export interface BaseFieldProps {
  label: string
  id?: string
  className?: string
  required?: boolean
  error?: string
  description?: string
}

export interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export interface TextareaFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  rows?: number
}

export interface SelectFieldProps extends BaseFieldProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
}

// Componente base para wrapper de campo
const FieldWrapper = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    label: string
    id?: string
    required?: boolean
    error?: string
    description?: string
    className?: string
  }
>(({ children, label, id, required, error, description, className }, ref) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div ref={ref} className={cn("space-y-2", className)}>
      <Label 
        htmlFor={fieldId} 
        className={cn(
          "text-sm font-medium text-foreground",
          required && "after:content-['*'] after:ml-1 after:text-destructive"
        )}
      >
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
})
FieldWrapper.displayName = "FieldWrapper"

// Campo de input
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, id, type = 'text', value, onChange, placeholder, disabled, required, error, description, className }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <FieldWrapper
        label={label}
        id={fieldId}
        required={required}
        error={error}
        description={description}
        className={className}
      >
        <Input
          ref={ref}
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "bg-secondary border-border",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </FieldWrapper>
    )
  }
)
InputField.displayName = "InputField"

// Campo de textarea
export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, id, value, onChange, placeholder, disabled, rows = 3, required, error, description, className }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <FieldWrapper
        label={label}
        id={fieldId}
        required={required}
        error={error}
        description={description}
        className={className}
      >
        <Textarea
          ref={ref}
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={cn(
            "bg-secondary border-border",
            error && "border-destructive focus-visible:ring-destructive"
          )}
        />
      </FieldWrapper>
    )
  }
)
TextareaField.displayName = "TextareaField"

// Campo de select
export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ label, id, value, onChange, options, placeholder, disabled, required, error, description, className }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <FieldWrapper
        label={label}
        id={fieldId}
        required={required}
        error={error}
        description={description}
        className={className}
      >
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger 
            ref={ref}
            className={cn(
              "bg-secondary border-border",
              error && "border-destructive focus-visible:ring-destructive"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldWrapper>
    )
  }
)
SelectField.displayName = "SelectField"

// Hook para gerenciar estado de formulário
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [values, setValues] = React.useState<T>(initialState)
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({})
  
  const setValue = React.useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [key]: value }))
    // Limpar erro quando o usuário começar a digitar
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }, [errors])
  
  const setError = React.useCallback(<K extends keyof T>(key: K, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }))
  }, [])
  
  const clearError = React.useCallback(<K extends keyof T>(key: K) => {
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])
  
  const setFieldTouched = React.useCallback(<K extends keyof T>(key: K, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [key]: isTouched }))
  }, [])
  
  const reset = React.useCallback((newState?: Partial<T>) => {
    setValues(newState ? { ...initialState, ...newState } : initialState)
    setErrors({})
    setTouched({})
  }, [initialState])
  
  const validate = React.useCallback((validators: Partial<Record<keyof T, (value: T[keyof T]) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true
    
    Object.entries(validators).forEach(([key, validator]) => {
      if (validator) {
        const error = validator(values[key as keyof T])
        if (error) {
          newErrors[key as keyof T] = error
          isValid = false
        }
      }
    })
    
    setErrors(newErrors)
    return isValid
  }, [values])
  
  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    clearError,
    setTouched: setFieldTouched,
    reset,
    validate,
    hasErrors: Object.keys(errors).length > 0
  }
}

// Validadores comuns
export const validators = {
  required: (message: string = 'Este campo é obrigatório') => 
    (value: any) => !value || (typeof value === 'string' && !value.trim()) ? message : undefined,
    
  email: (message: string = 'Email inválido') => 
    (value: string) => {
      if (!value) return undefined
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value) ? undefined : message
    },
    
  minLength: (min: number, message?: string) => 
    (value: string) => {
      if (!value) return undefined
      return value.length >= min ? undefined : message || `Mínimo de ${min} caracteres`
    },
    
  maxLength: (max: number, message?: string) => 
    (value: string) => {
      if (!value) return undefined
      return value.length <= max ? undefined : message || `Máximo de ${max} caracteres`
    },
    
  number: (message: string = 'Deve ser um número válido') => 
    (value: string) => {
      if (!value) return undefined
      return !isNaN(Number(value)) ? undefined : message
    },
    
  positiveNumber: (message: string = 'Deve ser um número positivo') => 
    (value: string) => {
      if (!value) return undefined
      const num = Number(value)
      return !isNaN(num) && num > 0 ? undefined : message
    },
    
  date: (message: string = 'Data inválida') => 
    (value: string) => {
      if (!value) return undefined
      const date = new Date(value)
      return !isNaN(date.getTime()) ? undefined : message
    }
}

// Componente de grupo de campos (para layouts mais complexos)
export const FieldGroup = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    title?: string
    description?: string
    className?: string
  }
>(({ children, title, description, className }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-4", className)}>
      {title && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
})
FieldGroup.displayName = "FieldGroup"