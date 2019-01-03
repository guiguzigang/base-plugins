
# table-scroll 
用于table表格滚动的插件;

使用：
```js
import TableScroll 'base-plugin-js/table-scroll'
const tableScroll = new TableScroll(document.querySelector('#table'))
tableScroll.run()
tableScroll.destroy()
```

其中有针对elementui的方法elTableScroll，需要传入vue模板的ref;
```js
import {elTableScroll} 'base-plugin-js/table-scroll'
// 在获取到数据后使用
this.tableScroll = elTableScroll(this.$refs.table)

// 销毁
destroyed() {
  this.tableScroll.destroy()
},
```

# storage

默认使用
```js
// 默认输出为storage（sessionStorage）
import storage, {localStorage} from 'base-plugin-js/storage'

storage.set('key', 'value')

storage.get('key')

// 获取到之后回调
storage.get('key', value => {
  console.log(value)
})

// 清空
storage.clear()

// 删除
storage.remove('key')

// 监听storage的设置事件
window.addEventListener('setItemEvent', evt => {
  console.log(evt.oldValue)
  console.log(evt.value)
  console.log(evt.key)
})

// localStorage 与storage方法相同
```

# Wave水波纹插件

使用
```js
import Wave from 'base-plugin-js/wave'
const wave = new Wave({
  data: 0.5,
  width: 100,
  height: 100
})
```

销毁
```js
wave.destroy()
```
