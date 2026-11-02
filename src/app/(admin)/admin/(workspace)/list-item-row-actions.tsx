"use client";

import Link from "next/link";

import type { PageSchema } from "@/content/schemas";
import {
  deleteCollectionItemAction,
  moveCollectionItemAction,
  setCollectionItemStatusAction,
} from "./list-actions";

export function ListItemRowActions({
  schema,
  id,
  editHref,
  status,
  isFirst,
  isLast,
}: {
  schema: PageSchema;
  id: string;
  editHref: string;
  status: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link className="admin-button" href={editHref}>
        Edit
      </Link>
      <form action={moveCollectionItemAction}>
        <input name="collection" type="hidden" value={schema.key} />
        <input name="id" type="hidden" value={id} />
        <input name="direction" type="hidden" value="up" />
        <button
          aria-label="Move entry up"
          className="admin-button"
          disabled={isFirst}
          type="submit"
        >
          Up
        </button>
      </form>
      <form action={moveCollectionItemAction}>
        <input name="collection" type="hidden" value={schema.key} />
        <input name="id" type="hidden" value={id} />
        <input name="direction" type="hidden" value="down" />
        <button
          aria-label="Move entry down"
          className="admin-button"
          disabled={isLast}
          type="submit"
        >
          Down
        </button>
      </form>
      <form action={setCollectionItemStatusAction}>
        <input name="collection" type="hidden" value={schema.key} />
        <input name="id" type="hidden" value={id} />
        <input
          name="status"
          type="hidden"
          value={status === "published" ? "hidden" : "published"}
        />
        <button className="admin-button" type="submit">
          {status === "published" ? "Hide" : "Publish"}
        </button>
      </form>
      <form action={deleteCollectionItemAction}>
        <input name="collection" type="hidden" value={schema.key} />
        <input name="id" type="hidden" value={id} />
        <button
          className="admin-button"
          onClick={(event) => {
            if (
              !window.confirm(
                "Delete this entry? This cannot be undone. Hide it instead?",
              )
            ) {
              event.preventDefault();
            }
          }}
          type="submit"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
