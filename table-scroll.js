import {requestAnimationFrame, on, off} from './dom'
import {sleep} from './utils'

// 用于el-table的滚动，需要放在table中的数据再页面中渲染完后执行
export async function elTableScroll(ref) {
  // 等待dom渲染
  await sleep(30)
  return new Promise(async (resolve, reject) => {
    const el = ref.$children[ref.$children.length - 1].$el.parentNode
    // .querySelector('.el-table__body')
    const tableScroll = new TableScroll(el)
    tableScroll.run()
    resolve(tableScroll)
  })
}

export default class TableScroll {
  constructor(el, duration = 10000000) {
    this.el = el
    this.duration = duration
    this.timer = null
  }

  run() {
    this.scrollBottom(this.el)
    this.watchScrollState()
  }

  watchScrollState() {
    on(this.el, 'mouseover', this.stop.bind(this))
    on(this.el, 'mouseout', this.regain.bind(this))
  }

  stop() {
    clearTimeout(this.timer)
    this.setAttr(this.el, 'data-scroll', 'no')
  }

  // 恢复滚动
  regain() {
    this.timer = setTimeout(_ => {
      this.setAttr(this.el, 'data-scroll', 'yes')
      if (this.el.getAttribute('data-scroll-dir') === 'bottom') {
        this.scrollBottom(this.el, this.el.scrollTop)
      } else {
        this.scrollTop(this.el)
      }
    }, 1000)
  }

  destory() {
    off(this.el, 'mouseouver', this.stop)
    off(this.el, 'mouseout', this.regain)
  }

  setAttr(el, key, value) {
    if (el.getAttribute(key) !== value) {
      el.setAttribute(key, value)
    }
  }

  scrollBottom(el, start = 0, end) {
    end = end || el.scrollHeight - el.clientHeight
    const difference = Math.abs(start - end)
//     const step = Math.ceil(difference / this.duration * 50)
    const step = parseFloat((difference / this.duration * 50 / 10000).toFixed(4))
    this.setAttr(this.el, 'data-scroll', 'yes')
    this.setAttr(this.el, 'data-scroll-dir', 'bottom')
    this.scroll(this.el, start, end, step)
  }

  scrollTop(el, start, end = 0) {
    start = start || el.scrollTop
    var difference = Math.abs(start - end)
    var step = Math.ceil(difference / 1000 * 50)
    this.setAttr(el, 'data-scroll', 'yes')
    this.setAttr(el, 'data-scroll-dir', 'top')
    this.scroll(el, start, end, step)
  }

  scroll(el, start, end, step) {
    if (el.getAttribute('data-scroll') === 'no') return
    if (start === end) return

    // 从上往下滚
    let d = (start + step > end) ? end : start + step
    // 从下往上滚
    if (start > end) {
      d = (start - step < end) ? end : start - step
    }

    if (el === window) {
      window.scrollTo(d, d)
    } else {
      el.scrollTop = d
    }

    if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
      this.scrollTop(el)
    } else if (el.scrollTop <= 0 && d <= 0) {
      this.scrollBottom(el)
    } else {
      requestAnimationFrame(() => this.scroll(el, d, end, step))
    }
  }
}
