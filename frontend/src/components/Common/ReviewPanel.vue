<template>
  <div class="review-panel">
    <!-- 评审状态流程 -->
    <div class="review-status-flow">
      <el-steps :active="getStatusStep(reviewStatus)" finish-status="success" align-center>
        <el-step title="草稿" />
        <el-step title="待评审" />
        <el-step title="评审中" />
        <el-step :title="reviewStatus === 'rejected' ? '已拒绝' : '已通过'" :status="reviewStatus === 'rejected' ? 'error' : 'success'" />
      </el-steps>
    </div>

    <!-- 评审操作 -->
    <div class="review-actions" v-if="canReview">
      <el-button
        v-if="reviewStatus === 'draft'"
        type="primary"
        @click="handleSubmitReview"
        :loading="submitting"
      >
        <el-icon><Promotion /></el-icon>
        提交评审
      </el-button>

      <template v-if="reviewStatus === 'pending' || reviewStatus === 'in_review'">
        <el-button
          type="success"
          @click="handleApprove"
          :loading="approving"
          v-if="isReviewer"
        >
          <el-icon><CircleCheck /></el-icon>
          通过
        </el-button>
        <el-button
          type="danger"
          @click="showRejectDialog = true"
          v-if="isReviewer"
        >
          <el-icon><CircleClose /></el-icon>
          拒绝
        </el-button>
        <el-button
          @click="handleWithdraw"
          v-if="!isReviewer"
        >
          <el-icon><RefreshLeft /></el-icon>
          撤回
        </el-button>
      </template>
    </div>

    <!-- 评审意见列表 -->
    <div class="review-comments">
      <div class="section-header">
        <span>评审意见 ({{ comments.length }})</span>
        <el-button size="small" @click="showCommentDialog = true">
          <el-icon><Plus /></el-icon>
          添加意见
        </el-button>
      </div>

      <div class="comments-list">
        <div
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <div class="comment-header">
            <div class="comment-author">
              <el-avatar :size="32" :src="comment.authorAvatar" />
              <div class="author-info">
                <span class="author-name">{{ comment.author }}</span>
                <span class="author-role">{{ comment.authorRole }}</span>
              </div>
            </div>
            <div class="comment-meta">
              <el-tag :type="getCommentTypeTagType(comment.type)" size="small">
                {{ getCommentTypeText(comment.type) }}
              </el-tag>
              <span class="comment-time">{{ comment.createdAt }}</span>
            </div>
          </div>

          <div class="comment-content">
            {{ comment.content }}
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-header">
                <span class="reply-author">{{ reply.author }}</span>
                <span class="reply-time">{{ reply.createdAt }}</span>
              </div>
              <div class="reply-content">{{ reply.content }}</div>
            </div>
          </div>

          <div class="comment-actions">
            <el-button link size="small" @click="handleReply(comment)">
              <el-icon><ChatLineRound /></el-icon>
              回复
            </el-button>
          </div>
        </div>

        <el-empty v-if="comments.length === 0" description="暂无评审意见" />
      </div>
    </div>

    <!-- 评审历史 -->
    <div class="review-history">
      <div class="section-header">
        <span>评审历史</span>
      </div>

      <el-timeline>
        <el-timeline-item
          v-for="record in history"
          :key="record.id"
          :timestamp="record.timestamp"
          :color="getRecordColor(record.action)"
        >
          <div>
            <strong>{{ record.reviewer }}</strong>
            {{ getActionText(record.action) }}
          </div>
          <div v-if="record.reason" class="history-reason">
            原因：{{ record.reason }}
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-if="history.length === 0" description="暂无评审历史" />
    </div>

    <!-- 添加评审意见对话框 -->
    <el-dialog v-model="showCommentDialog" title="添加评审意见" width="600px">
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="意见类型">
          <el-radio-group v-model="commentForm.type">
            <el-radio label="issue">问题</el-radio>
            <el-radio label="suggestion">建议</el-radio>
            <el-radio label="approval">认可</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="意见内容">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入评审意见..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCommentDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddComment">提交</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝评审对话框 -->
    <el-dialog v-model="showRejectDialog" title="拒绝评审" width="500px">
      <el-form label-width="80px">
        <el-form-item label="拒绝原因" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请说明拒绝原因..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRejectDialog = false">取消</el-button>
        <el-button type="danger" @click="handleReject" :loading="rejecting">确定拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog v-model="showReplyDialog" title="回复评审意见" width="500px">
      <el-input
        v-model="replyContent"
        type="textarea"
        :rows="4"
        placeholder="请输入回复内容..."
      />
      <template #footer>
        <el-button @click="showReplyDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitReply">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Promotion,
  CircleCheck,
  CircleClose,
  RefreshLeft,
  Plus,
  ChatLineRound
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface ReviewComment {
  id: string
  author: string
  authorRole: string
  authorAvatar?: string
  content: string
  type: 'issue' | 'suggestion' | 'approval'
  createdAt: string
  replies?: ReviewReply[]
}

interface ReviewReply {
  id: string
  author: string
  content: string
  createdAt: string
}

interface ReviewRecord {
  id: string
  action: 'submit' | 'approve' | 'reject' | 'withdraw'
  reviewer: string
  reason?: string
  timestamp: string
}

const props = defineProps<{
  entityId: string
  entityType: 'epic' | 'feature' | 'ssts'
  reviewStatus: 'draft' | 'pending' | 'in_review' | 'approved' | 'rejected'
  comments?: ReviewComment[]
  history?: ReviewRecord[]
  canReview?: boolean
  isReviewer?: boolean
}>()

