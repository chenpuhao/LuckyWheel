<script setup>
      import { ref, onMounted, watch } from 'vue'
      import { ElMessageBox } from 'element-plus'
      import LuckyWheel from './components/LuckyWheel.vue'

      // 初始数据
      const defaultItems = [
        { id: 1, name: '黄焖鸡' },
        { id: 2, name: '炒饭' },
        { id: 3, name: '面条' },
        { id: 4, name: '抄手' },
        { id: 5, name: '饺子' },
        { id: 6, name: '米粉' },
        { id: 7, name: '冒菜'},
        { id: 8, name: '鸡公煲'},
        { id: 9, name: '汉堡'},
        { id: 10, name: '火锅'},
        { id: 11, name: '川菜'},
        { id: 12, name: '湘菜'},
        { id:13, name: '不吃了'}
      ]
      const history = ref([])
      const MAX_HISTORY = 40 // 最多保存的历史记录数

      const wheelRef = ref(null)
      const wheelName = ref('今天吃什么')
      const items = ref([...defaultItems])
      const newItem = ref('')
      const dialogVisible = ref(false)
      const editingItem = ref(null)

      // 从localStorage加载数据
      onMounted(() => {
        const savedWheel = localStorage.getItem('luckyWheel')
        if (savedWheel) {
          try {
            const data = JSON.parse(savedWheel)
            wheelName.value = data.wheelName || '今天吃什么'
            items.value = data.items || [...defaultItems]
          } catch (e) {
            console.error('加载保存数据失败', e)
          }
        }
      })

      // 保存数据到localStorage
      const saveToLocalStorage = () => {
        localStorage.setItem('luckyWheel', JSON.stringify({
          wheelName: wheelName.value,
          items: items.value,
          history: history.value
        }))
      }

      // 添加历史记录
      const addToHistory = (spinResult) => {
        // 添加新记录到顶部
        history.value.unshift(spinResult)

        // 限制历史记录数量
        if (history.value.length > MAX_HISTORY) {
          history.value = history.value.slice(0, MAX_HISTORY)
        }
      }

      // 清空历史记录
      const clearHistory = async () => {
        try {
          await ElMessageBox.confirm('确定要清空所有历史记录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          history.value = []
        } catch (e) {
          // 用户取消操作
        }
      }

      // 处理转盘旋转结束
      const handleSpinEnd = (spinResult) => {
        addToHistory(spinResult)
      }

      // 监听数据变化自动保存
      watch([wheelName, items], saveToLocalStorage, { deep: true })

      // 添加新项目
      const addItem = () => {
        if (!newItem.value.trim()) return

        const maxId = items.value.length > 0
          ? Math.max(...items.value.map(item => item.id))
          : 0

        items.value.push({
          id: maxId + 1,
          name: newItem.value.trim()
        })

        newItem.value = ''
      }

      // 编辑项目
      const editItem = (item) => {
        editingItem.value = { ...item }
        dialogVisible.value = true
      }

      // 保存编辑
      const saveEdit = () => {
        if (!editingItem.value.name.trim()) return

        const index = items.value.findIndex(item => item.id === editingItem.value.id)
        if (index !== -1) {
          items.value[index] = { ...editingItem.value }
        }

        dialogVisible.value = false
        editingItem.value = null
      }

      // 删除项目
      const removeItem = (id) => {
        items.value = items.value.filter(item => item.id !== id)
      }

      // 重命名转盘
      const renameWheel = async () => {
        try {
          const { value } = await ElMessageBox.prompt('请输入新的转盘名称', '重命名转盘', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: wheelName.value
          })
          if (value) {
            wheelName.value = value
          }
        } catch (e) {
          // 用户取消操作
        }
      }

      // 开始旋转
      const startSpin = () => {
        if (wheelRef.value) {
          wheelRef.value.spin()
        }
      }

      // 导出数据
      const exportData = () => {
        const data = JSON.stringify({
          wheelName: wheelName.value,
          items: items.value
        })

        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `${wheelName.value}.json`
        a.click()

        URL.revokeObjectURL(url)
      }

      // 导入数据
      const importData = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result)
            if (data.wheelName && Array.isArray(data.items)) {
              wheelName.value = data.wheelName
              items.value = data.items
            }
          } catch (e) {
            ElMessageBox.alert('导入失败，文件格式不正确', '错误')
          }
        }
        reader.readAsText(file)

        // 重置input，使相同文件可以再次导入
        event.target.value = ''
      }

      // 重置为默认值
      const resetToDefault = async () => {
        try {
          await ElMessageBox.confirm('确定要重置为默认数据吗？这将丢失当前所有自定义项目', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })

          wheelName.value = '今天吃什么'
          items.value = [...defaultItems]
        } catch (e) {
          // 用户取消操作
        }
      }
      </script>

      <template>
        <div class="app-container">
          <header class="app-header">
            <h1>{{ wheelName }}</h1>
            <div class="header-actions">
              <el-button type="primary" @click="renameWheel" size="small">
                <el-icon><Edit /></el-icon>
                重命名
              </el-button>
              <el-button type="success" @click="exportData" size="small">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
              <div class="import-button-container">
                <el-button type="warning" size="small">
                  <el-icon><Upload /></el-icon>
                  导入
                </el-button>
                <input
                  type="file"
                  accept=".json"
                  @change="importData"
                  class="file-input"
                />
              </div>
              <el-button type="danger" @click="resetToDefault" size="small">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
            </div>
          </header>

          <main class="main-content">
            <div class="wheel-section">
              <LuckyWheel
                ref="wheelRef"
                :items="items"
                :wheelName="wheelName"
                @spin-end="handleSpinEnd"
              />
            </div>

            <div class="items-management">
              <div class="history-section">
                <div class="history-header">
                  <h2>历史记录</h2>
                  <el-button
                      type="danger"
                      size="small"
                      :disabled="history.length === 0"
                      @click="clearHistory"
                  >
                    <el-icon><Delete /></el-icon>
                    清空
                  </el-button>
                </div>

                <div class="history-list">
                  <el-empty v-if="history.length === 0" description="暂无记录" />
                  <el-timeline v-else>
                    <el-timeline-item
                        v-for="(record, index) in history"
                        :key="index"
                        :timestamp="record.time"
                        :type="index === 0 ? 'primary' : ''"
                    >
                      <div class="history-item">
                        <el-tag :type="index === 0 ? 'success' : 'info'">
                          {{ record.result }}
                        </el-tag>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            <div class="items-section">
              <h2>转盘选项管理</h2>

              <div class="add-item-form">
                <el-input
                  v-model="newItem"
                  placeholder="请输入新选项名称"
                  @keyup.enter="addItem"
                >
                  <template #append>
                    <el-button @click="addItem" :disabled="!newItem.trim()">
                      <el-icon><Plus /></el-icon>
                      添加
                    </el-button>
                  </template>
                </el-input>
              </div>

              <div class="items-list">
                <el-empty v-if="items.length === 0" description="暂无选项" />
                <el-card v-for="item in items" :key="item.id" class="item-card">
                  <div class="item-content">
                    <span class="item-name">{{ item.name }}</span>
                    <div class="item-actions">
                      <el-button
                        type="primary"
                        size="small"
                        circle
                        @click="editItem(item)"
                      >
                        <el-icon><Edit /></el-icon>
                      </el-button>
                      <el-button
                        type="danger"
                        size="small"
                        circle
                        @click="removeItem(item.id)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
            </div>
          </main>

          <!-- 编辑项目对话框 -->
          <el-dialog
            v-model="dialogVisible"
            title="编辑选项"
            width="30%"
          >
            <el-form v-if="editingItem">
              <el-form-item label="选项名称">
                <el-input v-model="editingItem.name" />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveEdit">保存</el-button>
              </span>
            </template>
          </el-dialog>
        </div>
        <footer class="footer">
          <p>© {{ new Date().getFullYear() }} <a href="https://wangling.hauchet.cn">hauchet</a> All rights reserved.</p>
          <p>Powered by <a href="https://wangling.hauchet.cn">亡灵</a></p>
        </footer>
      </template>

      <style scoped>

      .footer {
        text-align: center;
        padding: 1.5rem 0;
        background: linear-gradient(145deg, #fefefe, #f5f5f5);
        border-top: 1px solid rgba(0, 0, 0, 0.05);
        box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.03);
        margin-top: 2rem;
      }

      .footer p {
        margin: 0.5rem 0;
        color: #666;
        font-size: 0.9rem;
      }

      .footer a {
        color: #409eff;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
        position: relative;
      }

      .footer a:hover {
        color: #66b1ff;
      }

      .footer a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1px;
        background-color: #66b1ff;
        transition: width 0.3s ease;
      }

      .footer a:hover::after {
        width: 100%;
      }

      .app-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem;
        box-sizing: border-box;
      }

      .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .app-header h1 {
        font-size: 1.8rem;
        margin: 0;
        word-break: break-word;
      }

      .header-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .import-button-container {
        position: relative;
        overflow: hidden;
      }

      .file-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 1;
      }

      .main-content {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .wheel-section {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .items-section {
        flex: 1;
        min-width: 300px;
      }

      .add-item-form {
        margin-bottom: 1rem;
      }

      .items-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .item-card {
        margin-bottom: 0.5rem;
      }

      .item-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .item-name {
        word-break: break-word;
        flex: 1;
      }

      .item-actions {
        display: flex;
        gap: 0.5rem;
        margin-left: 1rem;
      }

      .main-content {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
      }

      .wheel-section {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .items-management {
        flex: 1;
        min-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .history-section {
        flex: 1;
        min-width: 300px;
        background: linear-gradient(145deg, #fefefe, #f5f5f5);
        border-radius: 20px;
        padding: 2rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }

      .history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .history-section h2 {
        color: #333;
        margin-bottom: 1.5rem;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        text-align: center;
        position: relative;
        display: inline-block;
        margin: 0;
      }

      .history-section h2::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: linear-gradient(90deg, rgba(103,194,58,0.1), rgba(103,194,58,0.8), rgba(103,194,58,0.1));
        border-radius: 3px;
      }

      .history-list {
        max-height: 300px;
        overflow-y: auto;
        padding: 5px;
        border-radius: 10px;
        scrollbar-width: thin;
        scrollbar-color: #ccc #f5f5f5;
      }

      .history-list::-webkit-scrollbar {
        width: 6px;
      }

      .history-list::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 10px;
      }

      .history-list::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 10px;
      }

      .history-item {
        display: flex;
        align-items: center;
      }

      .items-section {
        flex: 1;
        min-width: 300px;
        background: linear-gradient(145deg, #fefefe, #f5f5f5);
        border-radius: 20px;
        padding: 2rem 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }

      .items-section h2 {
        color: #333;
        margin-bottom: 1.5rem;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        text-align: center;
        position: relative;
        display: inline-block;
        left: 50%;
        transform: translateX(-50%);
      }

      .items-section h2::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 3px;
        background: linear-gradient(90deg, rgba(255,71,87,0.1), rgba(255,71,87,0.8), rgba(255,71,87,0.1));
        border-radius: 3px;
      }

      @media (max-width: 1024px) {
        .main-content {
          flex-direction: column;
        }

        .wheel-section, .items-section {
          width: 100%;
        }
      }

      @media (max-width: 768px) {
        .app-container {
          padding: 0.5rem;
        }

        .app-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .header-actions {
          width: 100%;
          justify-content: center;
        }

        .app-header h1 {
          font-size: 1.5rem;
          width: 100%;
          text-align: center;
        }

        .items-section h2 {
          font-size: 1.3rem;
          text-align: center;
        }
      }

      @media (max-width: 480px) {
        .header-actions {
          gap: 0.3rem;
        }

        :deep(.el-button--small) {
          padding: 5px 10px;
          font-size: 12px;
        }
      }
      @media (max-width: 1024px) {
        .main-content {
          flex-direction: column;
        }

        .wheel-section, .items-management {
          width: 100%;
        }
      }

      @media (max-width: 768px) {
        .app-container {
          padding: 0.5rem;
        }

        .history-section {
          padding: 1.5rem 1rem;
          border-radius: 15px;
        }

        .history-list {
          max-height: 250px;
        }
      }
      </style>