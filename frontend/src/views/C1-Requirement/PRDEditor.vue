<template>
  <PageContainer>
    <PageHeader :title="`PRD编辑器 - ${feature?.name || ''}`" description="在线编辑产品需求文档">
      <template #actions>
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <el-button @click="handleSaveDraft" :loading="saving">
          <el-icon><DocumentCopy /></el-icon>
          保存草稿
        </el-button>
        <el-button type="primary" @click="handlePublish" :loading="publishing">
          <el-icon><Check /></el-icon>
          发布
        </el-button>
      </template>
    </PageHeader>

    <el-row :gutter="16" v-loading="loading">
      <!-- 左侧编辑区 -->
      <el-col :span="18">
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>PRD内容</span>
              <div>
                <el-select v-model="selectedTemplate" placeholder="选择模板" style="width: 200px; margin-right: 8px;" @change="applyTemplate">
                  <el-option label="空白模板" value="blank" />
                  <el-option label="标准PRD模板" value="standard" />
                  <el-option label="敏捷Story模板" value="story" />
                  <el-option label="技术方案模板" value="technical" />
                </el-select>
                <el-button size="small" @click="showPreview = !showPreview">
                  {{ showPreview ? '编辑' : '预览' }}
                </el-button>
              </div>
            </div>
          </template>

          <!-- 编辑器 -->
          <div v-show="!showPreview">
            <div class="editor-toolbar">
              <el-button-group size="small">
                <el-button @click="editor?.chain().focus().toggleBold().run()" :class="{ 'is-active': editor?.isActive('bold') }">
                  <strong>B</strong>
                </el-button>
                <el-button @click="editor?.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor?.isActive('italic') }">
                  <em>I</em>
                </el-button>
                <el-button @click="editor?.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor?.isActive('strike') }">
                  <s>S</s>
                </el-button>
              </el-button-group>
              <el-button-group size="small" style="margin-left: 8px;">
                <el-button @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }">
                  H1
                </el-button>
                <el-button @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }">
                  H2
                </el-button>
                <el-button @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }">
                  H3
                </el-button>
              </el-button-group>
              <el-button-group size="small" style="margin-left: 8px;">
                <el-button @click="editor?.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor?.isActive('bulletList') }">
                  列表
                </el-button>
                <el-button @click="editor?.chain().focus().toggleTaskList().run()" :class="{ 'is-active': editor?.isActive('taskList') }">
                  任务
                </el-button>
                <el-button @click="editor?.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor?.isActive('blockquote') }">
                  引用
                </el-button>
              </el-button-group>
              <el-button size="small" style="margin-left: 8px;" @click="handleImageUpload">
                <el-icon><Picture /></el-icon>
                图片
              </el-button>
            </div>
            <editor-content :editor="editor" class="editor-content" />
          </div>

          <!-- 预览 -->
          <div v-show="showPreview" class="preview-content" v-html="prdContent"></div>
        </el-card>

        <!-- 验收标准 -->
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>验收标准 ({{ acceptanceCriteria.length }})</span>
              <el-button size="small" @click="handleAddAC">
                <el-icon><Plus /></el-icon>
                添加
              </el-button>
            </div>
          </template>

          <el-table :data="acceptanceCriteria" style="width: 100%">
            <el-table-column prop="code" label="编号" width="100" />
            <el-table-column label="描述" min-width="300">
              <template #default="{ row, $index }">
                <el-input v-if="row.editing" v-model="row.description" placeholder="输入验收标准..." />
                <span v-else>{{ row.description }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="getACStatusType(row.status)">{{ getACStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row, $index }">
                <el-button v-if="row.editing" link size="small" type="primary" @click="saveAC($index)">保存</el-button>
                <el-button v-else link size="small" @click="editAC($index)">编辑</el-button>
                <el-button link size="small" type="danger" @click="deleteAC($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧信息栏 -->
      <el-col :span="6">
        <!-- 自动保存状态 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span>状态</span>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="版本">{{ prdVersion }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(prdStatus)">{{ getStatusText(prdStatus) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="最后保存">
              {{ lastSaved || '未保存' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 历史版本 -->
        <el-card style="margin-bottom: 16px;">
          <template #header>
            <span>历史版本</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(version, index) in versionHistory"
              :key="version.version"
              :timestamp="version.createdAt"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>
                  <el-tag v-if="index === 0" size="small" type="success">当前</el-tag>
                  {{ version.version }}
                </span>
                <div>
                  <el-button v-if="index > 0" link size="small" @click="compareVersions(version, versionHistory[0])">对比</el-button>
                  <el-button v-if="index > 0" link size="small" @click="showRollbackDialog(version)">回滚</el-button>
                  <el-button link size="small" @click="loadVersion(version)">加载</el-button>
                </div>
              </div>
              <div style="font-size: 12px; color: #909399;">{{ version.createdBy }}</div>
              <div v-if="version.changeSummary" style="font-size: 12px; color: #606266; margin-top: 4px;">
                {{ version.changeSummary }}
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-if="versionHistory.length === 0" description="暂无历史版本" />
        </el-card>

        <!-- 附件 -->
        <el-card>
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>附件 ({{ attachments.length }})</span>
              <el-button size="small" @click="handleAttachmentUpload">
                <el-icon><Upload /></el-icon>
                上传
              </el-button>
            </div>
          </template>
          <div v-for="attachment in attachments" :key="attachment.id" class="attachment-item">
            <el-icon><Document /></el-icon>
            <span style="flex: 1; margin-left: 8px;">{{ attachment.name }}</span>
            <el-button link size="small" type="danger" @click="deleteAttachment(attachment.id)">删除</el-button>
          </div>
          <el-empty v-if="attachments.length === 0" description="暂无附件" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 版本对比对话框 -->
    <el-dialog v-model="compareDialogVisible" title="版本对比" width="90%" :close-on-click-modal="false">
      <div class="version-compare-container">
        <div class="version-selector">
          <el-select v-model="compareVersion1" placeholder="选择版本1" style="width: 200px; margin-right: 16px;">
            <el-option
              v-for="v in versionHistory"
              :key="v.version"
              :label="v.version"
              :value="v.version"
            />
          </el-select>
          <el-select v-model="compareVersion2" placeholder="选择版本2" style="width: 200px;">
            <el-option
              v-for="v in versionHistory"
              :key="v.version"
              :label="v.version"
              :value="v.version"
            />
          </el-select>
          <el-button type="primary" style="margin-left: 16px;" @click="performCompare">对比</el-button>
        </div>
        <div v-if="compareResult" class="compare-result">
          <div class="compare-view-selector">
            <el-radio-group v-model="compareViewMode">
              <el-radio-button label="unified">统一视图</el-radio-button>
              <el-radio-button label="split">并排视图</el-radio-button>
            </el-radio-group>
          </div>
          <div v-if="compareViewMode === 'unified'" class="unified-view" v-html="compareResult.unified"></div>
          <div v-else class="split-view">
            <div class="version-content">
              <h4>{{ compareResult.version1.version }}</h4>
              <div v-html="compareResult.version1.content"></div>
            </div>
            <div class="version-content">
              <h4>{{ compareResult.version2.version }}</h4>
              <div v-html="compareResult.version2.content"></div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="compareDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 回滚确认对话框 -->
    <el-dialog v-model="rollbackDialogVisible" title="版本回滚确认" width="500px">
      <div>
        <p>确定要回滚到版本 <strong>{{ rollbackTargetVersion?.version }}</strong> 吗？</p>
        <p style="color: #909399; font-size: 12px; margin-top: 8px;">
          回滚后将创建一个新版本，当前版本内容将被替换为所选版本的内容。
        </p>
      </div>
      <template #footer>
        <el-button @click="rollbackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="performRollback">确认回滚</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, DocumentCopy, Check, Plus, Picture, Upload, Document } from '@element-plus/icons-vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import { useFeatureStore } from '@/stores/modules/feature'
import { ElMessage } from 'element-plus'
import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()
const featureStore = useFeatureStore()

const loading = ref(false)
const saving = ref(false)
const publishing = ref(false)
const showPreview = ref(false)
const selectedTemplate = ref('')

const featureId = computed(() => route.params.id as string)
const feature = computed(() => featureStore.currentFeature)
const prdContent = ref('')
const prdVersion = ref('v1.0')
const prdStatus = ref<'draft' | 'published'>('draft')
const lastSaved = ref('')

// 验收标准
const acceptanceCriteria = ref<any[]>([])

// 历史版本
const versionHistory = ref<any[]>([])

// 附件
const attachments = ref<any[]>([])

// 版本对比相关
const compareDialogVisible = ref(false)
const compareVersion1 = ref('')
const compareVersion2 = ref('')
const compareViewMode = ref<'unified' | 'split'>('unified')
const compareResult = ref<any>(null)

// 版本回滚相关
const rollbackDialogVisible = ref(false)
const rollbackTargetVersion = ref<any>(null)

// TipTap编辑器
const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder: '开始编写PRD...支持Markdown快捷键'
    })
  ],
  content: prdContent.value,
  onUpdate: ({ editor }) => {
    prdContent.value = editor.getHTML()
    autoSave()
  }
})

