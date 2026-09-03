export function slugify(text: string): string {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function generateUniqueSlug(name: string): string {
    const base = slugify(name);
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    return `${base}-${randomSuffix}`;
}