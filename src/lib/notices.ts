import type { Where } from "payload";

export function publicNoticeConstraint(now = new Date()): Where {
  const iso = now.toISOString();

  return {
    and: [
      { _status: { equals: "published" } },
      {
        or: [
          { expiresAt: { exists: false } },
          { expiresAt: { greater_than: iso } },
        ],
      },
      {
        or: [
          { startsAt: { exists: false } },
          { startsAt: { less_than_equal: iso } },
        ],
      },
    ],
  };
}
