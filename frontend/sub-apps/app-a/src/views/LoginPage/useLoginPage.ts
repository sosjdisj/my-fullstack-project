import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { post } from '@/api/request'
import { saveUserInfo } from '@/composables/useAuth'
import { sha256 } from '@/utils/crypto'

export function useLoginPage() {
  const router = useRouter()
  const store = useUserStore()

  const form = reactive({
    username: '',
    password: ''
  })

  const errors = reactive<Record<string, string>>({
    username: '',
    password: ''
  })

  const FIELD_NAMES = {
    username: 'username',
    password: 'password'
  } as const

  const errorTimers = ref<Record<string, number | undefined>>({})

  /** 延时自动清除指定字段的错误提示 */
  const clearErrorAfterDelay = (field: string, delay = 3000) => {
    if (errorTimers.value[field]) {
      clearTimeout(errorTimers.value[field])
    }
    errorTimers.value[field] = setTimeout(() => {
      errors[field] = ''
    }, delay)
  }

  /** 校验单个字段，错误时自动触发延时清除 */
  const validateField = (field: 'username' | 'password') => {
    const value = form[field].trim()
    errors[field] = ''

    if (field === FIELD_NAMES.username) {
      if (!value) {
        errors[FIELD_NAMES.username] = '用户名不能为空'
      } else if (value.length < 3 || value.length > 20) {
        errors[FIELD_NAMES.username] = '用户名长度应为3-20位'
      } else if (!/^\w+$/.test(value)) {
        errors[FIELD_NAMES.username] = '用户名只能包含字母、数字和下划线'
      }
    }

    if (field === FIELD_NAMES.password) {
      if (!value) {
        errors[FIELD_NAMES.password] = '密码不能为空'
      } else if (value.length < 6 || value.length > 20) {
        errors[FIELD_NAMES.password] = '密码长度应为6-20位'
      }
    }

    if (errors[field]) {
      clearErrorAfterDelay(field)
    }

    return !errors[field]
  }

  /** 提交表单：整体校验通过后登录并跳转 */
  const handleSubmit = async () => {
    const isUsernameValid = validateField(FIELD_NAMES.username)
    const isPasswordValid = validateField(FIELD_NAMES.password)

    if (!isUsernameValid || !isPasswordValid) return ElMessage.error('请检查输入信息')

    const hashedPassword = await sha256(form.password)
    const loginPayload = {
      username: form.username,
      password: hashedPassword
    }
    const userData = await post('/auth/login', loginPayload)

    if (userData.success) {

      const { token, username, avatar } = userData.data.data

      saveUserInfo(store, { username, avatar, token })
      ElMessage.success(userData.message)

      // 登录成功后返回之前要访问的页面；无来源时回首页
      // 使用 replace 替换历史记录，避免用户通过浏览器后退再次回到登录页
      const redirect = router.currentRoute.value.query.redirect as string | undefined
      router.replace(redirect || '/')

    }
  }

  return {
    router,
    form,
    errors,
    FIELD_NAMES,
    validateField,
    handleSubmit
  }
}