const emit = defineEmits<{
  (e: 'status-change', status: string): void
  (e: 'comment-add', comment: ReviewComment): void
  (e: 'reply-add', commentId: string, reply: ReviewReply): void
}>()

const submitting = ref(false)
const approving = ref(false)
const rejecting = ref(false)

const showCommentDialog = ref(false)
const showRejectDialog = ref(false)
const showReplyDialog = ref(false)

const commentForm = ref({
  type: 'issue' as 'issue' | 'suggestion' | 'approval',
  content: ''
})

const rejectReason = ref('')
const replyContent = ref('')
const replyingToComment = ref<ReviewComment | null>(null)

const comments = computed(() => props.comments || [])
const history = computed(() => props.history || [])

const getStatusStep = (status: string) => {
  const stepMap: Record<string, number> = {
    draft: 0,
    pending: 1,
    in_review: 2,
    approved: 3,
    rejected: 3
  }
  return stepMap[status] || 0
}

const getCommentTypeTagType = (type: string) => {
  const map: Record<string, any> = {
    issue: 'danger',
    suggestion: 'warning',
    approval: 'success'
  }
  return map[type] || 'info'
}

const getCommentTypeText = (type: string) => {
  const map: Record<string, string> = {
    issue: '问题',
    suggestion: '建议',
    approval: '认可'
  }
  return map[type] || type
}

const getActionText = (action: string) => {
  const map: Record<string, string> = {
    submit: '提交了评审',
    approve: '通过了评审',
    reject: '拒绝了评审',
    withdraw: '撤回了评审'
  }
  return map[action] || action
}

const getRecordColor = (action: string) => {
  const map: Record<string, string> = {
    submit: '#409eff',
    approve: '#67c23a',
    reject: '#f56c6c',
    withdraw: '#e6a23c'
  }
  return map[action] || '#909399'
}

const handleSubmitReview = async () => {
  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('status-change', 'pending')
    ElMessage.success('已提交评审')
  } finally {
    submitting.value = false
  }
}

const handleApprove = async () => {
  approving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('status-change', 'approved')
    ElMessage.success('评审已通过')
  } finally {
    approving.value = false
  }
}

const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写拒绝原因')
    return
  }

  rejecting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('status-change', 'rejected')
    ElMessage.success('评审已拒绝')
    showRejectDialog.value = false
    rejectReason.value = ''
  } finally {
    rejecting.value = false
  }
}

const handleWithdraw = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    emit('status-change', 'draft')
    ElMessage.success('评审已撤回')
  } catch (error) {
    ElMessage.error('撤回失败')
  }
}

const handleAddComment = () => {
  if (!commentForm.value.content.trim()) {
    ElMessage.warning('请输入评审意见')
    return
  }

  const newComment: ReviewComment = {
    id: `comment-${Date.now()}`,
    author: 'Current User',
    authorRole: '评审人',
    content: commentForm.value.content,
    type: commentForm.value.type,
    createdAt: new Date().toLocaleString('zh-CN'),
    replies: []
  }

  emit('comment-add', newComment)
  ElMessage.success('评审意见已添加')
  showCommentDialog.value = false
  commentForm.value.content = ''
}

const handleReply = (comment: ReviewComment) => {
  replyingToComment.value = comment
  showReplyDialog.value = true
}

const handleSubmitReply = () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  if (!replyingToComment.value) return

  const newReply: ReviewReply = {
    id: `reply-${Date.now()}`,
    author: 'Current User',
    content: replyContent.value,
    createdAt: new Date().toLocaleString('zh-CN')
  }

  emit('reply-add', replyingToComment.value.id, newReply)
  ElMessage.success('回复已添加')
  showReplyDialog.value = false
  replyContent.value = ''
  replyingToComment.value = null
}
</script>

<style scoped lang="scss">
.review-panel {
  .review-status-flow {
    margin-bottom: 24px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;
  }

  .review-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background-color: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 16px;
  }

  .review-comments {
    margin-bottom: 24px;

    .comments-list {
      .comment-item {
        padding: 16px;
        margin-bottom: 12px;
        background-color: #fff;
        border: 1px solid #e4e7ed;
        border-radius: 4px;

        .comment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .comment-author {
            display: flex;
            align-items: center;
            gap: 12px;

            .author-info {
              display: flex;
              flex-direction: column;

              .author-name {
                font-weight: 500;
                color: #303133;
              }

              .author-role {
                font-size: 12px;
                color: #909399;
              }
            }
          }

          .comment-meta {
            display: flex;
            align-items: center;
            gap: 8px;

            .comment-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }

        .comment-content {
          margin-bottom: 12px;
          line-height: 1.6;
          color: #606266;
        }

        .comment-replies {
          margin-top: 12px;
          padding-left: 44px;

          .reply-item {
            padding: 12px;
            margin-bottom: 8px;
            background-color: #f5f7fa;
            border-radius: 4px;

            .reply-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;

              .reply-author {
                font-weight: 500;
                font-size: 13px;
                color: #303133;
              }

              .reply-time {
                font-size: 12px;
                color: #909399;
              }
            }

            .reply-content {
              font-size: 13px;
              line-height: 1.5;
              color: #606266;
            }
          }
        }

        .comment-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .review-history {
    .history-reason {
      margin-top: 4px;
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
