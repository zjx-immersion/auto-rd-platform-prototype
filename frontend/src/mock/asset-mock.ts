/**
 * 资产管理Mock数据生成器
 * 生成ProductLine、Product、Asset测试数据
 */

import type { ProductLine, Product, Asset } from '@/types'
import {
  generateId,
  generateCode,
  generateDate,
  randomChoice,
  randomInt,
  DOMAINS,
  USERS
} from './helpers'

/**
 * 生成产品线Mock数据
 */
export function generateMockProductLine(domain: string): ProductLine {
  const id = generateId()
  const code = generateCode('PL')
  
  const productLineNames: Record<string, string[]> = {
    '智能驾驶': ['L2+辅助驾驶产品线', 'L3城市领航产品线', 'L4自动泊车产品线'],
    '智能座舱': ['智能交互产品线', '车载娱乐产品线', '智能语音产品线'],
    '电子电器': ['车身控制产品线', '网关通信产品线', '诊断OTA产品线'],
    '底盘架构': ['动力控制产品线', '制动转向产品线', '悬架调节产品线'],
    '新能源': ['电池管理产品线', '电机控制产品线', '充电管理产品线']
  }

  const name = randomChoice(productLineNames[domain] || ['通用产品线'])

  return {
    id,
    code,
    name,
    domain,
    description: `${name}的完整解决方案`,
    owner: randomChoice(USERS).id,
    status: randomChoice(['active', 'planning', 'archived']),
    products: [],
    createdAt: generateDate(-180, -90),
    updatedAt: generateDate(-30, 0)
  }
}

/**
 * 批量生成产品线
 */
export function generateMockProductLines(count: number = 5): ProductLine[] {
  const productLines: ProductLine[] = []
  const domains = Object.keys(DOMAINS)
  
  for (let i = 0; i < count; i++) {
    const domain = domains[i % domains.length]
    productLines.push(generateMockProductLine(domain))
  }
  
  return productLines
}

/**
 * 生成产品Mock数据
 */
export function generateMockProduct(productLineId: string, index: number): Product {
  const id = generateId()
  const code = generateCode('PRD')
  
  const productNames = [
    '感知融合模块',
    '决策规划模块',
    '控制执行模块',
    'HMI交互模块',
    '语音识别模块',
    '视觉识别模块',
    '车身控制模块',
    '网关通信模块',
    '动力控制模块',
    '制动系统模块',
    '电池管理模块',
    '电机控制模块'
  ]

  const name = `${productNames[index % productNames.length]} V${randomInt(1, 3)}.${randomInt(0, 9)}`

  return {
    id,
    code,
    name,
    productLineId,
    version: `V${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 9)}`,
    description: `${name}的核心功能实现`,
    owner: randomChoice(USERS).id,
    status: randomChoice(['active', 'developing', 'deprecated']),
    releaseDate: generateDate(-90, 0),
    createdAt: generateDate(-180, -90),
    updatedAt: generateDate(-30, 0)
  }
}

/**
 * 批量生成产品
 */
export function generateMockProducts(productLineId: string, count: number = 3): Product[] {
  const products: Product[] = []
  
  for (let i = 0; i < count; i++) {
    products.push(generateMockProduct(productLineId, i))
  }
  
  return products
}

/**
 * 生成资产Mock数据
 */
export function generateMockAsset(productId: string, index: number): Asset {
  const id = generateId()
  const code = generateCode('ASSET')
  
  const assetTypes = [
    'component',
    'library',
    'framework',
    'service',
    'algorithm',
    'model',
    'tool'
  ]

  const assetNames = [
    '目标检测算法',
    '车道线识别算法',
    '障碍物跟踪算法',
    'HMI渲染引擎',
    '语音识别引擎',
    '手势识别算法',
    'CAN通信库',
    '诊断协议栈',
    'OTA升级框架',
    '电机控制算法',
    'SOC估算算法',
    '热管理算法'
  ]

  const name = assetNames[index % assetNames.length]
  const type = randomChoice(assetTypes)
  const maturityLevel = randomChoice(['L1', 'L2', 'L3', 'L4', 'L5'])
  const reuseCount = randomInt(0, 20)

  const tags = []
  if (name.includes('算法')) tags.push('算法', 'AI')
  if (name.includes('引擎')) tags.push('引擎', '框架')
  if (name.includes('库') || name.includes('协议')) tags.push('库', '通信')
  if (name.includes('识别')) tags.push('识别', '感知')
  if (name.includes('控制')) tags.push('控制', '执行')

  return {
    id,
    code,
    name,
    productId,
    type,
    description: `${name}的完整实现，包含核心算法和接口定义`,
    maturityLevel,
    reuseCount,
    techStack: randomChoice([
      'C++17, Python3.8, TensorFlow',
      'C++14, Qt5.15, OpenCV',
      'C++11, Boost, gRPC',
      'Python3.9, PyTorch, ONNX'
    ]),
    interfaceSpec: `${code}_API_Spec_v1.0.pdf`,
    testCoverage: `${randomInt(70, 95)}%`,
    owner: randomChoice(USERS).id,
    status: randomChoice(['available', 'in-use', 'deprecated', 'under-review']),
    tags,
    createdAt: generateDate(-365, -180),
    updatedAt: generateDate(-60, 0),
    metadata: {
      repository: `https://git.company.com/assets/${code.toLowerCase()}`,
      documentation: `https://docs.company.com/assets/${code.toLowerCase()}`,
      license: 'Proprietary',
      dependencies: randomInt(2, 8),
      lastValidation: generateDate(-30, 0)
    }
  }
}

/**
 * 批量生成资产
 */
export function generateMockAssets(productId: string, count: number = 5): Asset[] {
  const assets: Asset[] = []
  
  for (let i = 0; i < count; i++) {
    assets.push(generateMockAsset(productId, i))
  }
  
  return assets
}

/**
 * 生成完整的资产层次结构
 * ProductLine → Product → Asset
 */
export function generateMockAssetHierarchy(productLineCount: number = 3) {
  const hierarchy: {
    productLines: ProductLine[]
    products: Product[]
    assets: Asset[]
  } = {
    productLines: [],
    products: [],
    assets: []
  }

  // 生成产品线
  hierarchy.productLines = generateMockProductLines(productLineCount)

  // 为每个产品线生成产品
  for (const productLine of hierarchy.productLines) {
    const products = generateMockProducts(productLine.id, 3)
    hierarchy.products.push(...products)

    // 为每个产品生成资产
    for (const product of products) {
      const assets = generateMockAssets(product.id, randomInt(3, 8))
      hierarchy.assets.push(...assets)
    }
  }

  return hierarchy
}

/**
 * 生成高成熟度资产（用于推荐）
 */
export function generateHighMaturityAssets(count: number = 10): Asset[] {
  const assets: Asset[] = []
  
  for (let i = 0; i < count; i++) {
    const asset = generateMockAsset('mock-product-id', i)
    asset.maturityLevel = randomChoice(['L3', 'L4', 'L5'])
    asset.reuseCount = randomInt(5, 20)
    asset.testCoverage = `${randomInt(85, 98)}%`
    assets.push(asset)
  }
  
  return assets
}
