<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  wheelName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['spin-end'])

const canvas = ref(null)
const canvasContainer = ref(null)
const spinning = ref(false)
const result = ref('')
const rotationAngle = ref(0)
const spinningTime = ref(0)

// 动态计算转盘尺寸
const canvasSize = ref(500)
const centerX = computed(() => canvasSize.value / 2)
const centerY = computed(() => canvasSize.value / 2)
const radius = computed(() => (canvasSize.value / 2) - 50)

// 使用ResizeObserver监听容器大小变化
let resizeObserver = null

// 修改触摸滑动方向为左右滑动
const handleTouchStart = (event) => {
  if (spinning.value || props.items.length === 0) return
  const startX = event.touches[0].clientX

  const handleTouchEnd = (endEvent) => {
    const endX = endEvent.changedTouches[0].clientX
    const deltaX = startX - endX

    // 向左滑动超过40px时启动转盘
    if (deltaX > 40) {
      spin()
    }

    canvas.value.removeEventListener('touchend', handleTouchEnd)
  }

  canvas.value.addEventListener('touchend', handleTouchEnd)
}

onMounted(() => {
  updateCanvasSize()
  drawWheel()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)

  // 使用ResizeObserver监听容器大小变化
  if (canvasContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateCanvasSize()
      drawWheel()
    })
    resizeObserver.observe(canvasContainer.value)
  }

  // 添加触摸事件监听
  if (canvas.value) {
    canvas.value.addEventListener('touchstart', handleTouchStart)
  }
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  // 移除触摸事件监听
  if (canvas.value) {
    canvas.value.removeEventListener('touchstart', handleTouchStart)
  }
})

const updateCanvasSize = () => {
  if (!canvasContainer.value) return

  // 确定容器宽度
  const containerWidth = canvasContainer.value.clientWidth

  // 在小屏幕上调整尺寸
  if (containerWidth < 500) {
    canvasSize.value = containerWidth
    if (canvas.value) {
      canvas.value.width = canvasSize.value
      canvas.value.height = canvasSize.value
    }
  } else {
    canvasSize.value = 500
    if (canvas.value) {
      canvas.value.width = 500
      canvas.value.height = 500
    }
  }
}

const handleResize = () => {
  // 使用requestAnimationFrame确保在浏览器下一次重绘之前调用
  requestAnimationFrame(() => {
    updateCanvasSize()
    drawWheel()
  })
}

const drawWheel = () => {
  if (!canvas.value || props.items.length === 0) return

  const ctx = canvas.value.getContext('2d')
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // 绘制转盘背景
  ctx.save()
  ctx.translate(centerX.value, centerY.value)
  ctx.rotate(rotationAngle.value)

  const sliceAngle = (2 * Math.PI) / props.items.length

  // 绘制外环
  ctx.beginPath()
  ctx.arc(0, 0, radius.value + 10, 0, 2 * Math.PI)
  ctx.fillStyle = '#f5f5f5'
  ctx.fill()
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 3
  ctx.stroke()

  props.items.forEach((item, index) => {
    // 绘制扇形
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius.value, index * sliceAngle, (index + 1) * sliceAngle)
    ctx.closePath()

    // 使用更美观的颜色
    const colorIndex = index % 8
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0',
      '#118AB2', '#FF9F1C', '#5F6CAF', '#FF5E5B'
    ]
    ctx.fillStyle = colors[colorIndex]
    ctx.fill()

    // 添加渐变和阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 5
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // 添加扇形边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 绘制文字
    ctx.save()
    ctx.rotate(index * sliceAngle + sliceAngle / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'

    // 调整文字大小
    const fontSize = Math.max(14, Math.min(18, radius.value / 10))
    ctx.font = `bold ${fontSize}px Arial, sans-serif`

    // 添加文字阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    // 限制文本长度
    let displayText = item.name
    if (displayText.length > 10 && radius.value < 150) {
      displayText = displayText.slice(0, 7) + '...'
    } else if (displayText.length > 15) {
      displayText = displayText.slice(0, 12) + '...'
    }

    ctx.fillText(displayText, radius.value - 25, 5)
    ctx.restore()
  })

  // 添加花纹效果 - 每个扇区添加装饰线
  props.items.forEach((_, index) => {
    ctx.save()
    ctx.rotate(index * sliceAngle + sliceAngle / 2)
    ctx.beginPath()
    ctx.moveTo(15, 0)
    ctx.lineTo(radius.value - 20, 0)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
  })

  ctx.restore()

  // 绘制中心点
  ctx.beginPath()
  ctx.arc(centerX.value, centerY.value, radius.value * 0.12, 0, 2 * Math.PI)
  // 中心点添加渐变
  const gradient = ctx.createRadialGradient(
      centerX.value, centerY.value, radius.value * 0.04,
      centerX.value, centerY.value, radius.value * 0.12
  )
  gradient.addColorStop(0, '#f8f8f8')
  gradient.addColorStop(1, '#e0e0e0')
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.strokeStyle = '#d0d0d0'
  ctx.lineWidth = 2
  ctx.stroke()

  // 添加内圆装饰
  ctx.beginPath()
  ctx.arc(centerX.value, centerY.value, radius.value * 0.07, 0, 2 * Math.PI)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

