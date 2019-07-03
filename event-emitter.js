
/**
 * 简单的事件触发器
 *
 * const emitter = new EventEmitter()
 * const cry = _ => console.log('cry')
 * emitter.once('cry', cry)
 * emitter.on('cry', cry)
 * emitter.on('cry', cry)
 * emitter.on('cry', cry)
 * emitter.on('cry', cry)
 * emitter.emit('cry', '哭')
 * emitter.emit('cry', '哭')
 */
export default class EventEmitter {
  constructor() {
    this._events = {}
  }

  on(eventName, callback) {
    this._events[eventName] ? this._events[eventName].push(callback) : (this._events[eventName] = [callback])
  }

  emit(eventName, ...args) {
    // eslint-disable-next-line
    this._events[eventName] && this._events[eventName].forEach(cb => cb(...args))
  }
  /**
   * 销毁指定名称的监听事件
   * @param {String} eventName
   * @param {Function} callback 不传callback 则销毁eventName对应的所有事件
   */
  off(eventName, callback) {
    if (callback) {
      this._events[eventName] && (this._events[eventName] = this._events[eventName].filter(cb => cb !== callback))
    } else {
      this._events[eventName] = null
      delete this._events[eventName]
    }
  }

  once(eventName, callback) {
    const fn = _ => {
      callback()
      this.off(eventName, fn)
    }
    this.on(eventName, fn)
  }
}
