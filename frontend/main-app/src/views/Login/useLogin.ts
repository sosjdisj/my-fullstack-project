// Vue/Vue Router API 由 unplugin-auto-import 全局注入
import { validateLogin, handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { useUserStore } from '@/stores/user'
import { useFormValidation } from '@/composables/useFormValidation'
import { saveUserInfo } from '@/utils/helpers'
import { sha256 } from '@/utils/crypto'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const store = useUserStore()

  const LoginData = reactive({
    account: '',
    password: ''
  })

  const { errors, updateField, navigateWithClearErrors, hasNoErrors } = useFormValidation((LoginData))

  const handUpdataAccount = (newValue: string) => {
    updateField('account', newValue)
  }

  const handUpdataPassword = (newValue: string) => {
    updateField('password', newValue)
  }

  const ToregisterUser = (path: string) => {
    navigateWithClearErrors(path)
  }

  const checkPassword = (fieldName: any) => {
    validateField(fieldName, LoginData)
  }

  const isLoading = ref(false)

  const handleLogin = async () => {
    const result = validateLogin(LoginData)
    handleValidationResult(result)

    if (!hasNoErrors()) return

    isLoading.value = true
    try {
      const hashedPassword = await sha256(LoginData.password)
      const loginPayload = {
        account: LoginData.account,
        password: hashedPassword
      }
      const bool = await post('/auth/login', loginPayload)
      if (bool.success) {
        const { username, avatar, token } = bool.data.data

        saveUserInfo(store, {
          username,
          avatar,
          token
        })

        ElMessage.success(bool.message)
        // 登录成功后优先跳回原目标页面，无 redirect 时回首页
        const redirect = (route.query.redirect as string) || '/home'
        router.replace(redirect)
      }
    } finally {
      isLoading.value = false
    }
  }

  return {
    LoginData,
    errors,
    isLoading,
    handUpdataAccount,
    handUpdataPassword,
    ToregisterUser,
    checkPassword,
    handleLogin
  }
}
