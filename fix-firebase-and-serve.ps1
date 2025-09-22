# fix-firebase.ps1
Write-Host "🚀 Mulai perbaikan Firebase & AngularFire..."

# --- Bagian 1: Fix Imports ---
$files = Get-ChildItem -Path . -Recurse -Include *.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    if ($content -match "from '@angular/fire/firestore'") {
        if ($content -match "import\s*{([^}]*)}\s*from\s*'@angular/fire/firestore'") {
            $imports = $matches[1] -split ","

            $angularFireImports = @()
            $firebaseImports = @()

            foreach ($imp in $imports) {
                $trimmed = $imp.Trim()

                switch -Regex ($trimmed) {
                    # Yang harus pindah ke firebase/firestore
                    "DocumentReference|CollectionReference|DocumentData|Query|serverTimestamp" {
                        $firebaseImports += $trimmed
                    }
                    default {
                        if ($trimmed -ne "") { $angularFireImports += $trimmed }
                    }
                }
            }

            $newImports = ""

            if ($angularFireImports.Count -gt 0) {
                $newImports += "import { " + ($angularFireImports -join ", ") + " } from '@angular/fire/firestore';`n"
            }
            if ($firebaseImports.Count -gt 0) {
                $newImports += "import { " + ($firebaseImports -join ", ") + " } from 'firebase/firestore';`n"
            }

            $content = $content -replace "import\s*{[^}]*}\s*from\s*'@angular/fire/firestore';", $newImports

            Set-Content -Path $file.FullName -Value $content -Encoding UTF8
            Write-Host "✅ Fixed imports in $($file.FullName)"
        }
    }
}

# --- Bagian 2: Lock Versi di package.json ---
$packageJson = Get-Content -Path "package.json" -Raw | ConvertFrom-Json

$packageJson.dependencies.firebase = "11.10.0"
$packageJson.dependencies."@angular/fire" = "20.0.1"

$packageJson | ConvertTo-Json -Depth 100 | Set-Content -Path "package.json" -Encoding UTF8
Write-Host "✅ package.json sudah dikunci ke firebase@11.10.0 & @angular/fire@20.0.1"

# --- Bagian 3: Install ulang dependency ---
Write-Host "📦 Hapus node_modules & install ulang..."
if (Test-Path node_modules) { Remove-Item -Recurse -Force node_modules }
if (Test-Path package-lock.json) { Remove-Item -Force package-lock.json }

npm install --legacy-peer-deps

Write-Host "`n🎉 Semua selesai! Jalankan 'ng serve' untuk test."
