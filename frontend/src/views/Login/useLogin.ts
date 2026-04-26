import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validateLogin, handleValidationResult, validateField } from '@/utils/validation'
import { post } from '@/api/request'
import { useCounterStore } from '@/stores/counter'
import { ElMessage } from 'element-plus'
import { useFormValidation } from '@/composables/useFormValidation'
import { saveUserInfo } from '@/utils/helpers'
import { sha256 } from '@/utils/crypto'

export function useLogin() {
  const router = useRouter()
  const route = useRoute()
  const store = useCounterStore()

  const LoginData = reactive({
    username: '',
    password: ''
  })

  const { errors, updateField, navigateWithClearErrors, hasNoErrors } = useFormValidation((LoginData))

  const handUpdataUsername = (newValue: string) => {
    updateField('username', newValue)
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

  const handleLogin = async () => {
    const result = validateLogin(LoginData)
    handleValidationResult(result)

    if (!hasNoErrors()) return

    const hashedPassword = await sha256(LoginData.password)
    const loginPayload = {
      username: LoginData.username,
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
      router.replace('/home')
    }
  }

  return {
    LoginData,
    errors,
    handUpdataUsername,
    handUpdataPassword,
    ToregisterUser,
    checkPassword,
    handleLogin
  }
}
