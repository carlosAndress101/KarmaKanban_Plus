/**
 * Calculate points based on task difficulty
 */
export const getTaskPoints = (difficulty: string | null | undefined): number => {
  switch (difficulty) {
    case "Facil":
      return 10;
    case "Medio":
      return 20;
    case "Dificil":
      return 30;
    default:
      return 0;
  }
};

/**
 * Get points color for display
 */
export const getPointsColor = (points: number): string => {
  switch (points) {
    case 10:
      return "text-green-600 bg-green-50 border-green-200";
    case 20:
      return "text-orange-600 bg-orange-50 border-orange-200";
    case 30:
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};
