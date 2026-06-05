const ABSOLUTE_URL_PATTERN = /^(?:https?:|data:|blob:)/;

export function resolvePublicAssetPath(src: string): string {
  if (!src || ABSOLUTE_URL_PATTERN.test(src)) {
    return src;
  }

  const baseUrl = import.meta.env.BASE_URL || "/";

  if (src.startsWith("/")) {
    return `${baseUrl.replace(/\/$/, "")}${src}`;
  }

  return `${baseUrl}${src}`;
}
