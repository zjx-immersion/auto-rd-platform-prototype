#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
扩充PI Planning测试数据
添加更多Feature和SSTS，覆盖不同产品
"""

import json
import os
from datetime import datetime

# 基础路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '../frontend/src/mock-data/datasets')

# 新增Feature数据
NEW_FEATURES = [
    {
        "id": "feat-023",
        "code": "FEAT-023",
        "name": "360度环视系统",
        "epicId": "epic-003",
        "projectId": "proj-001",
        "description": "实现4摄像头360度全景环视功能",
        "productLine": "智能驾驶",
        "product": "泊车算法",
        "priority": "high",
        "complexity": "medium",
        "storyPoints": 28,
        "estimate": "5周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-002",
        "sstsIds": [],
        "prd": {
            "content": "<h2>360环视需求</h2><p>实现4摄像头拼接...</p>",
            "version": "1.0",
            "status": "draft"
        },
        "tags": ["环视", "AVM", "泊车"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-002",
        "updatedBy": "user-002",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "feat-024",
        "code": "FEAT-024",
        "name": "记忆泊车",
        "epicId": "epic-003",
        "projectId": "proj-001",
        "description": "实现固定停车位的记忆泊车功能",
        "productLine": "智能驾驶",
        "product": "泊车算法",
        "priority": "medium",
        "complexity": "high",
        "storyPoints": 48,
        "estimate": "9周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-002",
        "sstsIds": [],
        "prd": {
            "content": "<h2>记忆泊车需求</h2><p>学习泊车路径...</p>",
            "version": "1.0",
            "status": "in-review"
        },
        "tags": ["记忆泊车", "RPA", "L4"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-002",
        "updatedBy": "user-002",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "feat-025",
        "code": "FEAT-025",
        "name": "情感化TTS合成",
        "epicId": "epic-004",
        "projectId": "proj-002",
        "description": "实现带情感表达的语音合成功能",
        "productLine": "智能座舱",
        "product": "语音交互系统",
        "priority": "medium",
        "complexity": "medium",
        "storyPoints": 30,
        "estimate": "5周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-003",
        "sstsIds": [],
        "prd": {
            "content": "<h2>情感TTS需求</h2><p>支持多种情感表达...</p>",
            "version": "1.0",
            "status": "approved"
        },
        "tags": ["TTS", "语音", "情感"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-003",
        "updatedBy": "user-003",
        "productId": "prod-005",
        "version": "2.1"
    },
    {
        "id": "feat-026",
        "code": "FEAT-026",
        "name": "声纹识别",
        "epicId": "epic-004",
        "projectId": "proj-002",
        "description": "实现基于声纹的用户身份识别",
        "productLine": "智能座舱",
        "product": "语音交互系统",
        "priority": "low",
        "complexity": "high",
        "storyPoints": 40,
        "estimate": "7周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-003",
        "sstsIds": [],
        "prd": {
            "content": "<h2>声纹识别需求</h2><p>声纹特征提取...</p>",
            "version": "0.9",
            "status": "draft"
        },
        "tags": ["声纹", "识别", "安全"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-003",
        "updatedBy": "user-003",
        "productId": "prod-005",
        "version": "2.1"
    },
    {
        "id": "feat-027",
        "code": "FEAT-027",
        "name": "AR驾驶辅助提示",
        "epicId": "epic-005",
        "projectId": "proj-002",
        "description": "在AR-HUD上显示ADAS功能状态和提示",
        "productLine": "智能座舱",
        "product": "AR-HUD系统",
        "priority": "high",
        "complexity": "medium",
        "storyPoints": 32,
        "estimate": "6周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-003",
        "sstsIds": [],
        "prd": {
            "content": "<h2>AR驾驶辅助需求</h2><p>实时叠加ADAS信息...</p>",
            "version": "1.0",
            "status": "in-review"
        },
        "tags": ["AR", "HUD", "ADAS"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-003",
        "updatedBy": "user-003",
        "productId": "prod-006",
        "version": "1.3"
    },
    {
        "id": "feat-028",
        "code": "FEAT-028",
        "name": "AR车道线投射",
        "epicId": "epic-005",
        "projectId": "proj-002",
        "description": "在AR-HUD上投射车道线和车道保持提示",
        "productLine": "智能座舱",
        "product": "AR-HUD系统",
        "priority": "high",
        "complexity": "high",
        "storyPoints": 44,
        "estimate": "8周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-003",
        "sstsIds": [],
        "prd": {
            "content": "<h2>AR车道线需求</h2><p>实时车道线识别和投射...</p>",
            "version": "1.0",
            "status": "approved"
        },
        "tags": ["AR", "车道线", "HUD"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-003",
        "updatedBy": "user-003",
        "productId": "prod-006",
        "version": "1.3"
    },
    {
        "id": "feat-029",
        "code": "FEAT-029",
        "name": "疲劳检测预警",
        "epicId": "epic-008",
        "projectId": "proj-002",
        "description": "基于眼动和人脸识别的疲劳检测",
        "productLine": "智能座舱",
        "product": "多模交互",
        "priority": "high",
        "complexity": "medium",
        "storyPoints": 35,
        "estimate": "6周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-004",
        "sstsIds": [],
        "prd": {
            "content": "<h2>疲劳检测需求</h2><p>实时检测驾驶员疲劳状态...</p>",
            "version": "1.0",
            "status": "approved"
        },
        "tags": ["疲劳", "监测", "安全"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-004",
        "updatedBy": "user-004",
        "productId": "prod-007",
        "version": "1.0"
    },
    {
        "id": "feat-030",
        "code": "FEAT-030",
        "name": "驾驶模式自适应",
        "epicId": "epic-008",
        "projectId": "proj-002",
        "description": "根据驾驶员状态自适应调整驾驶模式",
        "productLine": "智能座舱",
        "product": "多模交互",
        "priority": "medium",
        "complexity": "high",
        "storyPoints": 42,
        "estimate": "7周",
        "status": "backlog",
        "targetVersion": None,
        "targetPI": "pi-001",
        "owner": "user-004",
        "sstsIds": [],
        "prd": {
            "content": "<h2>模式自适应需求</h2><p>智能调整驾驶体验...</p>",
            "version": "0.9",
            "status": "draft"
        },
        "tags": ["自适应", "驾驶", "AI"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "createdBy": "user-004",
        "updatedBy": "user-004",
        "productId": "prod-007",
        "version": "1.0"
    }
]

# 新增SSTS数据
NEW_SSTS = [
    # FEAT-001 (ACC) 的SSTS
    {
        "id": "ssts-005",
        "code": "SSTS-005",
        "title": "ACC控制器核心算法",
        "featureId": "feat-001",
        "moduleName": "ACC控制模块",
        "description": "实现ACC速度和距离控制算法",
        "estimate": "3周",
        "storyPoints": 13,
        "priority": "high",
        "status": "done",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["ACC", "控制算法"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-001",
        "version": "1.0"
    },
    {
        "id": "ssts-006",
        "code": "SSTS-006",
        "title": "ACC雷达数据处理",
        "featureId": "feat-001",
        "moduleName": "传感器融合",
        "description": "处理毫米波雷达数据，提取目标信息",
        "estimate": "2周",
        "storyPoints": 8,
        "priority": "high",
        "status": "done",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["ACC", "雷达"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-001",
        "version": "1.0"
    },
    {
        "id": "ssts-007",
        "code": "SSTS-007",
        "title": "ACC人机交互界面",
        "featureId": "feat-001",
        "moduleName": "HMI模块",
        "description": "实现ACC功能的开关、设置和状态显示",
        "estimate": "2周",
        "storyPoints": 5,
        "priority": "medium",
        "status": "done",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-005", "targetId": "ssts-005", "type": "strong"}
        ],
        "tags": ["ACC", "HMI"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-001",
        "version": "1.0"
    },
    {
        "id": "ssts-008",
        "code": "SSTS-008",
        "title": "ACC故障诊断",
        "featureId": "feat-001",
        "moduleName": "诊断模块",
        "description": "实现ACC系统的故障检测和诊断",
        "estimate": "1周",
        "storyPoints": 3,
        "priority": "medium",
        "status": "done",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-006", "targetId": "ssts-005", "type": "strong"}
        ],
        "tags": ["ACC", "诊断"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-001",
        "version": "1.0"
    },
    # FEAT-002 (LKA) 的SSTS - 已添加到原始数据
    # FEAT-023 (360环视) 的SSTS
    {
        "id": "ssts-009",
        "code": "SSTS-009",
        "title": "4摄像头图像采集",
        "featureId": "feat-023",
        "moduleName": "图像采集",
        "description": "实现4个环视摄像头的图像采集和同步",
        "estimate": "2周",
        "storyPoints": 8,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["环视", "采集"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "ssts-010",
        "code": "SSTS-010",
        "title": "图像拼接算法",
        "featureId": "feat-023",
        "moduleName": "图像处理",
        "description": "实现4图像无缝拼接算法",
        "estimate": "2周",
        "storyPoints": 10,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-007", "targetId": "ssts-009", "type": "strong"}
        ],
        "tags": ["环视", "拼接"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "ssts-011",
        "code": "SSTS-011",
        "title": "环视HMI显示",
        "featureId": "feat-023",
        "moduleName": "HMI模块",
        "description": "实现360环视图像的显示和交互",
        "estimate": "1周",
        "storyPoints": 5,
        "priority": "medium",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-008", "targetId": "ssts-010", "type": "strong"}
        ],
        "tags": ["环视", "HMI"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    # FEAT-024 (记忆泊车) 的SSTS
    {
        "id": "ssts-012",
        "code": "SSTS-012",
        "title": "泊车路径学习",
        "featureId": "feat-024",
        "moduleName": "路径规划",
        "description": "记录和学习固定泊车位的行驶路径",
        "estimate": "3周",
        "storyPoints": 15,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["记忆泊车", "学习"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "ssts-013",
        "code": "SSTS-013",
        "title": "自动复现泊车",
        "featureId": "feat-024",
        "moduleName": "路径跟踪",
        "description": "自动复现学习的泊车路径",
        "estimate": "3周",
        "storyPoints": 18,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-009", "targetId": "ssts-012", "type": "strong"}
        ],
        "tags": ["记忆泊车", "复现"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    {
        "id": "ssts-014",
        "code": "SSTS-014",
        "title": "环境变化检测",
        "featureId": "feat-024",
        "moduleName": "感知模块",
        "description": "检测泊车环境变化，判断是否可执行",
        "estimate": "2周",
        "storyPoints": 10,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["记忆泊车", "感知"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-004",
        "version": "1.0"
    },
    # FEAT-025 (情感TTS) 的SSTS
    {
        "id": "ssts-015",
        "code": "SSTS-015",
        "title": "情感参数模型",
        "featureId": "feat-025",
        "moduleName": "TTS引擎",
        "description": "建立情感表达的声学参数模型",
        "estimate": "2周",
        "storyPoints": 12,
        "priority": "medium",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["TTS", "情感"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-005",
        "version": "2.1"
    },
    {
        "id": "ssts-016",
        "code": "SSTS-016",
        "title": "情感合成引擎",
        "featureId": "feat-025",
        "moduleName": "TTS引擎",
        "description": "实现支持情感表达的TTS合成",
        "estimate": "2周",
        "storyPoints": 13,
        "priority": "medium",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-010", "targetId": "ssts-015", "type": "strong"}
        ],
        "tags": ["TTS", "合成"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-005",
        "version": "2.1"
    },
    # FEAT-027 (AR驾驶辅助) 的SSTS
    {
        "id": "ssts-017",
        "code": "SSTS-017",
        "title": "ADAS状态信息提取",
        "featureId": "feat-027",
        "moduleName": "数据接口",
        "description": "从ADAS模块提取状态和提示信息",
        "estimate": "1周",
        "storyPoints": 5,
        "priority": "high",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["AR", "ADAS"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-006",
        "version": "1.3"
    },
    {
        "id": "ssts-018",
        "code": "SSTS-018",
        "title": "AR图形渲染",
        "featureId": "feat-027",
        "moduleName": "AR渲染",
        "description": "在HUD上渲染ADAS辅助图形",
        "estimate": "3周",
        "storyPoints": 15,
        "priority": "high",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-011", "targetId": "ssts-017", "type": "strong"}
        ],
        "tags": ["AR", "渲染"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-006",
        "version": "1.3"
    },
    {
        "id": "ssts-019",
        "code": "SSTS-019",
        "title": "AR透视对齐",
        "featureId": "feat-027",
        "moduleName": "AR渲染",
        "description": "实现AR图形与真实世界的准确对齐",
        "estimate": "2周",
        "storyPoints": 10,
        "priority": "high",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["AR", "对齐"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-006",
        "version": "1.3"
    },
    # FEAT-028 (AR车道线) 的SSTS
    {
        "id": "ssts-020",
        "code": "SSTS-020",
        "title": "车道线实时识别",
        "featureId": "feat-028",
        "moduleName": "感知模块",
        "description": "实时识别前方车道线位置",
        "estimate": "3周",
        "storyPoints": 15,
        "priority": "high",
        "status": "backlog",
        "owner": "user-002",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["AR", "车道线"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-006",
        "version": "1.3"
    },
    {
        "id": "ssts-021",
        "code": "SSTS-021",
        "title": "车道线AR投射",
        "featureId": "feat-028",
        "moduleName": "AR渲染",
        "description": "将车道线投射到HUD上",
        "estimate": "3周",
        "storyPoints": 18,
        "priority": "high",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-012", "targetId": "ssts-020", "type": "strong"}
        ],
        "tags": ["AR", "投射"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-006",
        "version": "1.3"
    },
    # FEAT-029 (疲劳检测) 的SSTS
    {
        "id": "ssts-022",
        "code": "SSTS-022",
        "title": "眼动特征提取",
        "featureId": "feat-029",
        "moduleName": "视觉算法",
        "description": "提取眼睛疲劳特征（眨眼频率、闭眼时长等）",
        "estimate": "2周",
        "storyPoints": 12,
        "priority": "high",
        "status": "backlog",
        "owner": "user-004",
        "targetPI": "pi-001",
        "dependencies": [],
        "tags": ["疲劳", "眼动"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-007",
        "version": "1.0"
    },
    {
        "id": "ssts-023",
        "code": "SSTS-023",
        "title": "疲劳判断算法",
        "featureId": "feat-029",
        "moduleName": "AI算法",
        "description": "基于多特征的疲劳状态判断算法",
        "estimate": "2周",
        "storyPoints": 13,
        "priority": "high",
        "status": "backlog",
        "owner": "user-004",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-013", "targetId": "ssts-022", "type": "strong"}
        ],
        "tags": ["疲劳", "算法"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-007",
        "version": "1.0"
    },
    {
        "id": "ssts-024",
        "code": "SSTS-024",
        "title": "疲劳预警提示",
        "featureId": "feat-029",
        "moduleName": "HMI模块",
        "description": "疲劳检测到时的多模态预警",
        "estimate": "1周",
        "storyPoints": 5,
        "priority": "medium",
        "status": "backlog",
        "owner": "user-003",
        "targetPI": "pi-001",
        "dependencies": [
            {"id": "dep-014", "targetId": "ssts-023", "type": "strong"}
        ],
        "tags": ["疲劳", "预警"],
        "createdAt": "2026-01-19T10:00:00Z",
        "updatedAt": "2026-01-19T10:00:00Z",
        "productId": "prod-007",
        "version": "1.0"
    }
]


def load_json(filename):
    """加载JSON文件"""
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filename, data):
    """保存JSON文件"""
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ 已保存: {filename}")


def main():
    print("=" * 60)
    print("开始扩充PI Planning测试数据...")
    print("=" * 60)
    
    # 1. 加载现有数据
    print("\n1. 加载现有数据...")
    features_data = load_json('features.json')
    ssts_data = load_json('ssts.json')
    
    original_features_count = len(features_data['data'])
    original_ssts_count = len(ssts_data['data'])
    
    print(f"   原有Feature数量: {original_features_count}")
    print(f"   原有SSTS数量: {original_ssts_count}")
    
    # 2. 添加新Feature
    print("\n2. 添加新Feature...")
    features_data['data'].extend(NEW_FEATURES)
    features_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    print(f"   新增Feature数量: {len(NEW_FEATURES)}")
    print(f"   总Feature数量: {len(features_data['data'])}")
    
    # 3. 添加新SSTS
    print("\n3. 添加新SSTS...")
    ssts_data['data'].extend(NEW_SSTS)
    ssts_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    print(f"   新增SSTS数量: {len(NEW_SSTS)}")
    print(f"   总SSTS数量: {len(ssts_data['data'])}")
    
    # 4. 统计各产品的Feature和SSTS数量
    print("\n4. 各产品Feature和SSTS分布:")
    print("   " + "-" * 56)
    print(f"   {'产品':30s} | Feature | SSTS")
    print("   " + "-" * 56)
    
    product_stats = {}
    for feature in features_data['data']:
        prod_id = feature.get('productId')
        prod_name = feature.get('product', 'Unknown')
        if prod_id not in product_stats:
            product_stats[prod_id] = {'name': prod_name, 'features': 0, 'ssts': 0}
        product_stats[prod_id]['features'] += 1
    
    for ssts in ssts_data['data']:
        prod_id = ssts.get('productId')
        if prod_id in product_stats:
            product_stats[prod_id]['ssts'] += 1
    
    for prod_id, stats in sorted(product_stats.items()):
        print(f"   {stats['name']:30s} | {stats['features']:7d} | {stats['ssts']:4d}")
    
    print("   " + "-" * 56)
    
    # 5. 保存数据
    print("\n5. 保存数据...")
    save_json('features.json', features_data)
    save_json('ssts.json', ssts_data)
    
    print("\n" + "=" * 60)
    print("✅ 数据扩充完成！")
    print(f"   Feature: {original_features_count} → {len(features_data['data'])} (+{len(NEW_FEATURES)})")
    print(f"   SSTS: {original_ssts_count} → {len(ssts_data['data'])} (+{len(NEW_SSTS)})")
    print("=" * 60)


if __name__ == '__main__':
    main()