// 自动保存（2秒debounce）
const autoSave = debounce(() => {
  saving.value = true
  setTimeout(() => {
    lastSaved.value = new Date().toLocaleString('zh-CN')
    saving.value = false
  }, 500)
}, 2000)

const goBack = () => router.back()

const handleSaveDraft = async () => {
  saving.value = true
  try {
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 500))
    lastSaved.value = new Date().toLocaleString('zh-CN')
    ElMessage.success('草稿已保存')
  } finally {
    saving.value = false
  }
}

const handlePublish = async () => {
  publishing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    prdStatus.value = 'published'
    const oldVersion = prdVersion.value
    prdVersion.value = `v${parseFloat(prdVersion.value.substring(1)) + 0.1}`
    
    // 生成变更摘要
    const previousVersion = versionHistory.value[0]
    const changeSummary = previousVersion 
      ? `从 ${oldVersion} 更新到 ${prdVersion.value}`
      : `初始版本 ${prdVersion.value}`
    
    versionHistory.value.unshift({
      version: prdVersion.value,
      content: prdContent.value,
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: 'Current User',
      changeSummary
    })
    ElMessage.success('PRD已发布')
  } finally {
    publishing.value = false
  }
}

const applyTemplate = (templateName: string) => {
  const templates: Record<string, string> = {
    blank: '',
    standard: `<h1>产品需求文档</h1>
<h2>1. 功能概述</h2>
<p>描述功能的核心目标和价值...</p>
<h2>2. 用户场景</h2>
<p>描述典型使用场景...</p>
<h2>3. 功能需求</h2>
<ul>
  <li>需求1</li>
  <li>需求2</li>
</ul>
<h2>4. 技术要求</h2>
<p>性能、兼容性等技术指标...</p>`,
    story: `<h1>User Story</h1>
<p><strong>As a</strong> [角色]</p>
<p><strong>I want</strong> [功能]</p>
<p><strong>So that</strong> [价值]</p>
<h2>验收标准</h2>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="false">AC-001: ...</li>
  <li data-type="taskItem" data-checked="false">AC-002: ...</li>
</ul>`,
    technical: `<h1>技术方案文档</h1>
<h2>1. 背景</h2>
<p>...</p>
<h2>2. 技术架构</h2>
<p>...</p>
<h2>3. 接口设计</h2>
<p>...</p>
<h2>4. 数据模型</h2>
<p>...</p>`
  }
  
  if (editor.value && templates[templateName]) {
    editor.value.commands.setContent(templates[templateName])
    ElMessage.success('模板已应用')
  }
}

