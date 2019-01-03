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

const M = Math
const Sin = M.sin
// const Cos = M.cos
// const Sqrt = M.sqrt
// const Pow = M.pow
const PI = M.PI
// const Round = M.round
export default class Wave {
  constructor(el, options = {}) {
    this.el = el || document.body
    this.canvas = null
    this.ctx = null
    this.end = false
    
    const scale = this.getCanvasScale()
    const lineWidth = 2 * scale,
      width = (options.width || 250) * scale,
      height = (options.height || 250) * scale,
      r = width / 2,
      cR = r - 9 * lineWidth,
      axisLength = 2 * r - 16 * lineWidth, // Sin 图形长度
      range = 0.4, // 浪幅
      data = options.data || 50,
      colors = options.colors || ['#00B993', '#101822'],
      step = options.step || 20,
      waveupsp = data / step
    this.options = Object.assign({
      class: '',
      axisLength,
      waveWidth: axisLength / 9, // 波浪宽
      range,
      nowrange: range,
      xoffset: 8 * lineWidth,
      swing: 0, // 周期偏移量,速度
      nowdata: 0,
      // waveupsp: 0.0001, // 水波上涨速度
      amend: 0.0001, // 用于修正数值偏差
      step,
      waveupsp,
      // 圆动画初始参数
      arcStack: [], // 圆栈
      bR: r - 8 * lineWidth,
      soffset: -(PI / 2), // 圆动画起始位置
      colors,
      waveColor: colors[0],
      waveBorder: 'transparent',
      waveStyle: {
        color: colors[0],
        border: 'transparent',
        opacity: 0.8
      },
      textStyle: {
        fontWeight: 'bold',
        fontSize: 0.5 * cR,
        fontFamily: 'sans-serif', //  'serif' , 'monospace', 'Arial', 'Courier New', 'Microsoft YaHei'
        color: '#f6b71e',
        textAlign: 'center',
        offset: [r + 5, r + 10]
      },
      outerCircle: {
        show: true,
        radius: cR + 7,
        center: [r, r],
        lineWidth: 1.5,
        color: colors[0],
        opacity: 0.2
      },
      innerCircle: {
        show: true,
        radius: cR + 3,
        center: [r, r],
        lineWidth: 5,
        color: colors[1]
      },
      processCircle: {
        show: true,
        radius: cR + 4,
        center: [r, r],
        lineWidth: 5,
        color: colors[0]
      },
      clipCircle: {
        radius: cR + 2,
        center: [r, r]
      },
      data: data, // ~~ 向下取整
      radius: r,
      cR,
      width,
      height,
      lineWidth
      // ...options
    }, options)
    this.init()
  }
  init() {
    const {
      width,
      height
    } = this.options
    this.canvas = document.createElement('canvas')
    this.canvas.className = `_wave ${this.options.class}`
    // const scale = this.getCanvasScale()
    const scale = 1.5
    this.el.appendChild(this.canvas)
    this.canvas.style.width = width + 'px'
    this.canvas.style.height = height + 'px'
    this.canvas.width = width * scale
    this.canvas.height = height * scale
    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(scale, scale)
    this.render()
  }
  getCanvasScale() {
    const ratio = 'devicePixelRatio'
    if (!(ratio in window)) return 1
    return window[ratio] > 1 ? window[ratio] : 1
  }
  // 波浪
  drawSine() {
    this.ctx.beginPath()
    this.ctx.save()
    const {
      xoffset,
      axisLength,
      waveWidth,
      nowrange,
      radius,
      cR,
      nowdata,
      swing,
      waveStyle,
      width
    } = this.options
    const Stack = [] // 记录起始点和终点坐标
    for (let i = xoffset; i <= xoffset + axisLength; i += 20 / axisLength) {
      const x = swing + (xoffset + i) / waveWidth
      const y = Sin(x) * nowrange
      const dx = i
      const dy = 2 * cR * (1 - nowdata) + (radius - cR) - (waveWidth * y)
      this.ctx.lineTo(dx, dy)
      Stack.push([dx, dy])
    }
    // 获取初始点和结束点
    var startP = Stack[0]
    // var endP = Stack[Stack.length - 1]
    this.ctx.lineTo(xoffset + axisLength, width)
    this.ctx.lineTo(xoffset, width)
    this.ctx.lineTo(startP[0], startP[1])
    this.ctx.globalAlpha = waveStyle.opacity
    this.ctx.fillStyle = waveStyle.color
    this.ctx.strokeStyle = waveStyle.border

    this.ctx.fill()
    this.ctx.restore()
  }

