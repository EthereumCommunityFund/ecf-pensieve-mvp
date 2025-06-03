我需要对createItemProposal 、createVote、cancelVote的方法里面，包括调用方法添加耗时log，特别注意数据写入耗时
如例子
🧠 [MEM] createProject - Start: 45.23MB
⚡ [PERF] 1. Process input data: 2.34ms { itemCount: 15 }
💾 [DB] INSERT projects: 12.45ms (1 records)
⚡ [PERF] 2. Insert project record: 12.67ms { projectId: 123 }
⚡ [PERF] 3. Create proposal caller: 0.89ms
💾 [DB] SELECT profiles: 8.23ms (1 records)
💾 [DB] UPDATE profiles: 5.67ms (1 records)
⚡ [PERF] updateUserWeight: 15.34ms { oldWeight: 100, newWeight: 125 }
⚡ [PERF] 4. Update user weight: 15.89ms { userId: "user123", reward: 25 }
💾 [DB] INSERT notifications: 3.45ms (1 records)
⚡ [PERF] addRewardNotification: 4.12ms { userId: "user123", projectId: 123, reward: 25 }
⚡ [PERF] 5. Create proposal: 45.67ms { proposalId: 456, itemCount: 15 }
⚡ [PERF] 6. Add reward notification: 4.23ms
🧠 [MEM] createProject - End: 47.89MB (+2.66MB)
⚡ [PERF] TOTAL createProject execution: 89.45ms { projectId: 123, proposalId: 456, itemCount: 15 }

