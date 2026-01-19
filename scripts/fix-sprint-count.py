#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复Sprint数量，为每个PI添加完整的6个Sprint
"""

import json
import os
from datetime import datetime, timedelta

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
    print("开始修复Sprint数量...")
    print("=" * 60)
    
    # 加载数据
    print("\n1. 加载数据...")
    sprints_data = load_json('sprints.json')
    teams_data = load_json('teams.json')
    
    print(f"   原有Sprint数量: {len(sprints_data['data'])}")
    print(f"   Teams数量: {len(teams_data['data'])}")
    
    # 为pi-001添加Sprint 3-6
    print("\n2. 为2026 Q1 PI (pi-001)添加Sprint 3-6...")
    
    new_sprints = [
        {
            "id": "sprint-pi001-003",
            "code": "SPRINT-2026-01-03",
            "name": "Sprint 2026-01-03",
            "piId": "pi-001",
            "startDate": "2026-01-29",
            "endDate": "2026-02-11",
            "duration": 14,
            "goal": "完成泊车算法核心功能开发",
            "capacity": 100,
            "committedStoryPoints": 0,
            "completedStoryPoints": 0,
            "taskIds": [],
            "mrIds": [],
            "status": "planning",
            "velocity": 0,
            "events": [],
            "scrumMaster": "user-001",
            "productOwner": "user-002",
            "createdAt": "2026-01-19T12:00:00Z",
            "updatedAt": "2026-01-19T12:00:00Z",
            "createdBy": "user-001",
            "updatedBy": "user-001"
        },
        {
            "id": "sprint-pi001-004",
            "code": "SPRINT-2026-01-04",
            "name": "Sprint 2026-01-04",
            "piId": "pi-001",
            "startDate": "2026-02-12",
            "endDate": "2026-02-25",
            "duration": 14,
            "goal": "完成语音交互功能开发",
            "capacity": 100,
            "committedStoryPoints": 0,
            "completedStoryPoints": 0,
            "taskIds": [],
            "mrIds": [],
            "status": "planning",
            "velocity": 0,
            "events": [],
            "scrumMaster": "user-001",
            "productOwner": "user-002",
            "createdAt": "2026-01-19T12:00:00Z",
            "updatedAt": "2026-01-19T12:00:00Z",
            "createdBy": "user-001",
            "updatedBy": "user-001"
        },
        {
            "id": "sprint-pi001-005",
            "code": "SPRINT-2026-01-05",
            "name": "Sprint 2026-01-05",
            "piId": "pi-001",
            "startDate": "2026-02-26",
            "endDate": "2026-03-11",
            "duration": 14,
            "goal": "完成AR-HUD功能开发",
            "capacity": 100,
            "committedStoryPoints": 0,
            "completedStoryPoints": 0,
            "taskIds": [],
            "mrIds": [],
            "status": "planning",
            "velocity": 0,
            "events": [],
            "scrumMaster": "user-001",
            "productOwner": "user-002",
            "createdAt": "2026-01-19T12:00:00Z",
            "updatedAt": "2026-01-19T12:00:00Z",
            "createdBy": "user-001",
            "updatedBy": "user-001"
        },
        {
            "id": "sprint-pi001-006",
            "code": "SPRINT-2026-01-06",
            "name": "Sprint 2026-01-06",
            "piId": "pi-001",
            "startDate": "2026-03-12",
            "endDate": "2026-03-25",
            "duration": 14,
            "goal": "完成多模交互功能开发",
            "capacity": 100,
            "committedStoryPoints": 0,
            "completedStoryPoints": 0,
            "taskIds": [],
            "mrIds": [],
            "status": "planning",
            "velocity": 0,
            "events": [],
            "scrumMaster": "user-001",
            "productOwner": "user-002",
            "createdAt": "2026-01-19T12:00:00Z",
            "updatedAt": "2026-01-19T12:00:00Z",
            "createdBy": "user-001",
            "updatedBy": "user-001"
        }
    ]
    
    for sprint in new_sprints:
        print(f"   + {sprint['name']} ({sprint['startDate']} ~ {sprint['endDate']})")
        sprints_data['data'].append(sprint)
    
    sprints_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    print(f"\n   总Sprint数量: {len(sprints_data['data'])}")
    
    # 保存数据
    print("\n3. 保存数据...")
    save_json('sprints.json', sprints_data)
    
    # 统计各PI的Sprint数量
    print("\n4. 各PI的Sprint分布:")
    print("   " + "-" * 50)
    print(f"   {'PI':20s} | Sprint数量")
    print("   " + "-" * 50)
    
    pi_sprints = {}
    for sprint in sprints_data['data']:
        pi_id = sprint['piId']
        if pi_id not in pi_sprints:
            pi_sprints[pi_id] = []
        pi_sprints[pi_id].append(sprint['name'])
    
    for pi_id, sprints in sorted(pi_sprints.items()):
        print(f"   {pi_id:20s} | {len(sprints):6d} 个Sprint")
    
    print("   " + "-" * 50)
    
    print("\n" + "=" * 60)
    print("✅ Sprint数量修复完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()
