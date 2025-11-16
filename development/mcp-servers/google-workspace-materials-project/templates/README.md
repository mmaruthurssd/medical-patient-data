# Sample Templates - Google Workspace Materials

This folder contains professionally crafted medical templates ready for use with the Google Workspace Materials MCP.

## Available Templates

### 1. Discharge Instructions - Surgery
**File:** `discharge-instructions-surgery.md`
**Use Case:** Post-operative care instructions for patients after surgical procedures
**Tokens:** 20+ customizable fields
**Sections:** Wound care, pain management, activity guidelines, medications, follow-up

### 2. Patient Education - Diabetes
**File:** `patient-education-diabetes.md`
**Use Case:** Comprehensive diabetes self-management education
**Tokens:** 15+ customizable fields
**Sections:** Blood sugar monitoring, diet, exercise, medications, foot care, warning signs

### 3. Consent Form - Procedure
**File:** `consent-form-procedure.md`
**Use Case:** Informed consent for medical procedures
**Tokens:** 25+ customizable fields
**Sections:** Procedure details, risks/benefits, alternatives, patient acknowledgment, signatures

### 4. Medication Guide - Blood Pressure
**File:** `medication-guide-blood-pressure.md`
**Use Case:** Patient education for blood pressure medications
**Tokens:** 20+ customizable fields
**Sections:** How to take, side effects, monitoring, lifestyle tips, safety information

### 5. Pre-Operative Instructions
**File:** `pre-op-instructions.md`
**Use Case:** Instructions for patients preparing for surgery
**Tokens:** 30+ customizable fields
**Sections:** Pre-op testing, NPO guidelines, what to bring, arrival information, checklist

## Using These Templates

### With the MCP Server

```
Claude, create a discharge handout for knee surgery using the surgery template.

Tokens:
- PATIENT_NAME: John Smith
- SURGERY_TYPE: Knee Arthroscopy
- SURGERY_DATE: 2025-11-20
- DOCTOR_NAME: Dr. Jane Williams
- FOLLOWUP_DATE: 2025-12-04
```

### Token Replacement

All templates use the `{{TOKEN_NAME}}` format. Common tokens include:

**Patient Information:**
- `{{PATIENT_NAME}}`
- `{{PATIENT_DOB}}`
- `{{MRN}}` (Medical Record Number)

**Provider Information:**
- `{{DOCTOR_NAME}}`
- `{{DOCTOR_CREDENTIALS}}`
- `{{OFFICE_PHONE}}`
- `{{EMERGENCY_PHONE}}`

**Procedure/Visit Details:**
- `{{PROCEDURE_NAME}}`
- `{{SURGERY_DATE}}`
- `{{SURGERY_TIME}}`
- `{{FOLLOWUP_DATE}}`

**Clinical Information:**
- `{{MEDICATIONS}}`
- `{{DOSE}}`
- `{{FREQUENCY}}`
- `{{INSTRUCTIONS}}`

### Customizing Templates

To modify a template:

1. **Edit Locally:**
   ```bash
   # Copy template to working directory
   cp templates/discharge-instructions-surgery.md my-custom-discharge.md

   # Edit as needed
   # Add/remove sections
   # Modify tokens
   # Adjust reading level
   ```

2. **Use AI to Enhance:**
   ```
   Claude, take the diabetes education template and:
   - Simplify to 6th grade reading level
   - Add a section about continuous glucose monitors
   - Make the tone more encouraging
   ```

3. **Save to Drive:**
   ```
   Claude, save this custom template to the Templates folder in Drive.
   ```

## Template Design Principles

All templates follow these best practices:

1. **Reading Level:** 6th-8th grade (unless specialized)
2. **Organization:** Clear sections with headings
3. **Visual Hierarchy:** Uses markdown formatting (H1, H2, H3, bullets, checklists)
4. **Token Flexibility:** Comprehensive token coverage for customization
5. **Completeness:** All essential information included
6. **Professional:** Medical accuracy with patient-friendly language

## Creating New Templates

To create a new template:

1. **Identify Need:**
   - What type of material?
   - What information must be included?
   - Who is the audience?

2. **Structure Content:**
   - Create clear sections
   - Use appropriate headings
   - Add checklists where helpful
   - Include contact information

3. **Add Tokens:**
   - Identify variable information
   - Use descriptive token names
   - Format: `{{TOKEN_NAME}}`
   - Document tokens in comments

