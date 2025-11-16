# AI Image Generation Workflows

## Generate AI Images (Stable Diffusion)

**Pattern Established:** 2025-01-13 ✅

**Trigger Phrases:**
- "generate images for [project]"
- "create mockups for [concept]"
- "AI image generation for [purpose]"

**Tools Available:**
- Stable Diffusion Image Generator tool in `/tools/stable-diffusion-image-generator/`
- Stability AI API (SDXL 1024-v1-0 model)
- Service account for Google Drive upload to "AI Development - No PHI" drive
- API Key: Configured in tool (sk-6HPZ... with $10 credit)

**Standard Process:**

**Option 1: Quick Generation (No project structure)**
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/tools/stable-diffusion-image-generator
node generate-image.js "your detailed prompt here"

# Generates 4 variations
# Saves to ./output/image_*.png
# Uploads to Google Drive
# Returns 4 Google Drive links
```

**Option 2: Full Project Structure (Organized, recommended)**
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/tools/stable-diffusion-image-generator

# Create organized project folder
node create-project.js "Project Name"

# Then manually:
# 1. Write requirements in project-*/00-brief/requirements.md
# 2. Develop prompt in project-*/01-prompt-development/
# 3. Generate batch: node batch-generate.js --project project-001-name --prompt "detailed prompt"
```

**Real Example (Chelsea Office Sign):**

Project structure created at `/ai-image-projects/project-001-chelsea-office-sign/`:
```
project-001-chelsea-office-sign/
├── 00-brief/
│   └── requirements.md          # Detailed requirements, reference analysis
├── 01-prompt-development/
│   └── initial-prompt.txt       # Optimized Stable Diffusion prompt
├── 02-generations/
│   └── batch-001/               # 4 generated variations
│       ├── image_1.png
│       ├── image_2.png
│       ├── image_3.png
│       └── image_4.png
├── 03-selected/                 # (Empty until selection made)
└── 04-final/                    # (Empty until finalized)
```

**Prompt Development Example:**
```text
Professional exterior building sign on slate gray metal panel,
backlit metal letters with white halo glow effect, modern medical
office signage mounted on commercial building facade, company logo
on left side, clean sans-serif typography, photorealistic
architectural rendering, evening dusk lighting to show backlighting
effect, high-end professional appearance, sharp detail on
illuminated letters, charcoal gray background, contemporary design,
viewed straight-on
```

**Generation Command:**
```bash
cd /Users/mmaruthurnew/Desktop/medical-patient-data/tools/stable-diffusion-image-generator

# Generated 4 variations, uploaded to Google Drive
node generate-image.js "Professional exterior building sign on slate gray metal panel..."
```

**Output:**
- 4 high-quality PNG images (1024x1024)
- Saved locally to project folder
- Uploaded to Google Drive "AI Development - No PHI"
- Google Drive links returned for easy sharing/review

**Code Pattern (batch-generate.js):**
```javascript
const StabilityAPI = require('./lib/stability-api');
const GoogleDrive = require('./lib/google-drive');
const ProjectManager = require('./lib/project-manager');

// Initialize APIs
const stability = new StabilityAPI(process.env.STABILITY_API_KEY);
const drive = new GoogleDrive();

// Generate 4 variations
const results = await stability.generateImage({
  prompt: detailedPrompt,
  negativePrompt: "cartoon, illustration, hand-drawn...",
  samples: 4,          // Generate 4 variations
  width: 1024,
  height: 1024,
  steps: 50,           // High quality
  cfgScale: 7.0        // Follow prompt closely
});

// Save locally and upload to Drive
for (const image of results) {
  await fs.writeFile(localPath, image.buffer);
  const driveLink = await drive.upload({
    fileName: `image_${i}.png`,
    fileBuffer: image.buffer,
    mimeType: 'image/png',
    parentFolderId: SHARED_DRIVE_ID
  });
  console.log(`View: ${driveLink}`);
}
```

**Workflow Steps:**
1. **Gather Requirements** - Understand what's needed, collect reference images
2. **Create Project Structure** - Use `create-project.js` or manual folder creation
3. **Write Requirements.md** - Document purpose, audience, style, technical specs
4. **Develop Prompt** - Craft detailed Stable Diffusion prompt in `01-prompt-development/`
5. **Generate Batch** - Run `batch-generate.js` to create 4 variations
6. **Review via Google Drive** - View links, compare variations
7. **Iterate if Needed** - Refine prompt, generate new batch (batch-002, batch-003, etc.)
8. **Select Best** - Move chosen image(s) to `03-selected/`
9. **Finalize** - Polish if needed, move to `04-final/`, deliver

**Common Variations:**
- [x] Quick generation (no project structure) - Use `generate-image.js`
- [x] Full project with iterations - Use `create-project.js` + `batch-generate.js`
- [ ] Batch generation with multiple prompt variations
- [ ] Image-to-image generation (using existing image as starting point)
- [ ] Custom dimensions (default is 1024x1024)

## Prompt Engineering Tips

- **Be specific:** Detail materials, lighting, perspective, mood
- **Use style keywords:** "photorealistic", "architectural rendering", "professional"
- **Specify lighting:** "dusk lighting", "evening", "backlit" for specific effects
- **Negative prompts:** Exclude unwanted styles ("cartoon", "illustration", "low quality")
- **Perspective matters:** "straight-on view", "aerial view", "close-up detail"
- **Include context:** "mounted on building facade", "medical office", etc.

## Google Drive Integration

- Images auto-uploaded to "AI Development - No PHI" Shared Drive
- Shared Drive ID: `0AFSsMrTVhqWuUk9PVA`
- Service account handles upload (no manual intervention)
- Returns clickable Google Drive links for instant review
- Links are shareable (anyone with link can view)

## Project Naming Convention

- Format: `project-###-descriptive-name`
- Example: `project-001-chelsea-office-sign`
- Sequential numbering: 001, 002, 003, etc.
- Use hyphens, lowercase

## Project Structure

Standard folder structure for organized projects:

```
project-###-name/
├── 00-brief/
│   └── requirements.md          # Project requirements and specifications
├── 01-prompt-development/
│   └── initial-prompt.txt       # Optimized prompts for Stable Diffusion
├── 02-generations/
│   ├── batch-001/               # First generation batch
│   ├── batch-002/               # Second iteration (if needed)
│   └── batch-003/               # Additional iterations
├── 03-selected/                 # Selected images for review/approval
└── 04-final/                    # Final approved images
```

## Cost Tracking

- API cost: ~$0.02 per image (4 images = $0.08 per batch)
- Current balance: $10.00 available
- Monitor usage via Stability AI dashboard
- Estimate: ~500 images possible with current credit

## Notes

- Model: SDXL 1024-v1-0 (high quality, photorealistic)
- Default settings: 50 steps, 7.0 CFG scale (good balance)
- Images saved as PNG for quality
- No PHI in image generation - general purpose only
- Use for: presentations, marketing, social media, educational content, mockups
- Each generation takes ~10-20 seconds
- Always generate 4 variations to have choices
- Iterate prompt if results aren't satisfactory
- Save successful prompts for reuse

## Troubleshooting

- **API errors:** Check API key in `.env` file
- **Upload fails:** Verify service account credentials
- **Low quality images:** Increase steps (50-75) or adjust CFG scale
- **Off-prompt results:** Refine prompt specificity, add negative prompts
- **Wrong style:** Add style keywords, reference artistic styles
