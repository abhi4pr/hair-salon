const POINTS_PER_RUPEE = parseFloat(process.env.LOYALTY_POINTS_PER_RUPEE) || 1;
const RUPEE_PER_POINT = parseFloat(process.env.LOYALTY_RUPEE_PER_POINT) || 0.5;

export const pointsFromAmount = (amount) => Math.floor(amount * POINTS_PER_RUPEE);

export const amountFromPoints = (points) => points * RUPEE_PER_POINT;
