// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import { validateLogin, handleValidationResult } from '@/utils/validation'
import { post } from '@/api/request'
import { useFormValidation } from '@/composables/useFormValidation'
import { sha256 } from '@/utils/crypto'

export function useReset() {
  const router = useRouter()
  const route = useRoute()

  const smsCode =ref('')

  const ResetData = reactive({
    username: '',
    password: '',
  })

  const { errors, updateField, validateSingleField, navigateWithClearErrors, hasNoErrors } = useFormValidation(ResetData)

  const handUpdataUsername = (newValue: string) => {
    updateField('username', newValue)
  }

  const handUpdataPassword = (newValue: string) => {
    updateField('password', newValue)
  }

  const checkField = (fieldName: any) => {
    validateSingleField(fieldName)
  }

  const Torouter = () => {
    navigateWithClearErrors('/login')
  }

  const handleReset = async () => {
    const result = validateLogin(ResetData)
    handleValidationResult(result)

    if (hasNoErrors()) {
      const hashedPassword = await sha256(ResetData.password)
      const payload = {
        username: ResetData.username,
        password: hashedPassword,
        smsCode
      }
      const result = await post(route.path, payload)
      if (result) ElMessage.success(result.message)
      router.replace('/login')
    }
  }

  return {
    ResetData,
    errors,
    smsCode,
    handUpdataUsername,
    handUpdataPassword,
    checkField,
    Torouter,
    handleReset
  }
}
