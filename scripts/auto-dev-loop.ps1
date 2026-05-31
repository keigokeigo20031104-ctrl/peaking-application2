param(
  [Parameter(Mandatory = $true)]
  [string]$Task,

  [int]$MaxRounds = 3,

  [string[]]$GuardedFiles = @("_worker.js", "wrangler.toml", "package-lock.json")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new($false)

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

$PlanLog = Join-Path $Root ".auto-plan.md"
$ReviewLog = Join-Path $Root ".auto-review.md"
$ImplementLog = Join-Path $Root ".auto-implement.md"
$BuildLog = Join-Path $Root ".auto-build.log"
$FinalReport = Join-Path $Root ".auto-final-report.md"
$DiffLog = Join-Path $Root ".auto-diff-stat.md"
$SafetyLog = Join-Path $Root ".auto-safety.md"

$DeveloperCommand = Join-Path $Root ".claude\commands\developer.md"
$ReviewerCommand = Join-Path $Root ".claude\commands\reviewer.md"
$ReleaseCommand = Join-Path $Root ".claude\commands\release-manager.md"
$NpmCommand = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $NpmCommand) {
  $NpmCommand = (Get-Command npm -ErrorAction Stop).Source
}

function Assert-FileExists {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Required file not found: $Path"
  }
}

function Get-RolePrompt {
  param([string]$Path)
  Assert-FileExists $Path
  return Get-Content -LiteralPath $Path -Raw -Encoding UTF8
}

function Assert-ClaudePrintMode {
  $null = Get-Command claude -ErrorAction Stop
  $help = (& claude --help 2>&1) -join "`n"
  if ($help -notmatch "--print" -and $help -notmatch "\s-p,") {
    throw "Claude CLI non-interactive print mode was not detected. Run 'claude --help' and update scripts/auto-dev-loop.ps1 for the available non-interactive option."
  }
}

