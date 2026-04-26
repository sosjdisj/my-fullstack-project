import { ref } from 'vue';
import { get, getModifiedFields, patch } from '@/api/request';
import { ElMessage } from 'element-plus'
import type { Mark } from '@/types/index'
import { buildArticleFormData, deepEqual, isFormDataComplete } from '@/utils/helpers';


export function useSetting() {
    const SETTING_PATH = '/profile'

    const userData = ref<Mark>({
        username: '',
        signature: '',
        phone: '',
        cover: null
    })
    const checkForChanges = ref({ ...userData.value })
    const coverFile = ref<File | null>(null)

    const isSubmitting = ref(false);

    const handProfile = async () => {

        if (isSubmitting.value) return ElMessage.warning('正在提交中，请稍候...');

        if (!isFormDataComplete(userData.value, ['cover'])) return ElMessage.warning('数据没有填写完整');

        const hasChanged = !deepEqual(checkForChanges.value, userData.value);

        if (!hasChanged) return ElMessage.warning('与原数据相同哦！');

        //筛选出变动了的数据
        const modifiedFields = getModifiedFields(userData.value, checkForChanges.value, {
            exclude: ['cover']
        })

        const finalFormData = new FormData()

        buildArticleFormData(finalFormData, modifiedFields, coverFile.value);

        isSubmitting.value = true

        const result = await patch(SETTING_PATH, finalFormData)

        if (result.success) {
            isSubmitting.value = false;
            ElMessage.success(result.message)
            // 更新检查变更的基准数据
            checkForChanges.value = { ...userData.value };
        }
    }

    const handleAvatarUpload = async (file: File, previewUrl: string) => {
        coverFile.value = file
        userData.value.cover = previewUrl
    }

    const fetchSettings = async () => {
        const result = await get(SETTING_PATH)
        if (result.success) {
            userData.value = result.data.data
            checkForChanges.value = { ...result.data.data }
        }
    }

    return {
        userData,
        handProfile,
        handleAvatarUpload,
        fetchSettings
    }
}