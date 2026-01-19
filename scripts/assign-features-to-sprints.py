#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为Feature分配Sprint，生成PI Planning看板的测试数据
"""

import json
import os
from datetime import datetime

# 基础路径
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, '../frontend/src/mock-data/datasets')


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
    print("为Feature分配Sprint...")
    print("=" * 60)
    
    # 加载数据
    print("\n1. 加载数据...")
    features_data = load_json('features.json')
    sprints_data = load_json('sprints.json')
    
    # 获取pi-001的所有Sprint ID
    pi001_sprints = [s for s in sprints_data['data'] if s['piId'] == 'pi-001']
    sprint_ids = [s['id'] for s in pi001_sprints]
    
    print(f"   Feature数量: {len(features_data['data'])}")
    print(f"   pi-001的Sprint数量: {len(sprint_ids)}")
    print(f"   Sprint IDs: {sprint_ids}")
    
    # 为Feature分配Sprint
    print("\n2. 为Feature分配Sprint...")
    
    # Feature到Sprint的分配规则
    feature_sprint_mapping = {
        # ADAS核心算法产品
        "feat-001": "sprint-001",  # ACC - Sprint 1
        "feat-002": "sprint-002",  # LKA - Sprint 2
        "feat-003": "sprint-pi001-003",  # ALC - Sprint 3
        
        # 感知算法产品
        "feat-004": "sprint-pi001-004",  # 红绿灯识别 - Sprint 4
        
        # 决策规划算法产品
        "feat-005": "sprint-pi001-004",  # 路口通行决策 - Sprint 4
        
        # 泊车算法产品
        "feat-006": "sprint-pi001-003",  # 自动泊车APA - Sprint 3
        "feat-023": "sprint-001",  # 360环视 - Sprint 1
        "feat-024": "sprint-pi001-005",  # 记忆泊车 - Sprint 5 (横跨2个Sprint)
        
        # 语音交互系统产品
        "feat-007": "sprint-002",  # 语音唤醒 - Sprint 2
        "feat-008": "sprint-pi001-003",  # 多轮对话 - Sprint 3
        "feat-025": "sprint-pi001-004",  # 情感TTS - Sprint 4
        "feat-026": "sprint-pi001-006",  # 声纹识别 - Sprint 6
        
        # AR-HUD系统产品
        "feat-009": "sprint-pi001-005",  # AR导航 - Sprint 5
        "feat-027": "sprint-001",  # AR驾驶辅助 - Sprint 1
        "feat-028": "sprint-002",  # AR车道线 - Sprint 2 (横跨2个Sprint)
        
        # 多模交互产品
        "feat-014": "sprint-pi001-005",  # 手势识别 - Sprint 5
        "feat-015": "sprint-pi001-005",  # 眼动追踪 - Sprint 5
        "feat-016": "sprint-pi001-006",  # 多模态融合 - Sprint 6
        "feat-029": "sprint-002",  # 疲劳检测 - Sprint 2
        "feat-030": "sprint-pi001-003",  # 驾驶模式自适应 - Sprint 3
        
        # 地图服务产品
        "feat-011": "sprint-pi001-003",  # 高精地图采集 - Sprint 3
        "feat-012": "sprint-pi001-005",  # 地图匹配 - Sprint 5
        "feat-013": "sprint-pi001-006",  # 地图云端更新 - Sprint 6
        
        # OTA平台产品
        "feat-017": "sprint-pi001-006",  # OTA管理平台 - Sprint 6
        "feat-018": "sprint-pi001-005",  # 差分升级算法 - Sprint 5
        "feat-019": "sprint-pi001-006",  # 多域协同升级 - Sprint 6
        
        # V2X系统产品
        "feat-020": "sprint-pi001-004",  # C-V2X协议栈 - Sprint 4
        "feat-021": "sprint-pi001-005",  # V2X消息解析 - Sprint 5
        "feat-022": "sprint-pi001-006",  # V2X场景应用 - Sprint 6
    }
    
    assigned_count = 0
    for feature in features_data['data']:
        feat_id = feature['id']
        if feat_id in feature_sprint_mapping:
            feature['targetSprint'] = feature_sprint_mapping[feat_id]
            feature['targetPI'] = 'pi-001'
            assigned_count += 1
            print(f"   ✓ {feature['code']:12s} → {feature['targetSprint']} ({feature['name'][:20]}...)")
    
    features_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    print(f"\n   已分配: {assigned_count}/{len(features_data['data'])} 个Feature")
    
    # 保存数据
    print("\n3. 保存数据...")
    save_json('features.json', features_data)
    
    # 统计各Sprint的Feature分布
    print("\n4. 各Sprint的Feature分布:")
    print("   " + "-" * 60)
    print(f"   {'Sprint':20s} | Feature数量 | Feature列表")
    print("   " + "-" * 60)
    
    sprint_features = {}
    for sprint in pi001_sprints:
        sprint_features[sprint['id']] = {
            'name': sprint['name'],
            'features': []
        }
    
    for feature in features_data['data']:
        sprint_id = feature.get('targetSprint')
        if sprint_id in sprint_features:
            sprint_features[sprint_id]['features'].append(feature['code'])
    
    for sprint_id in sorted(sprint_features.keys()):
        info = sprint_features[sprint_id]
        features_str = ', '.join(info['features'])
        print(f"   {info['name']:20s} | {len(info['features']):11d} | {features_str}")
    
    print("   " + "-" * 60)
    
    print("\n" + "=" * 60)
    print("✅ Feature Sprint分配完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()
