interface Asset {
  filename: string;
}

export const imageUrl = (url: string | Asset) => {
  if (url === null || url === undefined) return '';
  if (typeof url === 'object') {
    return url.filename;
  }
  return url.replace('//', 'https://');
};
