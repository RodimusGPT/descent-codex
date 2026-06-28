const normalizedBasePath = () => {
  const base = import.meta.env.BASE_URL;
  return base === "/" ? "" : base.replace(/\/$/, "");
};

export const withBase = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBasePath()}${normalizedPath}`;
};

export const withoutBase = (pathname: string) => {
  const base = normalizedBasePath();

  if (base === "") {
    return pathname;
  }

  if (pathname === base) {
    return "/";
  }

  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
};

export const partHref = (slug: string) => withBase(`/parts/${slug}`);
export const devHref = (slug = "") => withBase(slug === "" ? "/dev/" : `/dev/${slug}`);
