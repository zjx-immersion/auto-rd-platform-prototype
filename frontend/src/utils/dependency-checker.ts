/**
 * 依赖检查工具类
 * 用于检测和验证Feature/SSTS/MR之间的依赖关系
 */

import type { Feature, SSTS, MR } from '@/types'

export interface DependencyNode {
  id: string
  code: string
  title: string
  type: 'feature' | 'ssts' | 'mr'
  sprintId?: string
  teamId?: string
}

export interface DependencyEdge {
  source: string
  target: string
  type: 'strong' | 'weak' | 'optional'
  reason?: string
}

export interface DependencyPath {
  path: DependencyNode[]
  isValid: boolean
  issues: string[]
}

export interface DependencyConflict {
  id: string
  type: 'circular' | 'missing' | 'timing' | 'cross-team'
  severity: 'error' | 'warning' | 'info'
  source: DependencyNode
  target?: DependencyNode
  message: string
  suggestion?: string
  affectedItems?: DependencyNode[]
}

export interface DependencyCheckResult {
  valid: boolean
  conflicts: DependencyConflict[]
  paths: DependencyPath[]
  statistics: {
    totalDependencies: number
    circularDependencies: number
    missingDependencies: number
    timingConflicts: number
    crossTeamDependencies: number
  }
}

/**
 * 依赖检查器类
 */
export class DependencyChecker {
  private nodes: Map<string, DependencyNode> = new Map()
  private edges: Map<string, DependencyEdge[]> = new Map()
  private sprints: Map<string, { startDate: string; endDate: string }> = new Map()

  /**
   * 添加节点
   */
  addNode(node: DependencyNode): void {
    this.nodes.set(node.id, node)
  }

  /**
   * 添加边（依赖关系）
   */
  addEdge(source: string, target: string, type: 'strong' | 'weak' | 'optional', reason?: string): void {
    if (!this.edges.has(source)) {
      this.edges.set(source, [])
    }
    this.edges.get(source)!.push({ source, target, type, reason })
  }

  /**
   * 添加Sprint信息（用于时间检查）
   */
  addSprint(sprintId: string, startDate: string, endDate: string): void {
    this.sprints.set(sprintId, { startDate, endDate })
  }