  drawText() {
    this.ctx.globalCompositeOperation = 'source-over'
    const {
      textStyle,
      radius,
      nowdata
    } = this.options
    const txt = (nowdata * 100).toFixed(2) + '%'
    this.ctx.font = `${textStyle.fontWeight} ${textStyle.fontSize}px ${textStyle.fontFamilyt}`
    // const fonty = radius + textStyle.fontSize/2
    const fonty = radius + textStyle.fontSize / 2
    const fontx = radius - txt.toString().length * textStyle.fontSize / 128
    this.ctx.fillStyle = textStyle.color
    this.ctx.textAlign = textStyle.textAlign
    // this.ctx.fillText(txt, textStyle.offset[0], textStyle.offset[1])
    this.ctx.fillText(txt, fontx, fonty)
  }

  drawCircle(opt) {
    this.ctx.beginPath()
    // this.ctx.save()
    this.ctx.lineWidth = opt.lineWidth
    this.ctx.strokeStyle = opt.color
    this.ctx.globalAlpha = opt.opacity || 1
    this.ctx.arc(opt.center[0], opt.center[1], opt.radius, 0, 2 * Math.PI)
    this.ctx.stroke()
    this.ctx.restore()
  }
  // 进度圆
  processCircle(opt, data) {
    this.ctx.beginPath()
    this.ctx.strokeStyle = opt.color
    this.ctx.lineWidth = opt.lineWidth
    //使用这个使圆环两端是圆弧形状
    this.ctx.lineCap = 'round'
    this.ctx.arc(opt.center[0], opt.center[1], opt.radius, 0 * (Math.PI / 180.0) - (Math.PI / 2), (data * 360) * (Math.PI / 180.0) - (Math.PI / 2))
    this.ctx.stroke()
    this.ctx.save()
  }
  //裁剪中间水圈
  clipCircle(opt) {
    this.ctx.beginPath()
    // this.ctx.save()
    this.ctx.arc(opt.center[0], opt.center[1], opt.radius, 0, 2 * Math.PI, false)
    // this.ctx.restore()
    this.ctx.clip()
  }
  //渲染canvas
  render() {
    if (!this.ctx && !this.canvas && !this.render) return
    const {
      range,
      width,
      height,
      data,
      outerCircle,
      innerCircle,
      processCircle,
      nowdata,
      clipCircle
    } = this.options
    this.ctx.clearRect(0, 0, width, height)
    //最外面淡黄色圈
    if (outerCircle.show) {
      this.drawCircle(outerCircle)
    }
    //倒数第二层圆
    if (innerCircle.show) {
      this.drawCircle(innerCircle)
    }
    // 进度圆
    if (processCircle.show) {
      this.processCircle(processCircle, nowdata)
    }
    //裁剪中间水圈  
    this.clipCircle(clipCircle)
    // 控制波幅

    if (data >= 0.85) {
      if (this.options.nowrange > range / 4) {
        const t = range * 0.01
        this.options.nowrange -= t
      }
    } else if (data <= 0.1) {
      if (this.options.nowrange < range * 1.5) {
        const t = range * 0.01
        this.options.nowrange += t
      }
    } else {
      if (this.options.nowrange <= range) {
        const t = range * 0.01
        this.options.nowrange += t
      }
      if (this.options.nowrange >= range) {
        const t = range * 0.01
        this.options.nowrange -= t
      }
    }
    const gap = data - this.options.nowdata
    if (M.abs(parseFloat(gap.toFixed(4))) >= 0.0001) {
      if (gap > 0.001) {
        this.options.nowdata += this.options.waveupsp
      } else if (gap <= 0.001 && gap > 0) {
        this.options.nowdata += this.options.amend
      }
      if (gap < -0.001) {
        this.options.nowdata -= this.options.waveupsp
      } else if (gap >= -0.001 && gap < 0) {
        this.options.nowdata -= this.options.amend
      }
    } else {
      this.end = true
    }
    
    // console.log(data - this.options.nowdata, 'data - this.options.nowdata', data, this.options.nowdata)
    this.options.swing += 0.07
    // 开始水波动画
    this.drawSine()
    // 写字
    this.drawText()
    if (this.end) return
    requestAnimationFrame(_ => {
      this.render && this.render()
    })
  }
  destroy() {
    document.body.removeChild(this.canvas)
    this.render = null
    this.canvas = null
    this.cxt = null
  }
}
