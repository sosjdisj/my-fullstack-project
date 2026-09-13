// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import { useUserStore } from '@/stores/user'
import { validateLogin } from '@/utils/validation'
import { handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { useFormValidation } from '@/composables/useFormValidation'
import { saveUserInfo } from '@/utils/helpers'
import { sha256 } from '@/utils/crypto'

export function useRegister() {
  const router = useRouter()
  const store = useUserStore()

  const Register = reactive({
    username: '',
    password: '',
    confirmpassword: '',
    email: ''
  })

  const { errors, updateField, navigateWithClearErrors,
    hasNoErrors } = useFormValidation(Register)

  const handUpdataUsername = (newValue: string) => {
    updateField('username', newValue)
  }

  const handUpdataEmail = (newValue: string) => {
    updateField('email', newValue)
  }

  const handUpdataPassword = (newValue: string) => {
    updateField('password', newValue)
  }

  const handUpdataConfirmPassword = (newValue: string) => {
    updateField('confirmpassword', newValue)
  }

  const checkPassword = (fieldName: any) => {
    validateField(fieldName, Register)
  }

  const isLoading = ref(false)

  const GoregisterUser = async () => {
    const result = validateLogin(Register)
    handleValidationResult(result)

    if (hasNoErrors()) {
      isLoading.value = true
      try {
        const hashedPassword = await sha256(Register.password)
        const registerPayload = {
          username: Register.username,
          password: hashedPassword,
          email: Register.email,
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
      } finally {
        isLoading.value = false
      }
    }
  }

  const Torouter = () => {
    navigateWithClearErrors('/login')
  }

  return {
    errors,
    Register,
    isLoading,
    checkPassword,
    GoregisterUser,
    Torouter,
    handUpdataUsername,
    handUpdataEmail,
    handUpdataPassword,
    handUpdataConfirmPassword,
  }
}
