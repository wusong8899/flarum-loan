export const validators = {
  isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  },

  isImageUrl(url: string): boolean {
    if (!this.isValidUrl(url)) return false;
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
    const pathname = new URL(url).pathname.toLowerCase();
    const ext = pathname.split('.').pop() || '';
    return imageExtensions.includes(ext);
  },

  checkImageAccessible(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  },
};
