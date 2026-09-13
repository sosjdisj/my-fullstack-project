// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import { validateLogin, handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { useFormValidation } from '@/composables/useFormValidation'
import { sha256 } from '@/utils/crypto'

export function useReset() {
  const router = useRouter()

  const ResetData = reactive({
    email: '',
    password: ''
  })

  const { errors, updateField, navigateWithClearErrors, hasNoErrors } = useFormValidation(ResetData)

  const handUpdataEmail = (newValue: string) => {
    updateField('email', newValue)
  }

  const handUpdataPassword = (newValue: string) => {
    updateField('password', newValue)
  }

  const checkField = (fieldName: any) => {
    validateField(fieldName, ResetData)
  }

  const Torouter = () => {
    navigateWithClearErrors('/login')
  }

  const isLoading = ref(false)

  const handleReset = async () => {
    const result = validateLogin(ResetData)
    handleValidationResult(result)

    if (!hasNoErrors()) return

    isLoading.value = true
    try {
      const hashedPassword = await sha256(ResetData.password)
      const resetPayload = {
        email: ResetData.email,
        password: hashedPassword
      }
      const response = await post('/auth/reset-password', resetPayload)

      if (response.success) {
        ElMessage.success(response.message)
        router.replace('/login')
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    errors,
    isLoading,
    handUpdataEmail,
    handUpdataPassword,
    checkField,
    Torouter,
    handleReset
  }
}
