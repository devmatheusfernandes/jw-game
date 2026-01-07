import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: number;
  createdBy?: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function getCategories(): Promise<Category[]> {
  const cats: Category[] = [];
  try {
    const snap = await getDocs(collection(db, "categories"));
    snap.forEach((doc) => {
      cats.push({ id: doc.id, ...doc.data() } as Category);
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
  return cats;
}

export async function ensureCategories(names: string[], createdBy?: string): Promise<Category[]> {
  const created: Category[] = [];
  const normalized = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));
  try {
    const all = await getCategories();
    const existingBySlug = new Map(all.map((c) => [c.slug, c]));
    for (const name of normalized) {
      const slug = slugify(name);
      const existing = existingBySlug.get(slug);
      if (existing) {
        created.push(existing);
      } else {
        const docRef = await addDoc(collection(db, "categories"), {
          name,
          slug,
          createdAt: Date.now(),
          createdBy: createdBy || "system",
        });
        created.push({
          id: docRef.id,
          name,
          slug,
          createdAt: Date.now(),
          createdBy: createdBy || "system",
        });
      }
    }
  } catch (error) {
    console.error("Error ensuring categories:", error);
  }
  return created;
}
