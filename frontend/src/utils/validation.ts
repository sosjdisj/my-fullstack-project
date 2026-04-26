import { reactive } from "vue"
import type { FormField, LoginResult } from '../types/index'

// 错误信息存储
const errors: LoginResult = reactive({
    username: '',
    password: '',
    confirmpassword: '',
    email: '',
    phone: ''
})

// 定时器存储
const timers: Record<keyof LoginResult, number | null> = {
    username: null,
    password: null,
    confirmpassword: null,
    email: null,
    phone: null
}

// 密码验证规则配置
const PASSWORD_CONFIG = {
    minLength: 8,
    maxLength: 20,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
    specialChars: '!@#$%^&*'
}

// 手机号验证规则配置
const PHONE_CONFIG = {
    pattern: /^1[3-9]\d{9}$/,
    length: 11
}

export function getPasswordErrorMsg(password: string): string | null {
    if (!password) {
        return '密码不能为空'
    }

    if (password.length < PASSWORD_CONFIG.minLength) {
        return `密码长度不能少于${PASSWORD_CONFIG.minLength}位`
    }

    if (password.length > PASSWORD_CONFIG.maxLength) {
        return `密码长度不能超过${PASSWORD_CONFIG.maxLength}位`
    }

    if (!PASSWORD_CONFIG.pattern.test(password)) {
        return `密码必须同时包含字母、数字和特殊符号（${PASSWORD_CONFIG.specialChars}）`
    }

    return null
}

export function validatePhone(phone: string): string | null {
    if (!phone) {
        return '手机号不能为空'
    }

    const trimmedPhone = phone.trim()

    if (!/^\d+$/.test(trimmedPhone)) {
        return '手机号只能包含数字'
    }

    if (trimmedPhone.length !== PHONE_CONFIG.length) {
        return `手机号必须为${PHONE_CONFIG.length}位数字`
    }

    if (!PHONE_CONFIG.pattern.test(trimmedPhone)) {
        return '手机号格式不正确，请输入有效的11位手机号'
    }

    return null
}

export function validateUsername(username: string): string | null {
    if (!username) {
        return '用户名不能为空'
    }

    if (username.trim() !== username) {
        return '用户名不能包含首尾空格'
    }

    if (/^\d+$/.test(username)) {
        return '用户名不能全为数字'
    }

    if (username.length < 2 || username.length > 20) {
        return '用户名长度应在2-20个字符之间'
    }

    return null
}

export function validateLogin(LoginData: {
    username?: string
    password?: string
    phone?: string
    confirmpassword?: string
    email?: string
}): LoginResult {
    const { username, password, phone, confirmpassword, email } = LoginData

    const result: LoginResult = {
        username: '',
        password: '',
        confirmpassword: '',
        email: '',
        phone: ''
    }

    if (username !== undefined) {
        const error = validateUsername(username)
        if (error) result.username = error
    }

    if (password !== undefined) {
        const error = getPasswordErrorMsg(password)
        if (error) result.password = error
    }

    if (phone !== undefined) {
        const error = validatePhone(phone)
        if (error) result.phone = error
    }

    if (confirmpassword !== undefined) {
        const error = getPasswordErrorMsg(confirmpassword)
        if (error) {
            result.confirmpassword = error
        } else if (password !== undefined && confirmpassword !== password) {
            result.confirmpassword = '两次输入密码不相同'
        }
    }

    if (email !== undefined) {
        if (!email) {
            result.email = '邮箱不能为空'
        } else {
            const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (!emailReg.test(email)) {
                result.email = '邮箱格式不正确，示例：user@example.com'
            }
        }
    }

    return result
}

export function isLoginDataValid(loginData: {
    username?: string
    password?: string
    phone?: string
    confirmpassword?: string
    email?: string
}): boolean {
    const result = validateLogin(loginData)
    return Object.keys(result).length === 0
}

export function handleValidationResult(result: LoginResult) {
    (Object.keys(result) as Array<keyof LoginResult>).forEach(item => {
        if (result[item] === null) {
            errors[item] = ''
            if (timers[item]) {
                clearTimeout(timers[item]!)
                timers[item] = null
            }
        } else {
            errors[item] = result[item] as string
            if (timers[item]) {
                clearTimeout(timers[item]!)
            }
            timers[item] = setTimeout(() => {
                errors[item] = ''
                timers[item] = null
            }, 1500)
        }
    })
}

export function validateField(fieldName: FormField, Register: LoginResult) {
    const fullResult = validateLogin(Register)
    if (fullResult[fieldName] !== null) {
        errors[fieldName] = fullResult[fieldName]
        if (timers[fieldName]) {
            clearTimeout(timers[fieldName]!)
        }
        timers[fieldName] = setTimeout(() => {
            errors[fieldName] = ''
            timers[fieldName] = null
        }, 1500)
    }
}

export function clearErrors(errors: LoginResult) {
    Object.keys(errors).forEach(item => {
        if (errors[item as keyof LoginResult] !== '') {
            errors[item as keyof LoginResult] = ''
        }
    })
}

export function hasNoErrors(errors: LoginResult): boolean {
    return Object.values(errors).every(value => value === '')
}

export { errors }
