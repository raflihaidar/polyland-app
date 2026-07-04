export const getFileUrl = (url: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/uploads/${url}`;