const handleImageUpload = () => {
  ElMessage.info('图片上传功能待实现')
}

const handleAddAC = () => {
  const newAC = {
    code: `AC-${String(acceptanceCriteria.value.length + 1).padStart(3, '0')}`,
    description: '',
    status: 'pending',
    editing: true
  }
  acceptanceCriteria.value.push(newAC)
}

const editAC = (index: number) => {
  acceptanceCriteria.value[index].editing = true
}

const saveAC = (index: number) => {
  if (!acceptanceCriteria.value[index].description) {
    ElMessage.warning('请输入验收标准描述')
    return
  }
  acceptanceCriteria.value[index].editing = false
  ElMessage.success('验收标准已保存')
}

const deleteAC = (index: number) => {
  acceptanceCriteria.value.splice(index, 1)
  ElMessage.success('验收标准已删除')
}

const getACStatusType = (status: string) => {
  const map: Record<string, any> = {
    pending: 'info',
    passed: 'success',
    failed: 'danger'
  }
  return map[status] || 'info'
}

const getACStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待验证',
    passed: '已通过',
    failed: '未通过'
  }
  return map[status] || status
}

const getStatusType = (status: string) => {
  return status === 'published' ? 'success' : 'info'
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布'
  }
  return map[status] || status
}

const loadVersion = (version: any) => {
  if (editor.value) {
    editor.value.commands.setContent(version.content)
    prdContent.value = version.content
    ElMessage.success(`已加载版本 ${version.version}`)
  }
}

