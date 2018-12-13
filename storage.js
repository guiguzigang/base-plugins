import {on} from './dom'

const KEY = 'bpj_key_'

class Store {
  constructor(store) {
    this.prefix = KEY
    const store = store || 'sessionStorage'
    this.store = window[store]
  }

  set(key, value, fn) {
    this._setItem(key, value)
    
    fn && fn()
  }
  _setItem(key, value) {
    const setItemEvent = new Event('setItemEvent')
    setItemEvent.oldValue = this.get(key)
    setItemEvent.value = value
    setItemEvent.key = key
    window.dispatchEvent(setItemEvent)
    try {
      value = JSON.stringify(value)
    } catch (e) {
      value = value // eslint-disable-line
    }
    this.store.setItem(this.prefix + key, value)
  }
  watch(callback) {
    on(window, 'setItemEvent', callback)
  }
  get(key, fn) {
    if (!key) {
      throw new Error('沒有找到key!')
    }
    if (typeof key === 'object') {
      throw new Error('key不能是一个对象')
    }
    let value = this.store.getItem(this.prefix + key)
    if (value) {
      try {
        value = JSON.parse(value)
      } catch (e) {
        value = value // eslint-disable-line
      }
      fn && fn(value)
      return value
    }
  }
  remove(key) {
    if (toString.call(key) === '[object Array]') {
      key.forEach((item, index) => {
        this.store.removeItem(this.prefix + item)
      })
    } else if (toString.call(key) === '[object String]') {
      this.store.removeItem(this.prefix + key)
    }
  }
  clear() {
    this.store.clear()
  }
}

export const localStorage = new Store('localStorage')
export default new Store()