watch(() => props.items, drawWheel, { deep: true })
watch(() => rotationAngle.value, drawWheel)
watch(() => canvasSize.value, drawWheel)

const spin = () => {
  if (spinning.value || props.items.length === 0) return

  spinning.value = true
  result.value = ''

  // 改进旋转动画
  const spinDuration = 5500 // 增加持续时间
  const totalRotation = 360 * (6 + Math.random() * 6) // 增加旋转圈数
  const startTime = Date.now()
  spinningTime.value = 0

  const animate = () => {
    const elapsedTime = Date.now() - startTime
    spinningTime.value = elapsedTime

    if (elapsedTime < spinDuration) {
      // 改进缓动效果
      const progress = elapsedTime / spinDuration
      // 使用更平滑的缓动函数
      const easedProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
      rotationAngle.value = (totalRotation * easedProgress) * Math.PI / 180

      requestAnimationFrame(animate)
    } else {
      // 旋转结束
      const finalAngle = (totalRotation % 360) * Math.PI / 180
      rotationAngle.value = finalAngle

      // 计算结果
      const sliceAngle = (2 * Math.PI) / props.items.length
      // 指针指向顶部，所以需要调整计算方式
      const normalizedAngle = (finalAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
      // 顶部指针对应 3π/2 位置
      const pointerAngle = 3 * Math.PI / 2
      // 计算指针所指向的扇区
      const resultAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI)
      const resultIndex = Math.floor(resultAngle / sliceAngle)

      result.value = props.items[resultIndex % props.items.length].name
      spinning.value = false

      ElMessage({
        message: `恭喜您抽中了: ${result.value}`,
        type: 'success',
        duration: 3000,
        showClose: true
      })
      emit('spin-end', {
        result: result.value,
        time: new Date().toLocaleString()
      })
    }
  }

  animate()
}

defineExpose({ spin })
</script>

<template>
  <div class="lucky-wheel-container">
    <div class="canvas-container" ref="canvasContainer">
      <div class="pointer-container">
        <div class="pointer"></div>
      </div>
      <canvas
          ref="canvas"
          :width="canvasSize"
          :height="canvasSize"
          class="wheel-canvas"
      ></canvas>
    </div>
    <div class="controls">
      <el-button
          type="primary"
          size="large"
          @click="spin"
          :disabled="spinning || items.length === 0"
          :loading="spinning"
          class="spin-button"
          style="touch-action: manipulation"
      >
        {{ spinning ? '旋转中...' : '开始旋转' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.lucky-wheel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
}

.lucky-wheel-container h2 {
  color: #333;
  margin-bottom: 1rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.canvas-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  margin-top: 30px; /* 为指针留出空间 */
}

.wheel-canvas {
  border-radius: 50%;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
  max-width: 100%;
  border: 12px solid #f8f8f8;
  box-sizing: border-box;
  transition: transform 0.3s ease;
}

.pointer-container {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 50px;
  display: flex;
  justify-content: center;
  z-index: 10;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
}

.pointer {
  width: 40px;
  height: 40px;
  background: linear-gradient(to bottom, #ff4757 50%, #e71d36 50%);
  clip-path: polygon(50% 100%, 0 0, 100% 0);
  position: relative;
  transform-origin: center bottom;
  animation: pointer-bounce 2s ease-in-out infinite;
}

@keyframes pointer-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.pointer::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background-color: #ff4757;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.controls {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  width: 100%;
}

.spin-button {
  min-width: 150px;
  border-radius: 25px;
  font-weight: bold;
  letter-spacing: 1px;
  padding: 12px 24px;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  transition: all 0.3s ease;
}

.spin-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(64, 158, 255, 0.5);
}

.spin-button:active {
  transform: translateY(0);
}

@keyframes result-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 移动端优化样式 */
@media (max-width: 768px) {
  .controls {
    margin-top: 1rem;
  }

  .wheel-canvas {
    border-width: 8px;
    touch-action: pan-x pan-y;
    cursor: grab;
  }

  .wheel-canvas:active {
    cursor: grabbing;
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }

  .canvas-container::before {
    content: "触摸屏下向左滑动此处旋转";
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #999;
    opacity: 0.8;
    pointer-events: none;
  }

  .pointer-container {
    width: 30px;
    height: 40px;
    top: -15px;
  }

  .pointer {
    width: 30px;
    height: 30px;
  }

  .pointer::after {
    width: 8px;
    height: 8px;
  }

  .spin-button {
    min-width: 120px;
    font-size: 0.95rem;
    padding: 8px 16px;
    -webkit-tap-highlight-color: transparent;
  }
}
</style>