4. **Test and Refine:**
   ```
   Claude, test this template with sample data and export to PDF.
   ```

5. **Save to Library:**
   ```
   Claude, add this template to the Templates folder and update the index.
   ```

## Reading Level Guidelines

**6th Grade (Age 11-12):**
- Short sentences (10-15 words)
- Simple words (1-2 syllables)
- Active voice
- Concrete examples
- Minimal medical jargon

**8th Grade (Age 13-14):**
- Medium sentences (15-20 words)
- Mix of simple and moderate vocabulary
- Some medical terms with explanations
- More detailed instructions

**High School (9th-12th Grade):**
- Longer sentences acceptable
- Medical terminology with definitions
- More complex concepts
- Detailed clinical information

Use the `ai_enhance` tool with reading-level targets:
```
Claude, simplify this to 6th grade reading level.
```

## Token Best Practices

1. **Naming Convention:**
   - ALL_CAPS with underscores
   - Descriptive: `{{FOLLOWUP_DATE}}` not `{{DATE}}`
   - Consistent across templates

2. **Required vs Optional:**
   - Core tokens (patient name, date, doctor) always required
   - Conditional sections use optional tokens
   - Document which are required

3. **Default Values:**
   - Provide sensible defaults where possible
   - Example: `{{OFFICE_HOURS}}` defaults to "Monday-Friday 8am-5pm"

4. **Validation:**
   - Phone numbers: Format consistently
   - Dates: Use consistent format (YYYY-MM-DD or MM/DD/YYYY)
   - Times: Use 12-hour or 24-hour consistently

## Template Categories

Templates are organized by type:

1. **Discharge Instructions:** Post-visit care
2. **Patient Education:** Condition management
3. **Consent Forms:** Procedure agreements
4. **Medication Guides:** Prescription information
5. **Pre-Procedure:** Preparation instructions
6. **Test Results:** Lab/imaging explanations
7. **Referrals:** Specialist information
8. **Billing:** Financial policies

## Version Control

When updating templates:

1. Document changes in template header
2. Update version number
3. Note date of modification
4. Keep previous version in Archive if major changes

Example:
```markdown
---
Template: Discharge Instructions - Surgery
Version: 2.1
Last Updated: 2025-11-15
Changes: Added wound infection photo guide, simplified pain scale section
---
```

## Accessibility Considerations

1. **Font Size:** Ensure minimum 11pt when converted to PDF
2. **Contrast:** Black text on white background for printing
3. **Layout:** Clear section breaks, adequate whitespace
4. **Language:** Plain language, defined medical terms
5. **Instructions:** Step-by-step numbered lists
6. **Visual Aids:** Use bullets, checkboxes, and tables

## Quality Checklist

Before finalizing a template:

- [ ] All essential information included
- [ ] Reading level appropriate (6th-8th grade)
- [ ] Tokens clearly marked with `{{}}` format
- [ ] Contact information placeholders present
- [ ] Professional and accurate medical content
- [ ] Friendly, non-technical language
- [ ] Clear section headings
- [ ] Logical organization
- [ ] Emergency information included
- [ ] Tested with sample data

## Resources

**Medical Plain Language:**
- [NIH Clear Communication](https://www.nih.gov/institutes-nih/nih-office-director/office-communications-public-liaison/clear-communication)
- [CDC Health Literacy](https://www.cdc.gov/healthliteracy/)
- [Plain Language Medical Dictionary](https://medlineplus.gov/)

**Reading Level Tools:**
- Flesch-Kincaid Grade Level (built into `ai_enhance`)
- [Hemingway Editor](http://hemingwayapp.com/)
- [Readable.com](https://readable.com/)

**Template Inspiration:**
- Professional medical associations (AMA, specialty societies)
- Hospital patient education libraries
- Government health resources (NIH, CDC)

---

## Getting Help

**Questions about templates:**
- Review DEPLOYMENT-GUIDE.md for usage instructions
- Check EXAMPLES.md for complete workflows
- Consult IMPLEMENTATION-PLAN.md for technical details

**Need a custom template:**
```
Claude, I need a template for [use case]. It should include [sections] and be at [reading level].
```

**Template not working:**
- Verify token format: `{{TOKEN_NAME}}`
- Check for unclosed sections
- Test with minimal tokens first
- Review error logs

---

**Last Updated:** 2025-11-15
**Template Count:** 5 professional templates
**Total Tokens:** 100+ customizable fields
