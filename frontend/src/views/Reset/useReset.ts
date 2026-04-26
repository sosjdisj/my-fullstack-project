import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { validateLogin, handleValidationResult } from '@/utils/validation'
import { post } from '@/api/request'
import { ElMessage } from 'element-plus'
import { useFormValidation } from '@/composables/useFormValidation'

export function useReset() {
  const router = useRouter()
  const route = useRoute()

  const ResetData = reactive({
    username: ''
  })

  const { errors, updateField, validateSingleField, navigateWithClearErrors, hasNoErrors } = useFormValidation(ResetData)

  const handUpdataUsername = (newValue: string) => {
    updateField('username', newValue)
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
      const result = await post(route.path, ResetData)
      if (result) ElMessage.success(result.message)
      router.replace('/login')
    }
  }

  return {
    ResetData,
    errors,
    handUpdataUsername,
    checkField,
    Torouter,
    handleReset
  }
}
