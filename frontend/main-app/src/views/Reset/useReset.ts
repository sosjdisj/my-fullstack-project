// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import { validateLogin, handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { useFormValidation } from '@/composables/useFormValidation'
import { sha256 } from '@/utils/crypto'

export function useReset() {
  const router = useRouter()

  const ResetData = reactive({
    phone: '',
    password: ''
  })

  const smsCode = ref('')

  const { errors, updateField, navigateWithClearErrors, hasNoErrors } = useFormValidation(ResetData)

  const handUpdataPhone = (newValue: string) => {
    updateField('phone', newValue)
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

  const sendCaptcha = async (countdownCallback: () => void) => {
    if (!ResetData.phone) {
      ElMessage.warning('请先输入手机号')
      return
    }

    try {
      const result = await post('/sendCode', { phone: ResetData.phone })
      if (result.success) {
        ElMessage.success('验证码已发送')
        countdownCallback()
      }
    } catch (error) {
      ElMessage.error('验证码发送失败，请稍后重试')
    }
  }

  const handleReset = async () => {
    const result = validateLogin(ResetData)
    handleValidationResult(result)

    if (!hasNoErrors()) return

    const hashedPassword = await sha256(ResetData.password)
    const resetPayload = {
      phone: ResetData.phone,
      password: hashedPassword,
      code: smsCode.value
    }
    const response = await post('/auth/reset-password', resetPayload)

    if (response.success) {
      ElMessage.success(response.message)
      router.replace('/login')
    }
  }

  return {
    errors,
    smsCode,
    handUpdataPhone,
    handUpdataPassword,
    checkField,
    Torouter,
    handleReset,
    sendCaptcha
  }
}
