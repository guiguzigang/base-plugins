import Vue from 'vue'
const isServer = Vue.prototype.$isServer
const ieVersion = isServer ? 0 : Number(document.documentMode)
const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g
const MOZ_HACK_REGEXP = /^moz([A-Z])/

/* istanbul ignore next */
const camelCase = function (name) {
  return name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter
  }).replace(MOZ_HACK_REGEXP, 'Moz$1')
}

// 剔除空格
const trim = function (string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '')
}

// 使dom绑定事件 兼容主流浏览器
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

// 使dom删除事件 兼容主流浏览器
/* istanbul ignore next */
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

export function prevent(e) {
  const oEvent = e || window.event
  if (oEvent.preventDefault) {
    oEvent.preventDefault()
  }
  return oEvent
}

// 使鼠标滚轮事件 兼容主流浏览器
export function wheelEvent(el, callback) {
  if (window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
    on(el, 'DOMMouseScroll', wheel)
  } else {
    on(el, 'mousewheel', wheel)
  }

  function wheel(ev) {
    const oEvent = prevent(ev)
    const delta = oEvent.detail ? oEvent.detail > 0 : oEvent.wheelDelta < 0
    callback && callback.call(this, delta, oEvent)
    return false
  }
}

/**
 * 使requestAnimationFrame 兼容主流浏览器
 */
export const requestAnimationFrame = (function () {
  if (!window.requestAnimationFrame) {
    return (
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        return window.setTimeout(callback, 1000 / 60)
      }
    )
  }
  return window.requestAnimationFrame
})()

// 返回顶部
export function scrollTop(el, from = 0, to, duration = 500) {
  const difference = Math.abs(from - to)
  const step = Math.ceil(difference / duration * 50)
  scroll(el, from, to, step)
}
/**
 * [scroll 滚动条从start滚动到end]
 * @param  {[type]} el    [要滚动元素]
 * @param  {[type]} start [开始位置]
 * @param  {[type]} end   [结束位置]
 * @param  {[type]} step  [滚动的步长]
 * @return {[type]}       [description]
 */
export function scroll(el, start, end, step = 50) {
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
  requestAnimationFrame(() => scroll(el, d, end, step))
}

/**
 * [getImageNaturalSize 获取图片的真实高度]
 * @param  {[type]} img [图片dom元素]
 * @return {[type]}     [description]
 */
export function getImageNaturalSize(img) {
  return new Promise((resolve, reject) => {
    if (img.naturalWidth) {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    } else {
      const image = new Image()
      image.src = img.src
      on(image, 'load', _ => {
        resolve({
          width: image.width,
          height: image.height
        })
      })
    }
  })
}

// 绑定dom事件，只执行一次
export const once = function (el, event, fn) {
  const listener = function () {
    if (fn) {
      fn.apply(this, arguments)
    }
    off(el, event, listener)
  }
  on(el, event, listener)
}

/**
 * el是包含cls
 * @param {dom} el dom元素
 * @param {*} cls class名
 * @return {boolean}
 */
export function hasClass(el, cls) {
  if (!el || !cls) return false
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.')
  if (el.classList) {
    return el.classList.contains(cls)
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1
  }
};

/**
 * el元素添加class
 * @param {dom} el dom元素
 * @param {*} cls class名
 */
export function addClass(el, cls) {
  if (!el) return
  let curClass = el.className
  const classes = (cls || '').split(' ')

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.add(clsName)
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName
    }
  }
  if (!el.classList) {
    el.className = curClass
  }
};

/* istanbul ignore next */
export function removeClass(el, cls) {
  if (!el || !cls) return
  const classes = cls.split(' ')
  let curClass = ' ' + el.className + ' '

  for (let i = 0, j = classes.length; i < j; i++) {
    const clsName = classes[i]
    if (!clsName) continue

    if (el.classList) {
      el.classList.remove(clsName)
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ')
    }
  }
  if (!el.classList) {
    el.className = trim(curClass)
  }
}

/**
 * el dom 元素
 * attr: translateX translateY rsx rsy scaleX scaleY
 */
export function getTransform(el, attr) {
  const attrs = ['scaleX', 'rsx', 'rsy', 'scaleY', 'translateX', 'translateY']
  // const transform = el.style.transform.replace(/\s/g, '')
  const transform = getStyle(el, 'transform').replace(/\s/g, '')
  const matrix = transform.substring(7, transform.indexOf(')')).split(',')
  // console.log(transform, matrix)
  let has = false
  let value = 0
  attrs.forEach((item, index) => {
    if (!has) {
      if (item === attr) {
        has = true
        value = parseFloat(matrix[index]) || 0
      }
    }
  })
  return value
}

/**
 * 获取css样式
 * @param {dom} element dom元素
 * @param {*} styleName css属性，驼峰命名
 * @return {string|null} 属性值
 */
