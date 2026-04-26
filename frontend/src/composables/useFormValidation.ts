import { useRouter } from 'vue-router'
import type { FormField, LoginResult } from '@/types/index'
import { errors as AllServiceErrors, clearErrors, hasNoErrors, validateLogin, validateField, handleValidationResult } from '@/utils/validation'

export function useFormValidation<T extends LoginResult>(formData: T) {
  const router = useRouter()
  const errors = AllServiceErrors

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    formData[field] = value
  }

  const navigateWithClearErrors = (path: string) => {
    clearErrors(errors)
    router.replace(path)
  }

  const validateSingleField = (fieldName: keyof T) => {
    validateField(fieldName as FormField, formData as LoginResult)
  }

  return {
    errors,
    updateField,
    navigateWithClearErrors,
    hasNoErrors: () => hasNoErrors(errors),
    validateSingleField
  }
}
