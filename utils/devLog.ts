export const devLog = (label: string, ...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    const color = '#7bbea6';
    console.log(
      `%c[Penseive] ${label}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      ...args,
    );
  }
};

// 性能日志专用方法
export const perfLog = (label: string, duration: number, details?: any) => {
  if (process.env.NODE_ENV !== 'production') {
    const color =
      duration > 1000 ? '#ff6b6b' : duration > 500 ? '#ffa726' : '#4caf50';
    const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '⚡';
    console.log(
      `%c${emoji} [PERF] ${label}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      `${duration.toFixed(2)}ms`,
      details ? details : '',
    );
  }
};

// 数据库操作专用日志
export const dbLog = (
  operation: string,
  table: string,
  duration: number,
  recordCount?: number,
) => {
  if (process.env.NODE_ENV !== 'production') {
    const color = '#2196f3';
    const details = recordCount ? `(${recordCount} records)` : '';
    console.log(
      `%c💾 [DB] ${operation} ${table}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      `${duration.toFixed(2)}ms ${details}`,
    );
  }
};

// 内存使用日志
export const memLog = (label: string, beforeMem?: number) => {
  if (process.env.NODE_ENV !== 'production') {
    const currentMem = process.memoryUsage().heapUsed / 1024 / 1024;
    const memDiff = beforeMem ? currentMem - beforeMem : 0;
    const color = '#9c27b0';
    console.log(
      `%c🧠 [MEM] ${label}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      `${currentMem.toFixed(2)}MB${beforeMem ? ` (${memDiff > 0 ? '+' : ''}${memDiff.toFixed(2)}MB)` : ''}`,
    );
    return currentMem;
  }
  return 0;
};

// 事务日志专用方法
export const transactionLog = {
  start: (method: string, details?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      const color = '#00bcd4';
      console.log(
        `%c🔄 [TRANSACTION] ${method} - START`,
        `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
        details ? details : '',
      );
    }
  },

  success: (method: string, duration: number, details?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      const color = '#4caf50';
      console.log(
        `%c✅ [TRANSACTION] ${method} - SUCCESS`,
        `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
        `${duration.toFixed(2)}ms`,
        details ? details : '',
      );
    }
  },

  rollback: (
    method: string,
    duration: number,
    error: string,
    details?: any,
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      const color = '#f44336';
      console.log(
        `%c🔄 [TRANSACTION] ${method} - ROLLBACK`,
        `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
        `${duration.toFixed(2)}ms`,
        `Error: ${error}`,
        details ? details : '',
      );
    }
  },
};
