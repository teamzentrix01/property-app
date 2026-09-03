import { prisma } from "@/lib/prisma";

// During development, the Prisma client can be older than schema.prisma after
// a schema change. The SQL fallback keeps category pages usable until `prisma
// generate` is run again.
export async function findCategoryPosts({ category, admin = false } = {}) {
  if (prisma.categoryPost) {
    return prisma.categoryPost.findMany({
      where: { ...(category ? { category } : {}), ...(admin ? {} : { isActive: true }) },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });
  }
  const where = category
    ? `WHERE "category" = $1${admin ? "" : ' AND "isActive" = true'}`
    : admin ? "" : 'WHERE "isActive" = true';
  return category
    ? prisma.$queryRawUnsafe(`SELECT * FROM "CategoryPost" ${where} ORDER BY "featured" DESC, "sortOrder" ASC, "createdAt" DESC`, category)
    : prisma.$queryRawUnsafe(`SELECT * FROM "CategoryPost" ${where} ORDER BY "featured" DESC, "sortOrder" ASC, "createdAt" DESC`);
}

export async function createCategoryPost(data) {
  if (prisma.categoryPost) return prisma.categoryPost.create({ data });
  const rows = await prisma.$queryRawUnsafe(`INSERT INTO "CategoryPost" ("id","category","title","slug","excerpt","description","imageUrl","location","priceLabel","featured","isActive","sortOrder","createdAt","updatedAt") VALUES (md5(random()::text || clock_timestamp()::text),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,NOW(),NOW()) RETURNING *`, data.category, data.title, data.slug, data.excerpt, data.description, data.imageUrl, data.location, data.priceLabel, data.featured, data.isActive);
  return rows[0];
}

export async function updateCategoryPost(id, data) {
  if (prisma.categoryPost) return prisma.categoryPost.update({ where: { id }, data });
  const keys = ["category", "title", "slug", "excerpt", "description", "imageUrl", "location", "priceLabel", "featured", "isActive", "sortOrder"];
  const values = keys.filter((key) => key in data).map((key) => data[key]);
  if (!values.length) return (await prisma.$queryRawUnsafe(`SELECT * FROM "CategoryPost" WHERE "id" = $1`, id))[0];
  const sets = keys.filter((key) => key in data).map((key, index) => `"${key}" = $${index + 1}`).join(", ");
  const rows = await prisma.$queryRawUnsafe(`UPDATE "CategoryPost" SET ${sets}, "updatedAt" = NOW() WHERE "id" = $${values.length + 1} RETURNING *`, ...values, id);
  return rows[0];
}

export async function deleteCategoryPost(id) {
  if (prisma.categoryPost) return prisma.categoryPost.delete({ where: { id } });
  await prisma.$queryRawUnsafe(`DELETE FROM "CategoryPost" WHERE "id" = $1`, id);
}