// 版本对比功能
const compareVersions = (v1: any, v2: any) => {
  compareVersion1.value = v1.version
  compareVersion2.value = v2.version
  compareDialogVisible.value = true
  performCompare()
}

const performCompare = () => {
  if (!compareVersion1.value || !compareVersion2.value) {
    ElMessage.warning('请选择两个版本进行对比')
    return
  }

  const v1 = versionHistory.value.find(v => v.version === compareVersion1.value)
  const v2 = versionHistory.value.find(v => v.version === compareVersion2.value)

  if (!v1 || !v2) {
    ElMessage.error('版本不存在')
    return
  }

  // 简单的文本对比（实际可以使用diff库）
  const content1 = v1.content || ''
  const content2 = v2.content || ''
  
  // 生成统一视图（高亮差异）
  const unified = generateUnifiedDiff(content1, content2)

  compareResult.value = {
    version1: v1,
    version2: v2,
    unified
  }
}

const generateUnifiedDiff = (oldContent: string, newContent: string): string => {
  // 简单的HTML对比实现
  // 实际项目中可以使用diff库如diff-match-patch
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')
  let result = ''
  
  const maxLen = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] || ''
    const newLine = newLines[i] || ''
    
    if (oldLine !== newLine) {
      if (oldLine) {
        result += `<div style="background-color: #ffebee; padding: 4px; margin: 2px 0;"><del>${oldLine}</del></div>`
      }
      if (newLine) {
        result += `<div style="background-color: #e8f5e9; padding: 4px; margin: 2px 0;"><ins>${newLine}</ins></div>`
      }
    } else {
      result += `<div style="padding: 4px; margin: 2px 0;">${oldLine}</div>`
    }
  }
  
  return result || '<p style="color: #909399;">两个版本内容相同</p>'
}

// 版本回滚功能
const showRollbackDialog = (version: any) => {
  rollbackTargetVersion.value = version
  rollbackDialogVisible.value = true
}

