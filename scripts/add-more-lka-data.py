#!/usr/bin/env python3
"""
为LKA团队添加更多测试数据
"""

import json
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent / "frontend" / "src" / "mock-data" / "datasets"
MRS_FILE = BASE_DIR / "mrs.json"
SSTS_FILE = BASE_DIR / "ssts.json"

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("为LKA团队添加更多MR...")
    
    mrs_data = load_json(MRS_FILE)
    ssts_data = load_json(SSTS_FILE)
    
    all_mrs = mrs_data['data']
    all_ssts = ssts_data['data']
    
    # 找出分配给team-001但还没有太多MR的SSTS
    team_001_ssts = [s for s in all_ssts if s.get('assignedTeam') == 'team-001']
    
    # 将其中30个SSTS重新分配给team-003
    reassign_count = 30
    for ssts in team_001_ssts[:reassign_count]:
        ssts['assignedTeam'] = 'team-003'
        
        # 更新该SSTS下的所有MR
        ssts_mrs = [mr for mr in all_mrs if mr.get('sstsId') == ssts['id']]
        for mr in ssts_mrs:
            mr['teamId'] = 'team-003'
            mr['teamName'] = 'LKA团队'
    
    # 保存
    mrs_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    ssts_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    save_json(MRS_FILE, mrs_data)
    save_json(SSTS_FILE, ssts_data)
    
    # 统计
    team_counts = {}
    for mr in all_mrs:
        team_id = mr.get('teamId', 'unknown')
        team_counts[team_id] = team_counts.get(team_id, 0) + 1
    
    print("\n最终MR分布:")
    print(f"  team-001 (ACC): {team_counts.get('team-001', 0)} MR")
    print(f"  team-002 (APA): {team_counts.get('team-002', 0)} MR")
    print(f"  team-003 (LKA): {team_counts.get('team-003', 0)} MR")
    
    print("\n✅ LKA团队数据添加完成！")

if __name__ == "__main__":
    main()
