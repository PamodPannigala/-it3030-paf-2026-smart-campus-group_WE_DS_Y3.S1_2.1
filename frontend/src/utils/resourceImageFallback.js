const CATALOGUE_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2340",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2301",
];

export const getCatalogueFallbackImage = (resourceId) => {
  const numericId = Number(resourceId);
  const safeIndex = Number.isFinite(numericId)
    ? Math.abs(numericId) % CATALOGUE_FALLBACK_IMAGES.length
    : 0;
  return CATALOGUE_FALLBACK_IMAGES[safeIndex];
};

export const getResourceImageOrCatalogueFallback = (resourceImage, resourceId) => {
  if (resourceImage && resourceImage.trim() !== "") {
    return resourceImage;
  }
  return getCatalogueFallbackImage(resourceId);
};
