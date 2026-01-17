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
              v-for="version in versionHistory"
              :key="version.version"
              :timestamp="version.createdAt"
            >
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>{{ version.version }}</span>
                <el-button link size="small" @click="loadVersion(version)">加载</el-button>
              </div>
              <div style="font-size: 12px; color: #909399;">{{ version.createdBy }}</div>
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
    prdVersion.value = `v${parseFloat(prdVersion.value.substring(1)) + 0.1}`
    versionHistory.value.unshift({
      version: prdVersion.value,
      content: prdContent.value,
      createdAt: new Date().toLocaleString('zh-CN'),
      createdBy: 'Current User'
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
    ElMessage.success(`已加载版本 ${version.version}`)
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
</style>
