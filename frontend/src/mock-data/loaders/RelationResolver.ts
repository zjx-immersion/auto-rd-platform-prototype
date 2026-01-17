/**
 * 关系解析器
 * 自动解析和填充实体间的关系
 */

import { dataLoader } from './DataLoader'

export class RelationResolver {
  /**
   * 解析项目的完整数据（包含关联）
   */
  resolveProject(projectId: string) {
    const project = dataLoader.findById('projects', projectId)
    if (!project) return null

    return {
      ...project,
      // 自动加载关联的版本
      versions: dataLoader.getRelated('versions', 'projectId', projectId),
      // 自动加载关联的PI
      pis: dataLoader.getRelatedByArray('pis', 'projectIds', projectId),
      // 自动加载关联的Epic
      epics: dataLoader.getRelated('epics', 'projectId', projectId),
      // 自动加载负责人信息
      ownerInfo: project.owner ? dataLoader.findById('users', project.owner) : null
    }
  }

  /**
   * 解析Epic的完整数据
   */
  resolveEpic(epicId: string) {
    const epic = dataLoader.findById('epics', epicId)
    if (!epic) return null

    return {
      ...epic,
      // 自动加载Features
      features: dataLoader.getRelated('features', 'epicId', epicId),
      // 自动加载目标PI
      targetPIInfo: epic.targetPI 
        ? dataLoader.findById('pis', epic.targetPI)
        : null,
      // 自动加载项目信息
      projectInfo: epic.projectId
        ? dataLoader.findById('projects', epic.projectId)
        : null,
      // 自动加载负责人
      ownerInfo: epic.owner ? dataLoader.findById('users', epic.owner) : null
    }
  }

  /**
   * 解析Feature的完整数据
   */
  resolveFeature(featureId: string) {
    const feature = dataLoader.findById('features', featureId)
    if (!feature) return null

    return {
      ...feature,
      // 自动加载Epic
      epicInfo: feature.epicId 
        ? dataLoader.findById('epics', feature.epicId)
        : null,
      // 自动加载SSTS
      sstsList: dataLoader.getRelated('ssts', 'featureId', featureId),
      // 自动加载目标版本
      targetVersionInfo: feature.targetVersion
        ? dataLoader.findById('versions', feature.targetVersion)
        : null,
      // 自动加载目标PI
      targetPIInfo: feature.targetPI
        ? dataLoader.findById('pis', feature.targetPI)
        : null,
      // 自动加载负责人
      ownerInfo: feature.owner ? dataLoader.findById('users', feature.owner) : null
    }
  }

  /**
   * 解析PI的完整数据
   */
  resolvePI(piId: string) {
    const pi = dataLoader.findById('pis', piId)
    if (!pi) return null

    return {
      ...pi,
      // 自动加载关联的项目
      projects: pi.projectIds 
        ? pi.projectIds.map((id: string) => dataLoader.findById('projects', id)).filter(Boolean)
        : [],
      // 自动加载关联的Epic
      epics: pi.epicIds
        ? pi.epicIds.map((id: string) => dataLoader.findById('epics', id)).filter(Boolean)
        : [],
      // 自动加载关联的Feature
      features: pi.featureIds
        ? pi.featureIds.map((id: string) => dataLoader.findById('features', id)).filter(Boolean)
        : [],
      // 自动加载负责人
      ownerInfo: pi.owner ? dataLoader.findById('users', pi.owner) : null
    }
  }

  /**
   * 解析版本的完整数据
   */
  resolveVersion(versionId: string) {
    const version = dataLoader.findById('versions', versionId)
    if (!version) return null

    return {
      ...version,
      // 自动加载项目信息
      projectInfo: version.projectId
        ? dataLoader.findById('projects', version.projectId)
        : null,
      // 自动加载关联的Feature
      features: version.featureIds
        ? version.featureIds.map((id: string) => dataLoader.findById('features', id)).filter(Boolean)
        : []
    }
  }

  /**
   * 批量解析（用于列表页面）
   */
  resolveMany(datasetName: string, ids: string[]) {
    const methodMap: Record<string, string> = {
      'projects': 'resolveProject',
      'epics': 'resolveEpic',
      'features': 'resolveFeature',
      'pis': 'resolvePI',
      'versions': 'resolveVersion'
    }

    const resolveMethod = methodMap[datasetName]
    if (resolveMethod && typeof (this as any)[resolveMethod] === 'function') {
      return ids.map(id => (this as any)[resolveMethod](id)).filter(Boolean)
    }
    
    return ids.map(id => dataLoader.findById(datasetName, id)).filter(Boolean)
  }
}

// 单例
export const relationResolver = new RelationResolver()
