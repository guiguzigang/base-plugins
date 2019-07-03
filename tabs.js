import { deepClone } from './util'
import storage from '@/libs/storage'

export default class Tabs {
  constructor(initialState = {}) {
    this.states = {
      active: null,
      list: [],
      activeValue: '',
      // 通过tabs中的什么键来过滤, 默认为name,这里tab中key的值就是el-tabs中的 el-tab-pane 的 name值
      key: 'name',
      // 存到sessionStroage中的key，不传则不存在sessionStroage中
      storeKey: '',
      mode: 'append', // 插入模式 append 向后加入 | insert 前面插入
      debug: process.env.NODE_ENV === 'development'
    }

    for (let prop in initialState) {
      if (initialState.hasOwnProperty(prop) && this.states.hasOwnProperty(prop)) {
        this.states[prop] = initialState[prop]
      }
    }

    this.mutations = {
      add(states, tab) {
        if (!tab) return
        const flag =
          states.list.findIndex(
            item => item[states.key] === tab[states.key]
          ) === -1
        if (flag) {
          states.mode === 'append' ? states.list.push(tab) : states.list.unshift(tab)
        }
        states.active = tab
        states.activeValue = tab[states.key]
        saveStore(states)
      },
      setActive(states, value) {
        if (value) {
          states.active = states.list.find(item => item[states.key] === value)
          if (states.active) {
            states.activeValue = states.active[states.key]
          }
        } else {
          states.active = null
          states.activeValue = ''
        }
        saveStore(states)
      },
      setActiveToFirst(states, value) {
        if (value) {
          states.active = value
          states.activeValue = value[states.key]
        }
        const active = states.active,
          index = states.list.findIndex(item => item.name === active.name)

        if (index > -1) {
          states.list.splice(index, 1)
          states.list.unshift(active)
          saveStore(states)
        }
      },
      /**
       * 替换prevName的tab为 参数cur对应的tab
       * @param {Object} states
       * @param {String} 需要替换tab的唯一标记，默认为name
       * @param {Object} 替换后的tab对象
       */
      replace(states, prevName, cur) {
        if (!prevName && !cur && !cur.name) return
        const index = states.list.findIndex(item => item.name === prevName)
        states.list.splice(index, 1, cur)
        states.active = cur
        states.activeValue = cur.name
      },
      /**
       * 删除tabs中的一项
       * @param {Object} states
       * @param {String} value tab的唯一标记
       */
      remove(states, value) {
        if (!states.list.length) return
        const newTabs = []
        let index
        states.list.forEach((item, i) => {
          if (item[states.key] !== value) {
            newTabs.push(item)
          } else {
            index = i
          }
        })
        states.list = newTabs
        const len = states.list.length
        if (states.activeValue === value && len) {
          index = index > len - 1 ? len - 1 : index
          states.active = states.list[index]
          states.activeValue = states.active[states.key]
        }
        if (len === 0) {
          states.active = {}
          states.activeValue = ''
        }
        saveStore(states)
      },
      removeOther(states, value) {
        value = value || states.activeValue
        states.list = states.list.filter(item => item[states.key] === value)
        states.active = states.list[0]
        states.activeValue = states.active[states.key]
        saveStore(states)
      },
      clear(states) {
        states.list = []
        states.active = {}
        states.activeValue = ''
        saveStore(states)
      }
    }
  }

  commit(name, ...args) {
    const mutations = this.mutations
    if (mutations[name]) {
      const prevState = deepClone(this.states)

      mutations[name].apply(this, [this.states].concat(args))
      if (this.states.debug) {
        // console.group('mutation ' + name + formattedTime())
        console.groupCollapsed('mutation ' + name + formattedTime())
        console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState)
        console.log('%c mutation', 'color: #03A9F4; font-weight: bold', {
          type: name,
          payload: args
        })
        console.log('%c next state', 'color: #4CAF50; font-weight: bold', deepClone(this.states))
        console.groupEnd()
      }
    } else {
      throw new Error(`Action not found: ${name}!`)
    }
  }
}

function saveStore(value) {
  value.storeKey && storage.set(value.storeKey, value)
}

function formattedTime() {
  const time = new Date()
  return ' @ ' + (pad(time.getHours(), 2)) + ':' + (pad(time.getMinutes(), 2)) + ':' + (pad(time.getSeconds(), 2)) + '.' + (pad(time.getMilliseconds(), 3))
}

function pad(num, maxLength) {
  return repeat('0', maxLength - num.toString().length) + num
}

function repeat(str, times) {
  return (new Array(times + 1)).join(str)
}
