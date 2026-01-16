<template>
  <div class="mr-allocation-container">
    <PageContainer>
      <div class="page-header">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <h2>MR分配到Team</h2>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-card header="MR信息">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="MR编码">{{ mr?.code }}</el-descriptions-item>
              <el-descriptions-item label="标题">{{ mr?.title }}</el-descriptions-item>
              <el-descriptions-item label="复杂度">{{ mr?.complexity }}</el-descriptions-item>
              <el-descriptions-item label="工作量">{{ mr?.storyPoints }}SP</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card header="分配团队">
            <el-form :model="allocationForm" label-width="100px">
              <el-form-item label="选择团队">
                <el-select v-model="allocationForm.teamId" placeholder="请选择团队" style="width: 100%">
                  <el-option v-for="team in teams" :key="team.id" :label="team.name" :value="team.id">
                    <span style="float: left">{{ team.name }}</span>
                    <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">
                      容量: {{ team.capacity }}SP
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="负责人">
                <el-select v-model="allocationForm.owner" placeholder="请选择负责人" style="width: 100%">
                  <el-option v-for="user in teamMembers" :key="user.id" :label="user.name" :value="user.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="优先级">
                <el-select v-model="allocationForm.priority" style="width: 100%">
                  <el-option label="P0" value="P0" />
                  <el-option label="P1" value="P1" />
                  <el-option label="P2" value="P2" />
                  <el-option label="P3" value="P3" />
                </el-select>
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="allocationForm.notes" type="textarea" :rows="3" />
              </el-form-item>
              <el-form-item>
                <el-button @click="goBack">取消</el-button>
                <el-button type="primary" @click="submitAllocation" :loading="submitting">确认分配</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <el-card header="团队负载情况" style="margin-top: 20px">
        <el-table :data="teams" stripe>
          <el-table-column prop="name" label="团队名称" width="200" />
          <el-table-column prop="leader" label="负责人" width="120" />
          <el-table-column label="成员数" width="100">
            <template #default="{ row }">{{ row.memberIds?.length || 0 }}人</template>
          </el-table-column>
          <el-table-column label="容量" width="100">
            <template #default="{ row }">{{ row.capacity }}SP</template>
          </el-table-column>
          <el-table-column label="已分配" width="100">
            <template #default="{ row }">{{ getAllocated(row.id) }}SP</template>
          </el-table-column>
          <el-table-column label="剩余" width="100">
            <template #default="{ row }">{{ row.capacity - getAllocated(row.id) }}SP</template>
          </el-table-column>
          <el-table-column label="负载率" width="200">
            <template #default="{ row }">
              <el-progress :percentage="Math.round((getAllocated(row.id) / row.capacity) * 100)" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </PageContainer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useSSTSStore } from '@/stores/modules/ssts'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import PageContainer from '@/components/Common/PageContainer.vue'

const router = useRouter()
const route = useRoute()
const sstsStore = useSSTSStore()
const projectStore = useProjectStore()
const userStore = useUserStore()

const mrId = route.params.id as string
const submitting = ref(false)

const mr = computed(() => sstsStore.mrList.find(m => m.id === mrId))
const teams = computed(() => projectStore.teams)
const teamMembers = computed(() => {
  if (!allocationForm.value.teamId) return []
  const team = teams.value.find(t => t.id === allocationForm.value.teamId)
  return team ? userStore.users.filter(u => team.memberIds.includes(u.id)) : []
})

const allocationForm = ref({
  teamId: '',
  owner: '',
  priority: 'P1',
  notes: ''
})

const getAllocated = (teamId: string) => {
  const teamMRs = sstsStore.mrList.filter(m => m.assignedTeam === teamId)
  return teamMRs.reduce((sum, mr) => sum + (mr.storyPoints || 0), 0)
}

const submitAllocation = async () => {
  if (!allocationForm.value.teamId) {
    ElMessage.warning('请选择团队')
    return
  }

  submitting.value = true
  try {
    await sstsStore.assignMRToTeam(mrId, allocationForm.value.teamId)
    if (allocationForm.value.owner) {
      await sstsStore.updateMR(mrId, { owner: allocationForm.value.owner })
    }
    ElMessage.success('分配成功')
    router.back()
  } catch (error) {
    ElMessage.error('分配失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => router.back()

onMounted(async () => {
  await sstsStore.fetchMRList()
})
</script>

<style scoped lang="scss">
.mr-allocation-container {
  height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
