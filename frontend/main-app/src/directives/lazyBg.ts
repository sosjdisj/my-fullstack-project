// Vue API 由 unplugin-auto-import 全局注入；Directive 类型不在重导出列表，需保留
import type { Directive } from "vue"

//在el上扩展自定义属性
declare global {
  interface HTMLImageElement {
    _observer?: IntersectionObserver
  }
}


const lazy: Directive<HTMLImageElement, string> = {
  mounted(el: HTMLImageElement, binding: DirectiveBinding<string>) {
    loadImage(el, binding.value)
  },

  updated(el: HTMLImageElement, binding: DirectiveBinding<string>) {
    const realSrc = binding.value
    if (realSrc && el.src !== realSrc) {
      loadImage(el, realSrc)
    }
  },

  unmounted(el) {
    const observer = el._observer
    if (observer){
      observer.unobserve(el)
      observer.disconnect()
    }
  }
}

function loadImage(el: HTMLImageElement, realSrc: string) {
  if (!realSrc) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = realSrc
        observer.unobserve(img)
      }
    })
  }, { threshold: 0.01 });

  el._observer = observer
  observer.observe(el)
}

export default lazy