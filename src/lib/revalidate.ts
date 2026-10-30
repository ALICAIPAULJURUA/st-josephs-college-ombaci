export async function revalidateContent() {
  try {
    const { revalidatePath, revalidateTag } = await import("next/cache");
    revalidateTag("home", "max");
    revalidateTag("site-shell", "max");
    revalidateTag("pages", "max");
    revalidatePath("/", "layout");
  } catch {
    return;
  }
}
