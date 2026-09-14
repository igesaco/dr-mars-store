$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env.local'
$psqlPath = 'C:\Program Files\PostgreSQL\17\bin\psql.exe'

if (-not (Test-Path -LiteralPath $envPath)) { throw '.env.local bulunamadi.' }
if (-not (Test-Path -LiteralPath $psqlPath)) { throw 'PostgreSQL 17 psql.exe bulunamadi.' }

$lines = [System.IO.File]::ReadAllLines($envPath)
$indices = @()
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^DATABASE_URL=') { $indices += $i }
}
if ($indices.Count -ne 1) { throw '.env.local icinde yalnizca bir DATABASE_URL satiri olmali.' }

$securePassword = Read-Host 'psql ile calisan PostgreSQL parolasini gir (gizli)' -AsSecureString
$plainPassword = [System.Net.NetworkCredential]::new('', $securePassword).Password

try {
    $env:PGPASSWORD = $plainPassword
    & $psqlPath -X -h 127.0.0.1 -p 5432 -U postgres -d dr_mars -w -At -c 'select current_database()' | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'psql bu parolayi kabul etmedi. Dosya degistirilmedi.'
        return
    }
    Write-Host 'psql baglantisi basarili.'

    $encodedPassword = [System.Uri]::EscapeDataString($plainPassword)
    $env:DATABASE_URL = "postgresql://postgres:${encodedPassword}@127.0.0.1:5432/dr_mars"
    & node (Join-Path $PSScriptRoot 'check-db.mjs')
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Uygulama baglantisi basarisiz. Dosya degistirilmedi.'
        return
    }

    $lines[$indices[0]] = "DATABASE_URL=$env:DATABASE_URL"
    [System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
    Write-Host 'BAGLANTI HAZIR: .env.local guncellendi. Simdi corepack pnpm db:migrate calistir.'
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
    $plainPassword = $null
    $encodedPassword = $null
}
