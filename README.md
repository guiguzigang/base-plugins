
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