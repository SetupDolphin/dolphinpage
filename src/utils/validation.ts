export const validatePointsData = (data: any) => {
  const { walletAddress, points, activity } = data;

  // Validasi wallet address
  if (!walletAddress || !/^[A-HJ-NP-Za-km-z1-9]*$/.test(walletAddress)) {
    return { isValid: false, error: 'Invalid wallet address' };
  }

  // Validasi points
  if (!Number.isInteger(points) || points <= 0 || points > 1000) {
    return { isValid: false, error: 'Invalid points value' };
  }

  // Validasi activity
  if (!activity || activity.length > 200) {
    return { isValid: false, error: 'Invalid activity description' };
  }

  return { isValid: true };
}; 