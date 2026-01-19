/**
 * 整车计划节点管理Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface VehicleNode {
  id: string
  code: string
  name: string
  type: 'M样车' | 'A样车' | 'B样车' | 'C样车' | 'PPAP' | 'OTS' | 'PVS' | 'SOP' | '集成测试' | '其他'
  date: string
  milestone: string
  description?: string
  productId: string
  dependencies?: string[]
  status: 'planning' | 'in-progress' | 'completed' | 'delayed'
  owner: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export const useVehicleNodeStore = defineStore('vehicleNode', () => {
  const vehicleNodes = ref<VehicleNode[]>([])
  const currentNode = ref<VehicleNode | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const nodesByProduct = computed(() => (productId: string) => {
    return vehicleNodes.value.filter(node => node.productId === productId)
  })

  const nodesByType = computed(() => (type: VehicleNode['type']) => {
    return vehicleNodes.value.filter(node => node.type === type)
  })

  const nodesByStatus = computed(() => (status: VehicleNode['status']) => {
    return vehicleNodes.value.filter(node => node.status === status)
  })

  const nodesByDateRange = computed(() => (startDate: string, endDate: string) => {
    return vehicleNodes.value.filter(node => {
      const nodeDate = new Date(node.date)
      return nodeDate >= new Date(startDate) && nodeDate <= new Date(endDate)
    })
  })

  // Actions
  async function fetchVehicleNodes() {
    loading.value = true
    error.value = null
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      console.log('整车节点列表已加载')
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchVehicleNodeById(nodeId: string) {
    loading.value = true
    try {
      const node = vehicleNodes.value.find(n => n.id === nodeId)
      if (node) {
        currentNode.value = node
      }
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function getNodeById(nodeId: string): VehicleNode | undefined {
    return vehicleNodes.value.find(node => node.id === nodeId)
  }

  function addVehicleNode(node: VehicleNode) {
    vehicleNodes.value.push(node)
  }

  function updateVehicleNode(nodeId: string, updates: Partial<VehicleNode>) {
    const index = vehicleNodes.value.findIndex(node => node.id === nodeId)
    if (index !== -1) {
      vehicleNodes.value[index] = { ...vehicleNodes.value[index], ...updates }
    }
  }

  function deleteVehicleNode(nodeId: string) {
    const index = vehicleNodes.value.findIndex(node => node.id === nodeId)
    if (index !== -1) {
      vehicleNodes.value.splice(index, 1)
    }
  }

  return {
    vehicleNodes,
    currentNode,
    loading,
    error,
    nodesByProduct,
    nodesByType,
    nodesByStatus,
    nodesByDateRange,
    fetchVehicleNodes,
    fetchVehicleNodeById,
    getNodeById,
    addVehicleNode,
    updateVehicleNode,
    deleteVehicleNode
  }
})
