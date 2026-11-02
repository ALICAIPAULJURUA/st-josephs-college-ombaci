export function isSafeContentPath(path: string) {
  return (
    path.length <= 200 &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.endsWith("/") &&
    path
      .slice(1)
      .split("/")
      .every((segment) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment))
  );
}

export function contentItemPath(
  collection: string,
  slug: string,
  fields?: Record<string, unknown>,
) {
  if (collection === "extra-pages" && typeof fields?.route === "string") {
    return isSafeContentPath(fields.route) ? fields.route : null;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  if (
    collection === "news" ||
    collection === "sports" ||
    collection === "achievements"
  ) {
    return `/${collection}/${slug}`;
  }
  if (collection === "old-boys") return `/old-boys/profiles/${slug}`;
  return null;
}
