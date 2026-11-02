"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { applicationStatusSchema } from "@/content/schemas/application-fields";
import { db } from "@/db/client";
import { applicationStatusHistory, applications } from "@/db/schema";
import { requireAdminRole } from "@/lib/admin/auth";

export async function changeApplicationStatusAction(formData: FormData) {
  const user = await requireAdminRole(["admin", "admissions"]);
  const applicationId = formData.get("applicationId");
  const status = applicationStatusSchema.safeParse(formData.get("status"));
  if (
    typeof applicationId !== "string" ||
    !/^[0-9a-f-]{36}$/.test(applicationId) ||
    !status.success
  ) {
    throw new Error("The application status update is invalid.");
  }

  const now = Date.now();
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ status: applications.status })
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!existing) throw new Error("This application could not be found.");
    if (existing.status === status.data) return;

    await tx
      .update(applications)
      .set({ status: status.data, updatedAt: now })
      .where(eq(applications.id, applicationId));
    await tx.insert(applicationStatusHistory).values({
      id: randomUUID(),
      applicationId,
      status: status.data,
      actorId: user.id,
      createdAt: now,
    });
  });

  revalidatePath("/admin/applications");
  redirect("/admin/applications?notice=status-updated");
}
