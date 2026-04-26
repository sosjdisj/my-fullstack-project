<template>
  <div class="header-container" :class="{ 'header-opacity': store.header }">
    <div class="header-container-left">

      <ul class="header-container-left-ul">

        <h3 class="header-container-left-h3">我的主页</h3>

        <li v-for="item in plainMenus" :key="item.id" class="header-container-left-li1" :class="{
          active: isActiveRoute(item.path),
          'parent-active': isParentActive(item)
        }">

          <RouterLink :to="item.path">{{ item.name }}</RouterLink>

          <ul v-if="item.children" class="sub-menu-container">

            <li v-for="value in item.children" :key="value.id" class="header-container-left-li2"
              :class="{ active: isActiveRoute(value.path) }">
              <RouterLink :to="value.path">{{ value.name }}</RouterLink>
            </li>

          </ul>

        </li>
      </ul>
    </div>

    <div class="header-container-right">

      <div class="header-container-right-login" v-if="isTop">
        <RouterLink to="/login" class="login">登录</RouterLink>
      </div>

      <div class="icon">
        <el-icon :size="30" class="search-3d" @click="handleSearch">
          <Search />
        </el-icon>

        <PascalCase :active="showSearchInput" @close="handleSearch" />

      </div>

      <Avatar v-if="!isTop" :picture="!isTop" />

      <h3>{{ username }}</h3>

    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCounterStore } from '@/stores/counter'
  import { reactive, computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import Avatar from './Avatar.vue'
  import { Search } from '@element-plus/icons-vue'
  import PascalCase from '../ui/PascalCase.vue';

  const route = useRoute()

  const plainMenus = reactive([
    {
      name: '首页',
      path: '/home',
      id: '首页',
    },
    {
      name: '归档',
      path: '',
      id: '归档',
      children: [
        {
          name: '分类',
          path: '/categoryTagList/categories',
          id: '分类'
        },
        {
          name: '标签',
          path: '/categoryTagList/tags',
          id: '标签'
        },
        {
          name: '时间轴',
          path: '/timeline',
          id: '时间轴'
        }
      ]
    },
    {
      name: '其他',
      path: '',
      id: '其他',
      children: [
        {
          name: '树洞',
          path: '/treehole',
          id: '树洞'
        },
      ]
    },
    {
      name: '相册',
      path: '/gallery',
      id: '相册'
    },
    {
      name: '音乐',
      path: '/musicPlayer',
      id: '音乐'
    },
    {
      name: '助手',
      path: '/aiChat',
      id: '助手'
    }
  ])
  const store = useCounterStore()
  const username = computed(() => store.username ? store.username : '')
  const isTop = computed(() => !store.username)

  const showSearchInput = ref<boolean>(false)

  const isActiveRoute = (path: string): boolean => {
    // 对于音乐路由，需要检查是否以 /musicPlayer 开头
    if (path === '/musicPlayer') {
      return route.path.startsWith('/musicPlayer')
    }

    // 对于归档路由，检查是否在任何归档子页面下
    if (path === '/archive') {
      return route.path.startsWith('/categories') || route.path.startsWith('/tags') || route.path.startsWith('/timeline')
    }

    // 对于归档子路由，也要高亮对应的子菜单
    if (path === '/categories' || path === '/tags' || path === '/timeline') {
      return route.path === path
    }

    // 对于其他路由，检查是否完全匹配
    return route.path === path
  }

  const isParentActive = (item: any): boolean => {
    // 检查是否有子导航被选中，但父级本身不是当前路由
    if (item.children && item.children.length > 0) {
      // 对于归档导航
      if (item.path === '/archive') {
        const isChildActive = route.path.startsWith('/categories') || route.path.startsWith('/tags') || route.path.startsWith('/timeline')
        return isChildActive && route.path !== '/archive'
      }

      // 对于其他有子导航的项
      const isChildActive = item.children.some((child: any) => route.path === child.path)
      return isChildActive && route.path !== item.path
    }

    return false
  }
  const handleSearch = () => {
    showSearchInput.value = !showSearchInput.value
  }
</script>

<style scoped lang="less">
  // 核心变量
  @accent-blue: #00e5ff;
  @hover-bg: rgba(255, 255, 255, 0.06);
  @glass-border: rgba(255, 255, 255, 0.1);
  @text-secondary: rgba(255, 255, 255, 0.5);

  .header-container {
    width: 100%;
    height: 64px;
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    background: rgba(28, 30, 38, 0.6);
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid @glass-border;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &.header-opacity {
      transform: translateY(-100%);
    }

    .header-container-left {
      flex: 1;
      height: inherit;

      .header-container-left-ul {
        height: inherit;
        display: flex;
        align-items: center;
        padding-left: 32px;

        .header-container-left-h3 {
          font-size: 1.15rem;
          color: #fff;
          font-weight: 800;
          margin-right: 40px;
          background: linear-gradient(135deg, #fff 40%, rgba(255, 255, 255, 0.4));
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-container-left-li1 {
          height: 100%;
          padding: 0 10px;
          display: flex;
          align-items: center;
          position: relative;

          &>a {
            color: @text-secondary;
            font-size: 14px;
            font-weight: 500;
            padding: 6px 14px;
            border-radius: 10px;
            transition: all 0.3s ease;
            text-decoration: none;
          }

          // 悬停逻辑：显示二级菜单
          &:hover {
            &>a {
              color: #fff;
              background: @hover-bg;
            }

            .sub-menu-container {
              opacity: 1;
              visibility: visible;
              transform: translateX(-50%) translateY(0);
            }
          }

          &.active,
          &.parent-active {
            &>a {
              color: @accent-blue;
              background: rgba(0, 229, 255, 0.08);
              font-weight: 600;
            }
          }

          /* --- 二级菜单容器：更名为 sub-menu-container --- */
          .sub-menu-container {
            position: absolute;
            top: 100%; // 从导航栏底部无缝衔接
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            min-width: 140px;
            padding: 8px;
            list-style: none;

            // 物理背景框
            background: rgba(28, 30, 38, 0.6); // 较深的色值，确保文字清晰
            backdrop-filter: blur(20px);
            border: 1px solid @glass-border;
            border-radius: 16px;
            box-shadow:
              0 20px 40px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.05); // 增加超细内边框提升精致感

            // 动画效果
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);

            .header-container-left-li2 {
              border-radius: 8px;
              margin: 2px 0;
              transition: background 0.2s;

              a {
                display: block;
                padding: 10px 16px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
                text-align: center;
                text-decoration: none;
                transition: color 0.2s;
              }

              &:hover {
                background: rgba(255, 255, 255, 0.08);

                a {
                  color: @accent-blue;
                }
              }

              &.active a {
                color: @accent-blue;
                font-weight: 600;
                background: rgba(0, 229, 255, 0.05);
                border-radius: 6px;
              }
            }
          }
        }
      }
    }

    .header-container-right {
      display: flex;
      align-items: center;
      padding-right: 32px;
      gap: 20px;

      h3 {
        font-size: 13px;
        color: @text-secondary;
        font-weight: 500;
      }

      /* --- 登录按钮：胶囊光感设计 --- */
      .header-container-right-login {
        .login {
          display: block;
          padding: 8px 24px;
          border-radius: 100px;
          background: #ffffff;
          color: #34495e;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

          &:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
          }

          &:active {
            transform: translateY(0) scale(0.95);
          }
        }
      }

      .icon {
        color: @text-secondary;
        display: flex;
        align-items: center;
        cursor: pointer;
        transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        position: relative;

        &:hover {
          color: #fff;
          transform: scale(1.1);
        }
      }
    }
  }
</style>