const performRollback = async () => {
  if (!rollbackTargetVersion.value) return

  try {
    // 回滚到指定版本
    const targetContent = rollbackTargetVersion.value.content
    
    if (editor.value) {
      editor.value.commands.setContent(targetContent)
      prdContent.value = targetContent
    }

    // 创建新版本
    const newVersion = `v${parseFloat(prdVersion.value.substring(1)) + 0.1}`
    prdVersion.value = newVersion
    
    versionHistory.value.unshift({
      version: newVersion,
      content: targetContent,
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: 'Current User',
      changeSummary: `回滚自 ${rollbackTargetVersion.value.version}`
    })

    ElMessage.success(`已回滚到版本 ${rollbackTargetVersion.value.version}，并创建新版本 ${newVersion}`)
    rollbackDialogVisible.value = false
    rollbackTargetVersion.value = null
  } catch (error) {
    ElMessage.error('回滚失败')
  }
}

const handleAttachmentUpload = () => {
  ElMessage.info('附件上传功能待实现')
}

const deleteAttachment = (id: string) => {
  const index = attachments.value.findIndex(a => a.id === id)
  if (index !== -1) {
    attachments.value.splice(index, 1)
    ElMessage.success('附件已删除')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await featureStore.fetchFeatureById(featureId.value)
    
    // 模拟加载PRD数据
    prdContent.value = '<h1>产品需求文档</h1><p>开始编写...</p>'
    if (editor.value) {
      editor.value.commands.setContent(prdContent.value)
    }
    
    // 模拟验收标准
    acceptanceCriteria.value = [
      { code: 'AC-001', description: '基础功能正常运行', status: 'pending', editing: false },
      { code: 'AC-002', description: '性能满足要求（响应时间<200ms）', status: 'pending', editing: false }
    ]
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped lang="scss">
.editor-toolbar {
  padding: 12px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  
  .is-active {
    background-color: #409eff;
    color: white;
  }
}

:deep(.editor-content) {
  min-height: 500px;
  padding: 20px;
  
  .ProseMirror {
    outline: none;
    min-height: 480px;
    
    > * + * {
      margin-top: 0.75em;
    }
    
    h1 {
      font-size: 2em;
      font-weight: bold;
      margin: 1em 0 0.5em;
    }
    
    h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0.83em 0;
    }
    
    h3 {
      font-size: 1.17em;
      font-weight: bold;
      margin: 1em 0;
    }
    
    ul, ol {
      padding-left: 2em;
    }
    
    blockquote {
      border-left: 3px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
    }
    
    ul[data-type="taskList"] {
      list-style: none;
      padding-left: 0;
      
      li {
        display: flex;
        align-items: center;
        
        > label {
          flex: 0 0 auto;
          margin-right: 0.5em;
        }
        
        > div {
          flex: 1 1 auto;
        }
      }
    }
    
    img {
      max-width: 100%;
      height: auto;
    }
    
    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: #adb5bd;
      pointer-events: none;
      height: 0;
    }
  }
}

.preview-content {
  min-height: 500px;
  padding: 20px;
  line-height: 1.6;
  
  :deep(h1) {
    font-size: 2em;
    font-weight: bold;
    margin: 1em 0 0.5em;
  }
  
  :deep(h2) {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.83em 0;
  }
  
  :deep(h3) {
    font-size: 1.17em;
    font-weight: bold;
    margin: 1em 0;
  }
  
  :deep(ul), :deep(ol) {
    padding-left: 2em;
  }
  
  :deep(blockquote) {
    border-left: 3px solid #ddd;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
  }
}

.attachment-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.version-compare-container {
  .version-selector {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #dcdfe6;
  }

  .compare-view-selector {
    margin-bottom: 16px;
  }

  .compare-result {
    max-height: 600px;
    overflow-y: auto;
  }

  .unified-view {
    padding: 16px;
    background-color: #fafafa;
    border-radius: 4px;
    
    :deep(del) {
      text-decoration: line-through;
      color: #f56c6c;
    }
    
    :deep(ins) {
      text-decoration: underline;
      color: #67c23a;
    }
  }

  .split-view {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    .version-content {
      padding: 16px;
      background-color: #fafafa;
      border-radius: 4px;
      
      h4 {
        margin-top: 0;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #409eff;
      }
    }
  }
}
</style>
