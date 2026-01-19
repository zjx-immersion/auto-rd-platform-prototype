/**
 * Team管理Store
 * 团队管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Team {
  id: string
  name: string
  code: string
  capacity: number  // Sprint容量（Story Points）
  lead?: string
  members?: string[]
  description?: string
}

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const teamById = computed(() => (teamId: string) => {
    return teams.value.find(t => t.id === teamId)
  })

  // Actions
  async function fetchTeams() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('Team列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function getTeamById(teamId: string): Team | undefined {
    return teams.value.find(team => team.id === teamId)
  }

  function addTeam(team: Team) {
    teams.value.push(team)
  }

  function updateTeam(teamId: string, updates: Partial<Team>) {
    const index = teams.value.findIndex(team => team.id === teamId)
    if (index !== -1) {
      teams.value[index] = { ...teams.value[index], ...updates }
    }
  }

  function deleteTeam(teamId: string) {
    const index = teams.value.findIndex(team => team.id === teamId)
    if (index !== -1) {
      teams.value.splice(index, 1)
    }
  }

  return {
    teams,
    currentTeam,
    loading,
    error,
    teamById,
    fetchTeams,
    getTeamById,
    addTeam,
    updateTeam,
    deleteTeam
  }
})
