export async function revalidateContent() {
  try {
    const { revalidatePath, revalidateTag } = await import("next/cache");
    revalidateTag("home", "max");
    revalidatePath("/", "layout");
  } catch {
    return;
  }
}
