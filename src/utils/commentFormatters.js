export const getCommentDisplayName = (comment, fallbackName = "User") =>
  comment?.fullName || comment?.commentPostedBy || fallbackName;

export const formatCommentTime12Hour = (value) => {
  if (!value) return "";

  const timeText = String(value).trim();
  const match = timeText.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?\s*(AM|PM)?$/i);

  if (!match) return timeText;

  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = match[3]?.toUpperCase();
  if (suffix) return `${hour}:${minute} ${suffix}`;

  if (hour > 23) return timeText;
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
};
