export const formatDateIndonesia = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