export const getStyle = ieVersion < 9 ? function (element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'styleFloat'
  }
  try {
    switch (styleName) {
      case 'opacity':
        try {
          return element.filters.item('alpha').opacity / 100
        } catch (e) {
          return 1.0
        }
      default:
        return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null)
    }
  } catch (e) {
    return element.style[styleName]
  }
} : function (element, styleName) {
  if (isServer) return
  if (!element || !styleName) return null
  styleName = camelCase(styleName)
  if (styleName === 'float') {
    styleName = 'cssFloat'
  }
  try {
    const computed = document.defaultView.getComputedStyle(element, '')
    return element.style[styleName] || computed ? computed[styleName] : null
  } catch (e) {
    return element.style[styleName]
  }
}

/**
 * 设置css样式
 * @param {dom} element dom元素
 * @param {string} styleName css属性，驼峰命名
 * @param {*} value css属性的值
 * @return {void}
 */
export function setStyle(element, styleName, value) {
  if (!element || !styleName) return

  if (typeof styleName === 'object') {
    for (const prop in styleName) {
      if (styleName.hasOwnProperty(prop)) {
        setStyle(element, prop, styleName[prop])
      }
    }
  } else {
    styleName = camelCase(styleName)
    if (styleName === 'opacity' && ieVersion < 9) {
      element.style.filter = isNaN(value) ? '' : 'alpha(opacity=' + value * 100 + ')'
    } else {
      element.style[styleName] = value
    }
  }
}

/**
 * 设置css样式
 * @param {dom} element dom元素
 * @param {styles} 样式对象，attr为驼峰命名
 */
export function setStyles(element, styles) {
  Object.keys(styles).forEach(attr => {
    setStyle(element, attr, styles[attr])
  })
}

/**
 * 获取dom元素data属性的数据，如果有val,则设置data-[name]的属性为val
 * @param {dom} el dom元素
 * @param {string} name data-[name]
 * @param {string|void} val 设置data-[name] 的值
 * @return {string|void}
 */
export function getData(el, name, val) {
  const prefix = 'data-'
  if (val) {
    return el.setAttribute(prefix + name, val)
  }
  return el.getAttribute(prefix + name)
}

/**
 * 获取元素距离父元素上、下、左、右的距离
 * @param {dom} el dom元素
 * @return {object} {top, left, bottom, right}
 */
export function getRect(el) {
  if (el instanceof window.SVGElement) {
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    return {
      top: el.offsetTop,
      left: el.offsetLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

const elementStyle = document.createElement('div').style

const vendor = (_ => {
  const transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  }
  for (const k in transformNames) {
    if (elementStyle[transformNames[k]] !== undefined) {
      return k
    }
  }
  return false
})()

export function prefixStyle(style) {
  if (vendor === false) return false
  if (vendor === 'standard') return style
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}

export function getElementLeft(element) {
  if (element.getBoundingClientRect) {
    return element.getBoundingClientRect().left
  }
  let actualLeft = element.offsetLeft
  let current = element.offsetParent
  while (current !== null) {
    actualLeft += current.offsetLeft
    current = current.offsetParent
  }
  return actualLeft
}
export function getElementTop(element) {
  if (element.getBoundingClientRect) {
    return element.getBoundingClientRect().top
  }
  let actualTop = element.offsetTop
  let current = element.offsetParent
  while (current !== null) {
    actualTop += current.offsetTop
    current = current.offsetParent
  }
  return actualTop
}

/**
 * 多行超出元素高度显示 ..., 且添加title显示全部内容
 * @param {dom} el 处理的dom元素
 * @param {number|void} row 最多行数
 */
export function overflowEllipsis(el, row) {
  const width = el.clientWidth
  const height = el.clientHeight
  const lineHeight = parseInt(getStyle(el, 'lineHeight'))
  const fontSize = parseInt(getStyle(el, 'fontSize'))
  let data = el.getAttribute('title')
  if (!data) {
    data = el.innerText
    el.setAttribute('title', data)
  }
  row = row || height / lineHeight
  const maxLength = ~~(width * row / fontSize)
  if (data.length >= maxLength) {
    el.innerText = data.slice(0, maxLength - 3) + '...'
  } else {
    el.innerText = data
  }
}

/**
 * 获取文本在页面上展示的实际的宽度 与 高度
 * @param {String} text
 * @param {String} fontSize
 * @param {String} fontFamily
 * @return {Object} {width, height}
 */
export function textSize(text, fontSize = '14px', fontFamily = 'inherit') {
  const span = document.createElement('span')
  const result = {}
  result.width = span.offsetWidth
  result.height = span.offsetHeight
  span.style.visibility = 'hidden'
  span.style.fontSize = fontSize
  span.style.fontFamily = fontFamily
  span.style.display = 'inline-block'
  if (typeof span.textContent !== 'undefined') {
    span.textContent = text
  } else {
    span.innerText = text
  }
  document.body.appendChild(span)
  result.width = parseFloat(window.getComputedStyle(span).width) - result.width
  result.height = parseFloat(window.getComputedStyle(span).height) - result.height
  document.body.removeChild(span)
  return result
}
