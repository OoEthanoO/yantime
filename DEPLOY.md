# YanTime on finprint-host

Production URL: https://time.ethanyanxu.com

YanTime runs on the Windows home server reached by `ssh finprint-host`. It uses
the server's existing Caddy HTTPS proxy and a standalone Next.js server bound to
loopback. No database, application secrets, or Vercel runtime services are needed.
The deployment scripts are adapted from Freedom's (`OoEthanoO/freedom`).

## Runtime layout

- `C:\ProgramData\YanTime\repo`: deployment checkout of this repository.
- `releases\<commit>-<timestamp>\app`: independent standalone builds.
- `ops`: installed deployment scripts.
- `active.json`, `previous.json`, `prepared.json`: release state and rollback targets.
- `server.json`: absolute executable paths and the shared Caddy configuration path.
- `Caddyfile`: YanTime's site snippet, imported by the existing Finprint Caddyfile.
- `static`: retained immutable Next.js assets for browsers spanning a release switch.
- `logs`: build, application, proxy, and deployment poller logs.

The runtime directory is restricted to SYSTEM and Administrators. App tasks named
`yantime-web-<commit>-<timestamp>` start at boot and recover from process failures.
The active release uses either `127.0.0.1:3450` or `127.0.0.1:3451`; updates build
and pass readiness checks on the other port before Caddy switches traffic.

## Deploying a commit that is not on GitHub

`deploy.ps1` normally fetches `master` from GitHub. With `-Bundle <file>` it fetches
from a git bundle instead (`git bundle create yantime.bundle master`), which is how
the first release was installed before this commit was pushed.

## First install

Run these commands in an elevated PowerShell session **on finprint-host**, from a
checkout of this repository:

```powershell
.\deploy\windows\install.ps1 `
  -CaddyExe 'C:\Users\ethan\AppData\Local\Microsoft\WinGet\Links\caddy.exe' `
  -MainCaddyfile 'C:\Users\ethan\finprint\scripts\selfhost\Caddyfile'

& 'C:\ProgramData\YanTime\ops\deploy.ps1' -PrepareOnly
```

Check the port in `prepared.json`, and verify `/api/health` and `/` on that port.
Then:

```powershell
& 'C:\ProgramData\YanTime\ops\activate.ps1'
& 'C:\ProgramData\YanTime\ops\dns.ps1'
```

The DNS script adds only the explicit, DNS-only Cloudflare record
`time.ethanyanxu.com CNAME finprint.ethanyanxu.com` with a 60-second TTL. The name
previously fell under `*.ethanyanxu.com CNAME cname.vercel-dns-017.com`; the wildcard
is left intact. The existing `ethanyanxu-cloudflare-ddns` task maintains the
Finprint address, so YanTime follows home IP changes automatically.

The script uses the existing DPAPI-protected Cloudflare credential referenced by
`C:\ProgramData\YanLearn\secrets\cloudflare-ddns.json`. It never copies credentials
into this repository. DNS migration evidence and the created record ID are saved
in `C:\ProgramData\YanTime\dns-migration.json`.

Caddy obtains and renews the certificate using the existing router forwarding
for ports 80/443. Once the public URL returns a valid HTTPS response with
`X-YanTime-Host: finprint-host`, enable automatic deployment:

```powershell
& 'C:\ProgramData\YanTime\ops\install.ps1' `
  -CaddyExe 'C:\Users\ethan\AppData\Local\Microsoft\WinGet\Links\caddy.exe' `
  -MainCaddyfile 'C:\Users\ethan\finprint\scripts\selfhost\Caddyfile' `
  -EnableAutoDeploy
```

## Updates and verification

Push to GitHub `master`. The `yantime-deploy` scheduled task checks every two
minutes, installs the lockfile dependencies, builds a separate release, verifies
its health, and reloads Caddy. Failed builds do not replace the active release.
To deploy now:

```powershell
Start-ScheduledTask -TaskName yantime-deploy
Get-Content 'C:\ProgramData\YanTime\logs\poller.log' -Tail 40
Invoke-RestMethod https://time.ethanyanxu.com/api/health
```

The health response identifies `service: yantime`, `status: ok`, and the deployed
Git commit. `vercel.json` disables Vercel's automatic Git deployments. The Vercel
project is left in place; nothing on Vercel is deleted by this migration.

## Rollback

To return to the previous healthy home-server release:

```powershell
Disable-ScheduledTask -TaskName yantime-deploy
& 'C:\ProgramData\YanTime\ops\activate.ps1' -Rollback
```

Keep the poller disabled until the unwanted commit is reverted on `master`, or it
will deploy that commit again. Re-enable it with `Enable-ScheduledTask` afterward.

For DNS rollback only, `dns.ps1 -Rollback` removes the exact YanTime record created
by this migration after checking its identity and target. That returns the name to
the Vercel wildcard; check that Vercel is serving the project before using it.

Do not regenerate the shared Finprint Caddyfile without preserving all imported
sites. YanTime's import is marked `# BEGIN YanTime (managed)`. Its activation
script backs up the shared file, validates the full configuration, and reloads
Caddy without restarting other hosted apps.
