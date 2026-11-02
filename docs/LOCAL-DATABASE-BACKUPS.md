# Local SQLite backups

The `pnpm backup:sqlite` command creates a consistent SQLite snapshot with
`VACUUM INTO`, verifies it with `PRAGMA integrity_check`, and removes its own
backup files after 30 days. It only accepts a `DATABASE_URL` using the `file:`
scheme. Backup files are written to `backups/` next to the database and are
excluded from Git.

## Schedule a daily backup on Windows

1. Open Windows Task Scheduler and choose **Create Basic Task**.
2. Name it **Ombaci website database backup** and choose **Daily**.
3. Set the action to **Start a program**.
4. Set **Program/script** to the full path of `pnpm.cmd`.
5. Set **Add arguments** to `backup:sqlite`.
6. Set **Start in** to the website repository directory.
7. Finish the task and run it once from Task Scheduler to confirm it succeeds.

Use the same account and `.env.local` configuration as the website so the
script backs up the intended local SQLite database.

## Restore test

1. Stop the local website.
2. Copy one `data/backups/site-*.sqlite` file to a separate test filename; do
   not overwrite the live database.
3. Temporarily point `DATABASE_URL` at that test copy and run `pnpm db:migrate`.
4. Start the website against the test copy and open the home page and one
   published content page. Confirm both load without database errors.
5. Stop the website, restore the normal `DATABASE_URL`, and remove only the
   test copy.

Production database hosting and backup providers have not been selected. This
local SQLite task does not configure production backups; production scheduling,
retention, and a restore test remain open until the owner chooses a provider.