function Invoke-GitText {
  param([string[]]$Arguments)
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $output = & git @Arguments 2>&1
    if ($null -eq $output) {
      return ""
    }
    return ($output | ForEach-Object { [string]$_ }) -join "`n"
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

function Get-GuardedFileSnapshot {
  $snapshot = @{}
  foreach ($file in $GuardedFiles) {
    $path = Join-Path $Root $file
    if (Test-Path -LiteralPath $path) {
      $snapshot[$file] = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
    }
    else {
      $snapshot[$file] = "<missing>"
    }
  }
  return $snapshot
}

function Assert-GuardedFilesUnchanged {
  param(
    [hashtable]$Before,
    [string]$Stage
  )

  $changes = @()
  foreach ($file in $GuardedFiles) {
    $path = Join-Path $Root $file
    $after = if (Test-Path -LiteralPath $path) {
      (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
    }
    else {
      "<missing>"
    }

    if ($Before[$file] -ne $after) {
      $changes += $file
    }
  }

  if ($changes.Count -gt 0) {
    $message = "Guarded file changed during ${Stage}: $($changes -join ', ')"
    Add-Content -LiteralPath $SafetyLog -Encoding UTF8 -Value $message
    throw $message
  }
}

function Write-DiffSnapshot {
  param([string]$Stage)

  Add-Content -LiteralPath $DiffLog -Encoding UTF8 -Value @"

================================================================================
$Stage
Captured: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
================================================================================

## git status --short

$(Invoke-GitText @("status", "--short"))

## git diff --stat

$(Invoke-GitText @("diff", "--stat"))

## git diff --name-only

$(Invoke-GitText @("diff", "--name-only"))
"@
}

function Invoke-ClaudeRole {
  param(
    [string]$RoleName,
    [string]$RolePrompt,
    [string]$Instruction,
    [string]$OutFile,
    [ValidateSet("plan", "acceptEdits")]
    [string]$PermissionMode = "plan"
  )

  $prompt = @"
# Role: $RoleName

$RolePrompt

# Repository

Current project: peaking-application2
Working directory: $Root

# Hard constraints

- Do not rebuild the whole app.
- Do not change the URL structure.
- Do not make unnecessary changes to _worker.js.
- Do not migrate to another framework such as React/Vue/Next.js.
- Do not add external libraries.
- Do not remove existing features.
- Do not do unnecessary large refactors.
- Do not change the _worker.js API contract.
- Do not change the KV binding name WEIGHT_LOGS.
- Keep saved record date values in YYYY-MM-DD format.
- Keep existing weight, calorie, meal, and training record features working.
- Keep date changing usable on mobile.
- Avoid console errors.
- Do not commit or push.
- Keep changes minimal and focused on the requested task.

# Task

$Task

# Current instruction

$Instruction
"@

  $promptFile = New-TemporaryFile
  try {
    Set-Content -LiteralPath $promptFile -Value $prompt -Encoding UTF8
    $output = Get-Content -LiteralPath $promptFile -Raw -Encoding UTF8 |
      & claude -p --permission-mode $PermissionMode --output-format text 2>&1
    $exitCode = $LASTEXITCODE

    $header = "# $RoleName`n`nGenerated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n`n"
    Set-Content -LiteralPath $OutFile -Value ($header + ($output -join "`n")) -Encoding UTF8

    if ($exitCode -ne 0) {
      throw "Claude role '$RoleName' failed with exit code $exitCode. See $OutFile"
    }
  }
  finally {
    Remove-Item -LiteralPath $promptFile -Force -ErrorAction SilentlyContinue
  }
}

function Invoke-Build {
  param([int]$Round)

  function Add-BuildLog {
    param([string]$Text)
    Add-Content -LiteralPath $BuildLog -Encoding UTF8 -Value $Text
  }

  Add-BuildLog @"

================================================================================
Build round $Round
Started: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Command: npm run build
================================================================================
"@

  $buildOutput = & $NpmCommand run build 2>&1
  [int]$exitCode = $LASTEXITCODE

  foreach ($line in $buildOutput) {
    $text = [string]$line
    Add-BuildLog $text
    Write-Host $text
  }

  Add-BuildLog @"

Finished: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Exit code: $exitCode
"@

  Write-Output $exitCode
}

if ($MaxRounds -lt 1) {
  throw "-MaxRounds must be 1 or greater."
}

Assert-FileExists $DeveloperCommand
Assert-FileExists $ReviewerCommand
Assert-FileExists $ReleaseCommand
Assert-ClaudePrintMode

Set-Content -LiteralPath $BuildLog -Encoding UTF8 -Value "Auto dev loop build log`nStarted: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n"
Set-Content -LiteralPath $DiffLog -Encoding UTF8 -Value "Auto dev loop diff log`nStarted: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n"
Set-Content -LiteralPath $SafetyLog -Encoding UTF8 -Value "Auto dev loop safety log`nStarted: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")`n"
Write-DiffSnapshot "Before auto dev loop"
$guardedSnapshot = Get-GuardedFileSnapshot

$developerPrompt = Get-RolePrompt $DeveloperCommand
$reviewerPrompt = Get-RolePrompt $ReviewerCommand
$releasePrompt = Get-RolePrompt $ReleaseCommand

Invoke-ClaudeRole `
  -RoleName "developer-plan" `
  -RolePrompt $developerPrompt `
  -Instruction "Create an implementation plan only. Do not edit files. Save a concise plan that respects all constraints." `
  -OutFile $PlanLog `
  -PermissionMode "plan"

$planText = Get-Content -LiteralPath $PlanLog -Raw -Encoding UTF8
Invoke-ClaudeRole `
  -RoleName "reviewer" `
  -RolePrompt $reviewerPrompt `
  -Instruction "Review this developer plan. Point out risks, missing checks, and required adjustments. Do not edit files.`n`nDeveloper plan:`n$planText" `
  -OutFile $ReviewLog `
  -PermissionMode "plan"

$reviewText = Get-Content -LiteralPath $ReviewLog -Raw -Encoding UTF8
Invoke-ClaudeRole `
  -RoleName "developer-implement" `
  -RolePrompt $developerPrompt `
  -Instruction "Implement the task using the developer plan and reviewer notes below. Keep the change minimal. Do not run npm run build; this script will run it. Do not commit or push.`n`nDeveloper plan:`n$planText`n`nReviewer notes:`n$reviewText" `
  -OutFile $ImplementLog `
  -PermissionMode "acceptEdits"
Assert-GuardedFilesUnchanged -Before $guardedSnapshot -Stage "developer implementation"
Write-DiffSnapshot "After developer implementation"

$buildSucceeded = $false
$lastExitCode = 1

for ($round = 1; $round -le $MaxRounds; $round++) {
  [int]$lastExitCode = Invoke-Build -Round $round
  if ($lastExitCode -eq 0) {
    $buildSucceeded = $true
    break
  }

  if ($round -lt $MaxRounds) {
    $fixLog = Join-Path $Root ".auto-fix-round-$round.md"
    $buildText = Get-Content -LiteralPath $BuildLog -Raw -Encoding UTF8
    Invoke-ClaudeRole `
      -RoleName "developer-fix-round-$round" `
      -RolePrompt $developerPrompt `
      -Instruction "The build failed. Fix only the cause of the build failure, preserving all constraints. Do not run npm run build; this script will rerun it. Do not commit or push.`n`nBuild log:`n$buildText" `
      -OutFile $fixLog `
      -PermissionMode "acceptEdits"
    Assert-GuardedFilesUnchanged -Before $guardedSnapshot -Stage "fix round $round"
    Write-DiffSnapshot "After fix round $round"
  }
}

Write-DiffSnapshot "Final auto dev loop state"
$statusText = if ($buildSucceeded) { "SUCCESS" } else { "FAILED after $MaxRounds round(s), last exit code $lastExitCode" }
$finalBuildText = Get-Content -LiteralPath $BuildLog -Raw -Encoding UTF8
$implementText = Get-Content -LiteralPath $ImplementLog -Raw -Encoding UTF8

Invoke-ClaudeRole `
  -RoleName "release-manager" `
  -RolePrompt $releasePrompt `
  -Instruction "Create a final report only. Do not edit files, commit, or push. Summarize changed content, build result, checks, and remaining issues.`n`nBuild status: $statusText`n`nImplementation log:`n$implementText`n`nBuild log:`n$finalBuildText" `
  -OutFile $FinalReport `
  -PermissionMode "plan"

Write-Host "Auto dev loop finished: $statusText"
Write-Host "Plan: $PlanLog"
Write-Host "Review: $ReviewLog"
Write-Host "Implementation: $ImplementLog"
Write-Host "Build log: $BuildLog"
Write-Host "Diff log: $DiffLog"
Write-Host "Safety log: $SafetyLog"
Write-Host "Final report: $FinalReport"

if (-not $buildSucceeded) {
  exit 1
}
