export function generateReferralCode(userId: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let seed = userId;
  for (let i = 0; i < 8; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    code += chars[seed % chars.length];
  }
  return code;
}
