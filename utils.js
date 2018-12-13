
// 线转驼峰  foo-bar => fooBar
export const lineToHump = str => str.replace(/(\-(\w))/g, (all, letter) => letter.toUpperCase())

// 驼峰转线  fooBar => foo-bar
export const humpToLine = str => str.replace(/([A-Z])/g, '-$1').toLowerCase()

// 首字母大写
export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

/**
 * [getLength 获得字符串实际长度，中文2，英文1]
 * @param  {[type]} str [要获得长度的字符串]
 * @return {[type]}     [description]
 */
export function getLength(str) {
  const len = str.length
  let realLength = 0
  let charCode = -1
  for (let i = 0; i < len; i++) {
    charCode = str.charCodeAt(i)
    if (charCode >= 0 && charCode <= 128) realLength += 1
    else realLength += 2
  }
  return realLength
}
/**
 * 截取字符串，中英文都能用
 * @param str：需要截取的字符串
 * @param len: 需要截取的长度
 */
export function cutstr(str, len) {
  const str_len = str.length
  let str_length = 0
  let str_cut = ''

  //如果给定字符串小于指定长度，则返回源字符串；
  for (let i = 0; i < str_len; i++) {
    let a = str.charAt(i)
    str_length++
    if (escape(a).length > 4) {
      //中文字符的长度经编码之后大于4
      str_length++
    }
    str_cut = str_cut.concat(a)
    if (str_length >= len) {
      str_cut = str_cut.concat('...')
      return str_cut
    }
  }
  if (str_length < len) {
    return str
  }
}

export function rand(min, max) {
  return Math.random() * (max - min) + min
}

export function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

// 生成随机数字
export function randomNum(num) {
  num = num || 1000
  return Math.ceil(Math.random() * num)
}

export function randomRangeNum(min, max) {
  return Math.floor((Math.random() * (max - min)) + min)
}

export function copyArray(source, array) {
  let index = -1
  const length = source.length

  array || (array = new Array(length))
  while (++index < length) {
    array[index] = source[index]
  }
  return array
}

export function isDate(date) {
  if (date === null || date === undefined) return false
  if (isNaN(new Date(date).getTime())) return false
  if (Array.isArray(date)) return false // deal with `new Date([ new Date() ]) -> new Date()`
  return true
}

export function getWeekNumber(src) {
  if (!isDate(src)) return null
  const date = new Date(src.getTime())
  date.setHours(0, 0, 0, 0)
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
  // January 4 is always in week 1.
  const week = new Date(date.getFullYear(), 0, 4)
  // Adjust to Thursday in week 1 and count number of weeks from date to week 1.
  // Rounding should be fine for Daylight Saving Time. Its shift should never be more than 12 hours.
  return 1 + Math.round(((date.getTime() - week.getTime()) / 86400000 - 3 + (week.getDay() + 6) % 7) / 7)
}

// 合并相同索引的数组
export function mergeEqualIndexArray(arr) {
  let result = []
  arr.forEach(item => {
    item.forEach((d, i) => {
      let a = result[i] = result[i] || []
      a.push(d)
    })
  })
  return result
}

// 相同索引的数组相加
export function equalIndexValueSum(arr) {
  let result = []
  arr.forEach(item => {
    item.forEach((d, i) => {
      result[i] = result[i] ? result[i] + d : d
    })
  })
  return result
}

// 随机排列
export function shuffle(array) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}

// 深度克隆
export function deepClone(source) {
  if (!source && typeof source !== 'object') {
    throw new Error('error arguments', 'shallowClone')
  }
  const targetObj = source.constructor === Array ? [] : {}
  for (let keys in source) {
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        targetObj[keys] = source[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepClone(source[keys])
      } else {
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}

// 将数组对象的key转换为label 与 value的select类型的label与value对象
export function reverseDataToSelectList(list, labelKey, valueKey) {
  const l = []
  list.forEach(item => {
    l.push({
      label: item[labelKey],
      value: valueKey ? item[valueKey] : item[labelKey]
    })
  })
  return l
}

export function uuid(len, radix = 10) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  let uuid = []
  let i
  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix]
    }
  } else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

/**
 * 睡眠函数
 * @param {number} time
 */
export const sleep = time => new Promise(resolve => setTimeout(resolve, time))

// 防抖函数
// 当持续触发事件时，一定时间段内没有再触发事件，事件处理函数才会执行一次，如果设定的时间到来之前，又一次触发了事件，就重新开始延时
export function debounce(fn, delay = 1000) {
  let timer = null
  return function () {
    if (timer !== null) {
      clearTimeout(timer)
    }
    const context = this
    timer = setTimeout(_ => {
      fn.apply(context, arguments)
    }, delay)
  }
}

// 节流函数：当持续触发事件时，保证一定时间段内只调用一次事件处理函数
export function throttle(fn, delay = 1000) {
  let timer = null
  let start = Date.now()
  return function () {
    const cur = Date.now()
    const wait = delay - (cur - start)
    const context = this
    clearTimeout(timer)
    if (wait <= 0) {
      fn.aplly(context, arguments)
      start = Date.now()
    } else {
      timer = setTimeout(_ => {
        fn.apply(context, arguments)
      }, delay)
    }
  }
}