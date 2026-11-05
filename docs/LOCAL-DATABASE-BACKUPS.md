# Local SQLite backups

The `pnpm backup:sqlite` command is for the legacy local SQLite database. It
creates a consistent snapshot with `VACUUM INTO`, verifies it with
`PRAGMA integrity_check`, and removes its own backup files after 30 days. It
reads `SQLITE_DATABASE_URI` (or defaults to the previous local `file:./data/site.db`)
and does not back up the active PostgreSQL/Neon database. Backup files are
written to `backups/` next to the database and are excluded from Git.

## Schedule a daily backup on Windows

1. Open Windows Task Scheduler and choose **Create Basic Task**.
2. Name it **Ombaci website database backup** and choose **Daily**.
3. Set the action to **Start a program**.
4. Set **Program/script** to the full path of `pnpm.cmd`.
5. Set **Add arguments** to `backup:sqlite`.
6. Set **Start in** to the website repository directory.
7. Finish the task and run it once from Task Scheduler to confirm it succeeds.

Use the same account and `.env.local` configuration as the website so the
script backs up the intended legacy SQLite database.

## Restore test

1. Stop the local website.
2. Copy one `data/backups/site-*.sqlite` file to a separate test filename; do
   not overwrite the live database.
3. Use a separate SQLite-compatible restore utility to inspect the test copy;
   the active website database now uses PostgreSQL.
4. Confirm the restored database passes `PRAGMA integrity_check`.
5. Remove only the test copy.

The website's active Neon database requires its own backup and restore plan.
This legacy SQLite utility does not back up or restore Neon data.
