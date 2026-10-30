set -e

# 1. Make absolutely sure the new VisualFbd component exists
if [ ! -f components/VisualFbd.js ]; then
  echo "Error: components/VisualFbd.js is missing. Please re-run the previous block that created it."
  exit 1
fi

# 2. Overwrite app/page.js imports and component usage via Python
python3 - <<'PY'
import re

p = 'app/page.js'
s = open(p).read()

# A. Fix the imports at the top
# Remove any existing imports for Editors or VisualLadder/VisualFbd
s = re.sub(r'import \{ LadderEditor, FbdEditor \} from "@/components/Editors";\n?', '', s)
s = re.sub(r'import VisualLadder from "@/components/VisualLadder";\n?', '', s)
s = re.sub(r'import VisualFbd from "@/components/VisualFbd";\n?', '', s)

# Add the correct imports right after the sim imports
s = s.replace(
    'import { BASE, ADDR, PRESETS, scan, runTests } from "@/lib/sim";',
    'import { BASE, ADDR, PRESETS, scan, runTests } from "@/lib/sim";\nimport VisualLadder from "@/components/VisualLadder";\nimport VisualFbd from "@/components/VisualFbd";'
)

# B. Fix the JSX component usage
# Replace any variant of the old components with the new ones
s = re.sub(r'<LadderEditor\s+.*?/>', '<VisualLadder rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />', s, flags=re.DOTALL)
s = re.sub(r'<FbdEditor\s+.*?/>', '<VisualFbd rungs={rungs} setRungs={setRungs} state={tags} coil={prob?.out} />', s, flags=re.DOTALL)

open(p, 'w').write(s)
print("Successfully patched app/page.js")
PY

echo "Done. Refresh your browser and check the FBD tab."
