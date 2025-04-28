export const devLog = (label: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    const color = '#7bbea6';
    console.log(
      `%c[Penseive] ${label}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      ...args,
    );
  }
};
