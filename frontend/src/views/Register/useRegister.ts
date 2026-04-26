import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counter'
import { validateLogin } from '@/utils/validation'
import { handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { ElMessage } from 'element-plus'
import { useFormValidation } from '@/composables/useFormValidation'
import { saveUserInfo } from '@/utils/helpers'
import { sha256 } from '@/utils/crypto'

export function useRegister() {
  const router = useRouter()
  const store = useCounterStore()

  const Register = reactive({
    username: '',
    password: '',
    confirmpassword: '',
    phone: ''
  })

  const captchaCode = ref('')

  const { errors, updateField, navigateWithClearErrors,
    hasNoErrors } = useFormValidation(Register)

  const handUpdataUsername = (newValue: string) => {
    updateField('username', newValue)
  }

  const handUpdataPassword = (newValue: string) => {
    updateField('password', newValue)
  }

  const handUpdataConfirmPassword = (newValue: string) => {
    updateField('confirmpassword', newValue)
  }

  const handUpdataPhone = (newValue: string) => {
    updateField('phone', newValue)
  }

  const checkPassword = (fieldName: any) => {
    validateField(fieldName, Register)
  }

  const GoregisterUser = async () => {
    const result = validateLogin(Register)
    handleValidationResult(result)

    if (hasNoErrors()) {
      const hashedPassword = await sha256(Register.password)
      const registerPayload = {
        username: Register.username,
        password: hashedPassword,
        phone: Register.phone,
        code: captchaCode.value,
      }
      const result = await post('/auth/register', registerPayload)

      if (result.success) {
        const { username, avatar, token } = result.data.data

        saveUserInfo(store, {
          username,
          avatar,
          token
        })

        ElMessage.success(result.message)
        router.replace('/home')
      }
    }
  }

  const sendCaptcha = async (countdownCallback: () => void) => {
    if (!Register.phone) {
      ElMessage.warning('请先输入手机号')
      return
    }

    try {
      const result = await post('/sendCode', { phone: Register.phone })
      if (result.success) {
        ElMessage.success('验证码已发送')
        countdownCallback()
      }
    } catch (error) {
      ElMessage.error('验证码发送失败，请稍后重试')
    }
  }

  const Torouter = () => {
    navigateWithClearErrors('/login')
  }

  return {
    errors,
    captchaCode,
    Register,
    checkPassword,
    GoregisterUser,
    Torouter,
    sendCaptcha,
    handUpdataUsername,
    handUpdataPassword,
    handUpdataConfirmPassword,
    handUpdataPhone,
  }
}
