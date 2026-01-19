#!/usr/bin/env python3
"""
平衡各团队的MR数量
确保每个团队都有足够且合理的MR用于测试
"""

import json
from datetime import datetime
from pathlib import Path

# 数据文件路径
BASE_DIR = Path(__file__).parent.parent / "frontend" / "src" / "mock-data" / "datasets"
MRS_FILE = BASE_DIR / "mrs.json"
SSTS_FILE = BASE_DIR / "ssts.json"
TEAMS_FILE = BASE_DIR / "teams.json"

def load_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("开始平衡团队MR数据...")
    
    # 加载数据
    mrs_data = load_json(MRS_FILE)
    ssts_data = load_json(SSTS_FILE)
    teams_data = load_json(TEAMS_FILE)
    
    all_mrs = mrs_data['data']
    all_ssts = ssts_data['data']
    teams = teams_data['data']
    
    # 统计当前分布
    team_mr_count = {}
    team_ssts_count = {}
    
    for mr in all_mrs:
        team_id = mr.get('teamId', 'unknown')
        team_mr_count[team_id] = team_mr_count.get(team_id, 0) + 1
    
    for ssts in all_ssts:
        team_id = ssts.get('assignedTeam', 'unknown')
        team_ssts_count[team_id] = team_ssts_count.get(team_id, 0) + 1
    
    print(f"\n当前MR分布:")
    for team in teams:
        mr_count = team_mr_count.get(team['id'], 0)
        ssts_count = team_ssts_count.get(team['id'], 0)
        print(f"  {team['name']}: {mr_count} MR (关联 {ssts_count} SSTS)")
    
    # 重新分配一些MR到APA和LKA团队
    # 策略：将ACC团队的部分MR重新分配给其他团队
    team_002_mrs = [mr for mr in all_mrs if mr.get('teamId') == 'team-002']
    team_003_mrs = [mr for mr in all_mrs if mr.get('teamId') == 'team-003']
    
    target_mr_per_team = 60  # 每个团队目标60个MR
    
    # 为team-002（APA团队）增加MR
    if len(team_002_mrs) < target_mr_per_team:
        needed = target_mr_per_team - len(team_002_mrs)
        # 找一些SSTS分配给team-002
        unassigned_ssts = [s for s in all_ssts if s.get('assignedTeam') in ['team-001', None]][:10]
        
        for ssts in unassigned_ssts:
            ssts['assignedTeam'] = 'team-002'
            
            # 为这个SSTS创建MR
            ssts_mrs = [mr for mr in all_mrs if mr.get('sstsId') == ssts['id']]
            for mr in ssts_mrs[:3]:  # 最多取3个MR
                mr['teamId'] = 'team-002'
                mr['teamName'] = 'APA团队'
    
    # 为team-003（LKA团队）增加MR
    if len(team_003_mrs) < target_mr_per_team:
        # 找一些SSTS分配给team-003
        unassigned_ssts = [s for s in all_ssts if s.get('assignedTeam') == 'team-001'][:10]
        
        for ssts in unassigned_ssts:
            ssts['assignedTeam'] = 'team-003'
            
            # 为这个SSTS的MR改team
            ssts_mrs = [mr for mr in all_mrs if mr.get('sstsId') == ssts['id']]
            for mr in ssts_mrs[:3]:  # 最多取3个MR
                mr['teamId'] = 'team-003'
                mr['teamName'] = 'LKA团队'
    
    # 保存更新后的数据
    mrs_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    ssts_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    
    save_json(MRS_FILE, mrs_data)
    save_json(SSTS_FILE, ssts_data)
    
    # 重新统计
    team_mr_count_new = {}
    for mr in all_mrs:
        team_id = mr.get('teamId', 'unknown')
        team_mr_count_new[team_id] = team_mr_count_new.get(team_id, 0) + 1
    
    print(f"\n新的MR分布:")
    for team in teams:
        mr_count = team_mr_count_new.get(team['id'], 0)
        total_hours = sum(mr.get('effortHours', 0) for mr in all_mrs if mr.get('teamId') == team['id'])
        avg_hours = total_hours / max(mr_count, 1)
        print(f"  {team['name']}: {mr_count} MR, 总工时: {total_hours}h, 平均: {avg_hours:.1f}h/MR")
    
    print("\n✅ 团队MR数据平衡完成！")

if __name__ == "__main__":
    main()
