export const formatToSentenceCase = (text: string): string => {
  if (!text) return "N/A";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
}; 