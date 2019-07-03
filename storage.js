const KEY = 'act_key_'

class Store {
  constructor(store) {
    this.prefix = KEY
    // store = store || 'sessionStorage'
    // this.store = window[store]
    this.store = window.sessionStorage
    this.data = {}
    this._storageHandle()
  }

  _storageHandle() {
    window.addEventListener('storage', e => {
      // console.log(e, 'storage')
      const {key, newValue} = e
      if (newValue === null) return false
      if (key === `${KEY}setLocalStorage`) {
        const data = JSON.parse(newValue)
        if (this.isEmpty(data)) {
          this.data = {}
        } else {
          for (let k in data) {
            let value = data[k]
            // try {
            //   value = value
            // } catch (e) {}
            this.data[k] = value
            this.store.setItem(k, value)
          }
        }
      } else if (key === `${KEY}getLocalStorage`) {
        this._setLocalStorgaeDataHandler()
      }
    })

    if (this.isEmpty(this.data)) {
      this._getLocalStorgaeDataHandler()
    }
  }

  _setLocalStorgaeDataHandler() {
    window.localStorage.setItem(`${KEY}setLocalStorage`, JSON.stringify(this.data))
    window.localStorage.removeItem(`${KEY}setLocalStorage`)
  }

  _getLocalStorgaeDataHandler() {
    window.localStorage.setItem(`${KEY}getLocalStorage`, Date.now())
    window.localStorage.removeItem(`${KEY}getLocalStorage`)
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
      // value = value
    }
    key = this.prefix + key
    this.store.setItem(key, value)
    this.data[key] = value
    this._setLocalStorgaeDataHandler()
  }
  watch(callback) {
    console.log(callback)
    window.addEventListener('setItemEvent', callback, false)
  }

  get(key, fn) {
    if (!key) {
      throw new Error('沒有找到key!')
    }
    if (typeof key === 'object') {
      throw new Error('key不能是一个对象')
    }
    key = this.prefix + key
    let value = this.store.getItem(key)

    if (value) {
      try {
        value = JSON.parse(value)
      } catch (e) {
        // value = value
      }
      fn && fn()
      return value
    }
  }

  remove(key) {
    if (toString.call(key) === '[object Array]') {
      key.forEach((item, index) => {
        this.store.removeItem(this.prefix + item)
        delete this.data[this.prefix + item]
      })
    } else if (toString.call(key) === '[object String]') {
      this.store.removeItem(this.prefix + key)
      delete this.data[this.prefix + key]
    }

    this._setLocalStorgaeDataHandler()
  }
  clear() {
    this.store.clear()
    this.data = {}
    this._setLocalStorgaeDataHandler()
  }

  isEmpty(data) {
    return !Object.keys(data).length
  }
}

export default new Store()

// export const localStorage = new Store('localStorage')
