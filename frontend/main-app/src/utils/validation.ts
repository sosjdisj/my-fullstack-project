// Vue API 由 unplugin-auto-import 全局注入
import type { FormField, LoginResult } from '../types/index'

// 错误信息存储
const errors: LoginResult = reactive({
    username: '',
    password: '',
    confirmpassword: '',
    email: '',
    account: ''
})

// 定时器存储
const timers: Record<keyof LoginResult, number | null> = {
    username: null,
    password: null,
    confirmpassword: null,
    email: null,
    account: null
}

// 密码验证规则配置
const PASSWORD_CONFIG = {
    minLength: 8,
    maxLength: 20,
    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
    specialChars: '!@#$%^&*'
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

export function validateEmail(email: string): string | null {
    if (!email) {
        return '邮箱不能为空'
    }

    const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailReg.test(email)) {
        return '邮箱格式不正确，示例：user@example.com'
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

    if (username.includes('@')) {
        return '用户名不能包含 @ 符号'
    }

    if (/^\d+$/.test(username)) {
        return '用户名不能全为数字'
    }

    if (username.length < 2 || username.length > 20) {
        return '用户名长度应在2-20个字符之间'
    }

    return null
}

/** 登录账号校验：支持用户名或邮箱，含 @ 按邮箱规则校验 */
export function validateAccount(account: string): string | null {
    if (!account) {
        return '账号不能为空'
    }
    return account.includes('@') ? validateEmail(account) : validateUsername(account)
}

export function validateLogin(LoginData: {
    username?: string
    password?: string
    confirmpassword?: string
    email?: string
    account?: string
}): LoginResult {
    const { username, password, confirmpassword, email, account } = LoginData

    const result: LoginResult = {
        username: '',
        password: '',
        confirmpassword: '',
        email: '',
        account: ''
    }

    if (username !== undefined) {
        const error = validateUsername(username)
        if (error) result.username = error
    }

    if (account !== undefined) {
        const error = validateAccount(account)
        if (error) result.account = error
    }

    if (password !== undefined) {
        const error = getPasswordErrorMsg(password)
        if (error) result.password = error
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
        const error = validateEmail(email)
        if (error) result.email = error
    }

    return result
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

export function validateContent(
    text: string | undefined | null,
    options?: { min?: number; max?: number; name?: string; allowEmpty?: boolean; trim?: boolean }
): string | null {
    const { min = 1, max = 500, name = '内容', allowEmpty = false, trim = true } = options || {}

    const value = trim ? (text ?? '').trim() : (text ?? '')

    if (!value) {
        return allowEmpty ? null : `${name}不能为空`
    }

    if (value.length < min) return `${name}长度不能少于${min}个字符`
    if (value.length > max) return `${name}长度不能超过${max}个字符`

    return null
}

export { errors }
