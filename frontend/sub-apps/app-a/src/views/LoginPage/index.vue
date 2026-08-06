<template>
  <div class="login-page">
    <div class="login-card">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
        返回
      </button>
      <h1 class="login-title">欢迎登录</h1>
      <p class="login-subtitle">音乐时光，从这里开始</p>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-item">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" @blur="validateField(FIELD_NAMES.username)" />
          <Transition name="error-fade">
            <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
          </Transition>
        </div>

        <div class="form-item">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码"
            @blur="validateField(FIELD_NAMES.password)" />
          <Transition name="error-fade">
            <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
          </Transition>
        </div>

        <button type="submit" class="submit-btn">登录</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useLoginPage } from './useLoginPage';

  const {
    router,
    form,
    errors,
    FIELD_NAMES,
    validateField,
    handleSubmit
  } = useLoginPage()
</script>

<style lang="less" scoped>
  @glass-bg: rgba(255, 255, 255, 0.4);
  @glass-border: rgba(255, 255, 255, 0.5);
  @accent-color: #667eea;
  @text-main: #2d3436;

  .login-page {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .login-card {
    width: 420px;
    padding: 45px 40px;
    background: @glass-bg;
    backdrop-filter: blur(20px);
    border: 1px solid @glass-border;
    border-radius: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: #636e72;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    margin-bottom: 20px;
    transition: color 0.3s ease;

    &:hover {
      color: @accent-color;
    }
  }

  .login-title {
    font-size: 28px;
    font-weight: 800;
    color: @text-main;
    text-align: center;
    margin-bottom: 8px;
  }

  .login-subtitle {
    font-size: 14px;
    color: #636e72;
    text-align: center;
    margin-bottom: 35px;
  }

  .login-form {
    .form-item {
      margin-bottom: 22px;

      label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: @text-main;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        padding: 12px 16px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.6);
        font-size: 14px;
        color: @text-main;
        outline: none;
        transition: all 0.3s ease;

        &::placeholder {
          color: #b2bec3;
        }

        &:focus {
          border-color: @accent-color;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }

      .error-msg {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        color: #e74c3c;
      }

      .error-fade-enter-active,
      .error-fade-leave-active {
        transition: all 0.3s ease;
      }

      .error-fade-enter-from,
      .error-fade-leave-to {
        opacity: 0;
        transform: translateY(-4px);
      }
    }

    .submit-btn {
      width: 100%;
      padding: 13px 0;
      margin-top: 10px;
      border: none;
      border-radius: 14px;
      background: @accent-color;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 18px rgba(102, 126, 234, 0.35);

      &:hover {
        background: #5a6fd6;
        transform: translateY(-2px);
        box-shadow: 0 8px 22px rgba(102, 126, 234, 0.45);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
</style>
