/**
 * 生成三次贝塞尔曲线的path，可直接作为在svg中path的d的值
 * @export
 * @param {*} x1 起始点x
 * @param {*} y1 起始点y
 * @param {*} x2 终止点x
 * @param {*} y2 终止点y
 * @param {number} [dx = (x2 - x1) / 2] // 控制x轴延伸，值越大，延伸越大
 * @param {*} [angle = 0] // 控制y轴延伸与弧度向上还是向下 正值弧度向上，反之弧度向下
 * @returns path
 */
export function bezierCurveTo(x1, y1, x2, y2, dx = (x2 - x1) / 2, angle = 0) {
  if (y1 === y2) return `M ${x1} ${y1} L ${x2} ${y2}`
  const radian = angle * Math.PI / 180
  const dy = Math.tan(radian) * dx
  // const cpx1 = x1 + dx
  const cpx1 = x1 + (x2 - x1) / 4
  const cpy1 = y1 < y2 ? y1 - dy : y1 + dy
  const cpx2 = x2 - dx
  // const cpx2 = x2 - (x2 - x1) / 4
  const cpy2 = y1 < y2 ? y2 + dy : y2 - dy
  return `M ${x1} ${y1} C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${x2} ${y2}`
}