  /**
   * 检查循环依赖
   */
  checkCircularDependencies(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (nodeId: string, path: string[]): boolean => {
      visited.add(nodeId)
      recursionStack.add(nodeId)
      path.push(nodeId)

      const dependencies = this.edges.get(nodeId) || []
      for (const edge of dependencies) {
        if (!visited.has(edge.target)) {
          if (dfs(edge.target, [...path])) {
            return true
          }
        } else if (recursionStack.has(edge.target)) {
          // 发现循环
          const cycleStart = path.indexOf(edge.target)
          const cycle = path.slice(cycleStart)
          cycle.push(edge.target)

          const cycleNodes = cycle.map(id => this.nodes.get(id)!).filter(Boolean)
          const cycleCodes = cycleNodes.map(n => n.code).join(' → ')

          conflicts.push({
            id: `circular-${nodeId}-${edge.target}`,
            type: 'circular',
            severity: 'error',
            source: this.nodes.get(nodeId)!,
            target: this.nodes.get(edge.target),
            message: `检测到循环依赖: ${cycleCodes}`,
            suggestion: '请移除循环依赖链中的至少一个依赖关系',
            affectedItems: cycleNodes
          })
          return true
        }
      }

      recursionStack.delete(nodeId)
      return false
    }

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId, [])
      }
    }

    return conflicts
  }

  /**
   * 检查缺失的依赖
   */
  checkMissingDependencies(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []

    for (const [sourceId, edges] of this.edges.entries()) {
      const source = this.nodes.get(sourceId)
      if (!source) continue

      for (const edge of edges) {
        const target = this.nodes.get(edge.target)
        if (!target) {
          conflicts.push({
            id: `missing-${sourceId}-${edge.target}`,
            type: 'missing',
            severity: 'error',
            source,
            message: `依赖项不存在: ${source.code} 依赖于 ${edge.target}，但该依赖项未找到`,
            suggestion: '请确认依赖项是否已被删除或ID是否正确'
          })
        } else if (!target.sprintId) {
          conflicts.push({
            id: `unallocated-${sourceId}-${edge.target}`,
            type: 'missing',
            severity: 'warning',
            source,
            target,
            message: `依赖项未分配: ${source.code} 依赖于 ${target.code}，但 ${target.code} 尚未分配到Sprint`,
            suggestion: '请先分配依赖项到Sprint'
          })
        }
      }
    }

    return conflicts
  }

  /**
   * 检查时间冲突（依赖项应该在更早或相同的Sprint）
   */
  checkTimingConflicts(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []

    for (const [sourceId, edges] of this.edges.entries()) {
      const source = this.nodes.get(sourceId)
      if (!source || !source.sprintId) continue

      const sourceSprint = this.sprints.get(source.sprintId)
      if (!sourceSprint) continue

      for (const edge of edges) {
        const target = this.nodes.get(edge.target)
        if (!target || !target.sprintId) continue

        const targetSprint = this.sprints.get(target.sprintId)
        if (!targetSprint) continue

        // 检查依赖项是否在更晚的Sprint
        const sourceStart = new Date(sourceSprint.startDate)
        const targetEnd = new Date(targetSprint.endDate)

        if (targetEnd > sourceStart) {
          const severity = edge.type === 'strong' ? 'error' : edge.type === 'weak' ? 'warning' : 'info'
          conflicts.push({
            id: `timing-${sourceId}-${edge.target}`,
            type: 'timing',
            severity,
            source,
            target,
            message: `时间冲突: ${source.code} 依赖于 ${target.code}，但 ${target.code} 在更晚的Sprint完成`,
            suggestion: edge.type === 'strong' 
              ? '请将依赖项移到更早的Sprint，或调整依赖关系'
              : '建议将依赖项移到更早的Sprint'
          })
        }
      }
    }

    return conflicts
  }

  /**
   * 检查跨团队依赖
   */
  checkCrossTeamDependencies(): DependencyConflict[] {
    const conflicts: DependencyConflict[] = []

    for (const [sourceId, edges] of this.edges.entries()) {
      const source = this.nodes.get(sourceId)
      if (!source || !source.teamId) continue

      for (const edge of edges) {
        const target = this.nodes.get(edge.target)
        if (!target || !target.teamId) continue

        if (source.teamId !== target.teamId) {
          conflicts.push({
            id: `cross-team-${sourceId}-${edge.target}`,
            type: 'cross-team',
            severity: 'info',
            source,
            target,
            message: `跨团队依赖: ${source.code} (${source.teamId}) 依赖于 ${target.code} (${target.teamId})`,
            suggestion: '跨团队依赖需要额外的协调和沟通'
          })
        }
      }
    }

    return conflicts
  }

  /**
   * 获取依赖路径
   */
  getDependencyPath(startId: string, endId?: string): DependencyPath[] {
    const paths: DependencyPath[] = []
    const visited = new Set<string>()

    const dfs = (currentId: string, path: DependencyNode[], issues: string[]) => {
      const current = this.nodes.get(currentId)
      if (!current) return

      visited.add(currentId)
      path.push(current)

      // 如果指定了结束节点，检查是否到达
      if (endId && currentId === endId) {
        paths.push({
          path: [...path],
          isValid: issues.length === 0,
          issues: [...issues]
        })
        visited.delete(currentId)
        return
      }

      const dependencies = this.edges.get(currentId) || []
      
      // 如果没有更多依赖，保存当前路径
      if (dependencies.length === 0 && !endId) {
        paths.push({
          path: [...path],
          isValid: issues.length === 0,
          issues: [...issues]
        })
      }

      for (const edge of dependencies) {
        if (!visited.has(edge.target)) {
          const target = this.nodes.get(edge.target)
          const newIssues = [...issues]

          // 检查依赖是否存在问题
          if (!target) {
            newIssues.push(`依赖项 ${edge.target} 不存在`)
          } else if (!target.sprintId) {
            newIssues.push(`${target.code} 未分配到Sprint`)
          }

          dfs(edge.target, [...path], newIssues)
        }
      }

      visited.delete(currentId)
    }

    dfs(startId, [], [])
    return paths
  }

  /**
   * 获取所有依赖的节点（直接和间接）
   */
  getAllDependencies(nodeId: string): DependencyNode[] {
    const result: DependencyNode[] = []
    const visited = new Set<string>()

    const dfs = (currentId: string) => {
      if (visited.has(currentId)) return
      visited.add(currentId)

      const dependencies = this.edges.get(currentId) || []
      for (const edge of dependencies) {
        const target = this.nodes.get(edge.target)
        if (target) {
          result.push(target)
          dfs(edge.target)
        }
      }
    }

    dfs(nodeId)
    return result
  }

  /**
   * 获取所有依赖当前节点的节点（被依赖）
   */
  getAllDependents(nodeId: string): DependencyNode[] {
    const result: DependencyNode[] = []
    
    for (const [sourceId, edges] of this.edges.entries()) {
      for (const edge of edges) {
        if (edge.target === nodeId) {
          const source = this.nodes.get(sourceId)
          if (source) {
            result.push(source)
          }
        }
      }
    }

    return result
  }

  /**
   * 执行完整检查
   */
  check(): DependencyCheckResult {
    const circularConflicts = this.checkCircularDependencies()
    const missingConflicts = this.checkMissingDependencies()
    const timingConflicts = this.checkTimingConflicts()
    const crossTeamConflicts = this.checkCrossTeamDependencies()

    const allConflicts = [
      ...circularConflicts,
      ...missingConflicts,
      ...timingConflicts,
      ...crossTeamConflicts
    ]

    const paths: DependencyPath[] = []
    for (const nodeId of this.nodes.keys()) {
      const nodePaths = this.getDependencyPath(nodeId)
      paths.push(...nodePaths)
    }

    let totalDeps = 0
    for (const edges of this.edges.values()) {
      totalDeps += edges.length
    }

    return {
      valid: allConflicts.filter(c => c.severity === 'error').length === 0,
      conflicts: allConflicts,
      paths,
      statistics: {
        totalDependencies: totalDeps,
        circularDependencies: circularConflicts.length,
        missingDependencies: missingConflicts.length,
        timingConflicts: timingConflicts.length,
        crossTeamDependencies: crossTeamConflicts.length
      }
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.nodes.clear()
    this.edges.clear()
    this.sprints.clear()
  }
}

/**
 * 创建依赖检查器实例的工厂函数
 */
export function createDependencyChecker(): DependencyChecker {
  return new DependencyChecker()
}
