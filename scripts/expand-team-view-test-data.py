#!/usr/bin/env python3
"""
扩充团队视角测试数据
- 确保MR数据充足且关联正确
- 为每个团队分配足够的MR
- 考虑团队容量和工作负荷
"""

import json
from datetime import datetime
from pathlib import Path

# 数据文件路径
BASE_DIR = Path(__file__).parent.parent / "frontend" / "src" / "mock-data" / "datasets"
MRS_FILE = BASE_DIR / "mrs.json"
FEATURES_FILE = BASE_DIR / "features.json"
SSTS_FILE = BASE_DIR / "ssts.json"
TEAMS_FILE = BASE_DIR / "teams.json"

def load_json(file_path):
    """加载JSON文件"""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(file_path, data):
    """保存JSON文件"""
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    print("开始扩充团队视角测试数据...")
    
    # 加载现有数据
    mrs_data = load_json(MRS_FILE)
    features_data = load_json(FEATURES_FILE)
    ssts_data = load_json(SSTS_FILE)
    teams_data = load_json(TEAMS_FILE)
    
    existing_mrs = mrs_data['data']
    existing_features = features_data['data']
    existing_ssts = ssts_data['data']
    teams = teams_data['data']
    
    print(f"现有MR数量: {len(existing_mrs)}")
    print(f"现有Feature数量: {len(existing_features)}")
    print(f"现有SSTS数量: {len(existing_ssts)}")
    print(f"现有团队数量: {len(teams)}")
    
    # 统计每个团队现有的MR数量
    team_mr_count = {}
    for mr in existing_mrs:
        team_id = mr.get('teamId')
        if team_id:
            team_mr_count[team_id] = team_mr_count.get(team_id, 0) + 1
    
    print("\n各团队现有MR数量:")
    for team in teams:
        count = team_mr_count.get(team['id'], 0)
        print(f"  {team['name']}: {count} 个MR")
    
    # 为每个已有的SSTS添加更多MR
    new_mrs = []
    mr_id_counter = len(existing_mrs) + 1
    
    # 为现有SSTS扩充MR
    for ssts in existing_ssts:
        # 每个SSTS至少3-5个MR
        current_mrs = [mr for mr in existing_mrs if mr['sstsId'] == ssts['id']]
        needed_mrs = max(0, 3 - len(current_mrs))
        
        if needed_mrs > 0:
            # 确定团队（基于SSTS的第一个现有MR或默认team-001）
            team_id = current_mrs[0]['teamId'] if current_mrs else 'team-001'
            team_name = next((t['name'] for t in teams if t['id'] == team_id), 'ACC团队')
            
            for i in range(needed_mrs):
                mr_id = f"mr-{str(mr_id_counter).zfill(3)}"
                mr_code = f"MR-{ssts['code']}-{str(i+len(current_mrs)+1).zfill(3)}"
                
                ssts_name = ssts.get('name') or ssts.get('title', 'SSTS')
                module_name = ssts.get('moduleName', ssts_name)
                
                new_mr = {
                    "id": mr_id,
                    "code": mr_code,
                    "title": f"{ssts_name}_模块{i+len(current_mrs)+1}",
                    "name": f"{ssts_name}_模块{i+len(current_mrs)+1}",
                    "sstsId": ssts['id'],
                    "moduleName": f"{module_name}子模块{i+1}",
                    "teamId": team_id,
                    "teamName": team_name,
                    "dependencies": [],
                    "effortHours": 30 + (i * 10),
                    "storyPoints": 4 + i,
                    "status": "ready",
                    "priority": ["P0", "P1", "P2"][i % 3],
                    "owner": "user-001",
                    "assignee": "user-001",
                    "taskIds": [],
                    "targetPI": "pi-001",
                    "tags": [ssts['code'].split('-')[0], "扩充数据"],
                    "createdAt": "2026-01-19T12:00:00Z",
                    "updatedAt": "2026-01-19T12:00:00Z",
                    "createdBy": "user-001",
                    "updatedBy": "user-001"
                }
                
                new_mrs.append(new_mr)
                mr_id_counter += 1
    
    # 合并MR数据
    all_mrs = existing_mrs + new_mrs
    
    # 更新MR数据文件
    mrs_data['data'] = all_mrs
    mrs_data['updatedAt'] = datetime.now().isoformat() + 'Z'
    save_json(MRS_FILE, mrs_data)
    
    print(f"\n✅ 添加了 {len(new_mrs)} 个新MR")
    print(f"总MR数量: {len(all_mrs)}")
    
    # 重新统计
    team_mr_count_new = {}
    for mr in all_mrs:
        team_id = mr.get('teamId')
        if team_id:
            team_mr_count_new[team_id] = team_mr_count_new.get(team_id, 0) + 1
    
    print("\n各团队新的MR数量:")
    for team in teams:
        count = team_mr_count_new.get(team['id'], 0)
        avg_hours = sum(mr['effortHours'] for mr in all_mrs if mr.get('teamId') == team['id']) / max(count, 1)
        print(f"  {team['name']}: {count} 个MR, 平均工时: {avg_hours:.1f}h")
    
    print("\n✅ 团队视角测试数据扩充完成！")

if __name__ == "__main__":
    main()
