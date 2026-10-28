# Labfolio

**Plan at the bench. Keep a clear record. Turn verified experimental details into scientific Methods.**

Labfolio is a browser-based experiment planner and research notebook for wet-lab workflows. It combines plate design, reusable laboratory entries, material records, experimental results and manuscript drafting.

The public app works without an account or API key for planning, recording, backups and printing. **AI features require your own separately configured, authenticated backend. This repository and the public website contain no owner's API key or access to the owner's private AI service.**

## Contents

- [Features](#features)
- [Quick start](#quick-start)
- [Plate design and batch editing](#plate-design-and-batch-editing)
- [Materials and reusable lists](#materials-and-reusable-lists)
- [Methods and scientific writing](#methods-and-scientific-writing)
- [Results and experiment reports](#results-and-experiment-reports)
- [Two printing modes](#two-printing-modes)
- [Storage and privacy](#storage-and-privacy)
- [Publish with GitHub Pages](#publish-with-github-pages)
- [Optional AI backend and API security](#optional-ai-backend-and-api-security)
- [Local development](#local-development)
- [Troubleshooting](#troubleshooting)

## Features

| Area | Capabilities |
| --- | --- |
| Experiments | Create, edit, duplicate, archive and move records to recoverable Trash |
| Overview | Title, project, planned date, purpose, hypothesis, tags and formatted notes |
| Plates | 6-, 12-, 24-, 48- and 96-well layouts, round maps and two-level groups |
| Conditions | Shared plate defaults, separate pretreatment and stimulation, batch editing |
| Reusable lists | Media, cells, groups, treatments, readouts, methods, projects and collection procedures |
| Materials | Manufacturer, catalog, lot, stock concentration, photos and experiment snapshots |
| Execution | Explicitly confirm completed wells and record deviations separately from plans |
| Results | Images, raw-data files, observations, analysis, interpretation and next steps |
| Methods | Optional reference search, sentence blanks, AI drafting and rich-text editing |
| Writing | Optional scientific English suggestions, reviewed before adoption |
| Reports | Combined overview, plate diagrams, Methods and results |
| Printing | One-page lab plan or a naturally flowing complete report |
| Portability | Full JSON backups with attachments and plate CSV import/export |
| Languages | English and Chinese; new public installations start in English |

## Quick start

1. Open the published app in a modern browser.
2. Explore the labelled example or choose **New experiment**.
3. Fill **Overview**, then open **Plate & plan**.
4. Enter shared conditions in **Plate defaults**, select wells and assign treatments.
5. Click **Apply to selection** after editing a well draft. Applied changes save automatically.
6. Use **Print experiment** to take a plan to the laboratory.
7. Confirm completed wells in **Execution**; add results and Methods as work progresses.
8. Read **Experiment report** or print/save the complete record as PDF.
9. Regularly export a full backup from **Backup & settings**.

Core notebook features do not require AI. The public static app cannot perform AI requests until an authorized backend is configured.

## Plate design and batch editing

### Shared conditions

Enter cell/sample, cells per well, volume, **Seeding medium**, **Assay medium**, collection method and seeding date once in **Plate defaults**. Optional per-well overrides are available for exceptions. Seeding and assay media are distinct; one is not inferred from the other.

Use the experiment purpose to state the question. A title such as `Effect of TPCA-1 on R848-induced responses in BMDMs` identifies the comparison without assuming its outcome. Notes can be red and/or bold for bench reminders.

### Pretreatment and stimulation

Each stage has a name, final concentration, unit and duration. Common units have dropdown choices and custom units are supported. Select **No pretreatment** or **No stimulation** explicitly for an untreated stage.

For an untreated stage, a recorded duration is a matched waiting interval rather than exposure. A material's stock concentration is not automatically its final treatment concentration.

### Two-level plate layout

The upper merged header shows stage timing, such as `Pretreatment 1 h + Stimulation 15 min`. Lower cells show names and concentrations, with pretreatment above stimulation. Stage words are explained once instead of repeated inside each well. Adjacent matching conditions can share merged labels. Round-well view is also available.

### Batch changes

Select multiple wells or a range, edit the intended fields, then click **Apply to selection**. Editing only duration preserves different drugs and concentrations already assigned to the selected wells. Select the explicit whole-stage copy option only when replacing that stage's complete conditions. Review the plate after applying changes.

### Execution is separate from planning

Planned wells are not automatically completed experiments. Confirm only wells actually completed in **Execution**. This saves snapshots of the actual conditions; changing the plan later does not overwrite them. Record deviations and edit actual conditions where necessary. Duplicating an experiment copies the design while resetting actual execution and results.

### CSV

The plate menu supports CSV import/export. Excel can save a worksheet as CSV. A `well` column is required; supported columns include:

```text
well,parent_group,group,cell,count,volume,treatment,concentration,unit,duration,stage,seeding_medium,assay_medium,collection_method,treatment_status
```

Use `pretreatment` or `stimulation` for `stage`, and `used` or `none` for `treatment_status`. Multiple rows can describe multiple treatment steps for one well. Import asks for confirmation before replacing corresponding fields. Review the imported plan and use Undo if needed.

## Materials and reusable lists

Use **Reusable lists** for frequently used recipes, cells, treatment names, collection procedures and other text. Entries can be edited, archived and restored. Selecting one copies its text; later list changes do not silently rewrite existing experiments.

**Materials** stores names, manufacturers, catalog numbers, lots, stock concentrations, specifications and label photographs. Optional AI recognition sends selected photos only when requested. Review the proposed metadata against the label before confirming it.

Linking a material preserves an experiment-specific snapshot. Changes to the material library do not automatically overwrite old snapshots.

## Methods and scientific writing

With an authorized AI backend:

1. Enter a method name, such as `glycolytic stress test in HEK293T cells`.
2. Request a reference search, or paste/upload a method reference.
3. Complete short sentence blanks with the conditions actually used.
4. Confirm completed information and request a scientific draft.
5. Review the proposal, adopt it if correct, and edit or copy the manuscript text.

References provide a structure and writing example, not facts about your experiment. Unrecorded doses, incubation times, instruments and procedural steps must not be treated as completed work. Inspect the displayed sources and check relevance yourself.

Scientific writing suggestions reorganize recorded information according to the field's purpose. They are proposals: existing text changes only after acceptance. Prior text and method drafts are retained in their respective histories.

The rich-text editor supports common manuscript fonts, sizes and basic formatting, with plain-text and formatted copying. Pasted formatting may differ between destination applications. Changing interface language does not translate or overwrite existing experiment text.

## Results and experiment reports

Use **Results** for:

- **Experimental results:** observed images, readouts, comparisons and actual statistical findings.
- **Interpretation and conclusion:** what the results support, uncertainty and alternative explanations.
- **Additional analysis:** optional normalization, statistics, quality checks and outlier notes.
- **Problems and next steps:** deviations, possible causes and follow-up work.

Files are stored locally, up to 15 MB each. Uploading does not analyze a file. Supported image formats appear inline; other attachments are listed for download.

**Experiment report** combines overview, all plate plan diagrams and shared defaults, Methods, result images, analysis, conclusions and next steps. It omits duplicate per-well detail tables and the separate Execution and Materials sections. Those records remain in their original tabs. Each report section has an **Edit** link; no duplicate entry is needed.

## Two printing modes

| Action | Intended use | Layout |
| --- | --- | --- |
| **Print experiment** | Take a plan to the lab bench | Overview and selected plates fit one A4 page; optional grouped conditions and bench notes |
| **Print full record / PDF** in Experiment report | Read, archive or share the report | Overview, all plate plans, Methods and results flow naturally over multiple pages |

Both previews offer portrait and landscape. Select A4 in the browser print dialog and disable browser headers/footers if appropriate. Enable background graphics when colored treatment groups are needed. Use the browser's PDF destination to save a PDF.

A dense multi-plate bench plan can require small text. Select fewer plates or landscape for readability. The full-report mode neither squeezes the plan into a fixed first page nor forces each section onto a new page.

## Storage and privacy

- Records and attachments are stored in this browser using IndexedDB.
- There is no cloud synchronization or shared editing.
- Sharing the app URL shares the tool, not your experiments.
- Different origins, browsers, profiles and devices have separate storage. A new GitHub Pages address does not automatically contain records from an old address.
- Export a full JSON backup before changing addresses, devices or browsers, clearing site data or importing another backup.
- Import replaces the current workspace. Export the current workspace first.
- Clearing site data can delete records. Private browsing may discard them on closing.
- Dictation depends on browser support and may transmit audio to the browser vendor's speech service.
- Explicit AI requests send relevant text or images to the user-configured backend and AI provider.

Never put backups, unpublished findings, label photos or sensitive research data in the public repository. The sample experiment contains illustrative placeholder conditions, not a validated protocol.

## Publish with GitHub Pages

The prebuilt `docs/` directory requires no API key, secret or build installation:

1. Create a public GitHub repository named `labfolio`. Initialize with a README if uploading through the web interface.
2. Upload this package's **contents**, keeping `README.md`, `docs/`, `web/`, `worker/`, `scripts/` and the other files at repository root. Do not upload only a ZIP or add an extra enclosing folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/docs**, then click **Save**.
6. Wait for deployment to succeed. Share the actual URL shown in Pages settings.

A typical project URL is `https://YOUR-USERNAME.github.io/labfolio/`; the final address depends on the account, repository name and custom domain. `docs/.nojekyll` enables direct static-file serving. No custom workflow is needed.

When changing `web/`, run `npm run build` and commit the regenerated `docs/` files as well.

Official guide: [Configure a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Optional AI backend and API security

### Public sharing defaults

`docs/` is static and contains no owner API key, backend address or access token. Visitors can use the local notebook. AI requires deliberate configuration of their own compatible protected backend.

**Do not put an OpenAI key in JavaScript, HTML, localStorage, README, a committed `.env`, URLs or the Pages output.** Browser-delivered files are inspectable. Repository secrets are not protected if a build embeds their values into public frontend files.

### Self-hosted backend

`npm run build` also produces `dist/worker.js`, a Cloudflare Worker-compatible server bundle. Deploy it separately in an account you control. This repository does not automatically deploy or connect it.

Configure these values on the server:

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI credential |
| `OPENAI_MODEL` | Optional model override; default shown in `.env.example` |
| `APP_ACCESS_TOKEN` | Separate long random secret authorizing access to a standalone backend |
| `ALLOWED_ORIGIN` | Exact frontend origin, e.g. `https://YOUR-USERNAME.github.io`, without repository path or trailing slash |

The backend also supports a trusted hosting-gateway identity mode. `SITES_AUTH_ENABLED` is only for that trusted gateway, which authenticates requests and controls identity headers. **Do not enable it on an independently exposed Worker.** Use `APP_ACCESS_TOKEN` for standalone hosting.

An authorized user can enter the backend HTTPS origin and its access token in **Backup & settings → Advanced**. The token is separate from the OpenAI key and kept in sessionStorage for the current session. It authorizes spending the backend owner's AI credit: do not publish it.

CORS is not authentication; an allowed-origin setting alone does not block direct API callers. Before opening an AI service to many users, implement user authentication, quotas, rate limits and budget controls. Those multi-user features are not included here.

The public release intentionally does not connect to the original owner's AI account. Visitors may self-host a protected backend using their own credentials.

### Credential hygiene

`.gitignore` excludes `.env` variants, private configuration and generated server bundles. `.env.example` contains only variable names and non-secret defaults. Do not publish hosting identity files, previous Git history, browser backups or secrets. If a real key is ever exposed, revoke or rotate it; merely deleting the file is insufficient.

## Local development

Requires Node.js 22 or newer. There are no npm dependencies to install.

```bash
npm run build   # refresh docs/ and generate the optional server bundle
npm run dev     # build, then run the development server on port 4173
npm run check   # syntax checks
npm test        # rebuild and run tests; AI requests are mocked
```

Open `http://localhost:4173/`. To test the static app alone:

```bash
python3 -m http.server 8000 --directory docs
```

Then open `http://localhost:8000/`. For a local backend test, copy `.env.example` to a local `.env`, configure it privately, build, then run:

```bash
node --env-file=.env scripts/dev.mjs
```

The regular development command does not automatically load `.env`. Never paste secrets into commands or commit them. Core tests do not need an API key.

### Project structure

```text
web/                      Editable browser app
docs/                     Prebuilt public Pages app
worker/backend.js         Optional AI routes and authorization
worker/method-template.js Reference search and sentence templates
scripts/prepare.mjs       Static and optional server build
scripts/dev.mjs           Local development server
tests/                    Records, printing, templates and authorization tests
.env.example              Empty server-configuration template
.gitignore                Excludes secrets and generated server files
```

`worker/index.js` and `dist/worker.js` are generated locally and excluded from the public source package. Builds do not embed environment variable values.

## Troubleshooting

**Old experiments are missing at the new URL:** Open the old app, export a full backup, then import it at the new address. One site cannot read another site's IndexedDB.

**AI does not work on Pages:** Pages only hosts the frontend. Configure a protected backend. Never fix this by inserting a key into browser files.

**Pages shows 404:** Check `docs/index.html`, branch `main`, folder `/docs` and the deployment result.

**Code edits are not on the site:** Build after editing `web/`, commit the regenerated `docs/` files, check deployment and refresh.

**Well edits did not reach the plate:** Click **Apply to selection**. Saving an experiment does not commit an unapplied well draft.

**Printing differs from preview:** Check paper size, orientation, browser headers/footers, background graphics and font availability.

**Dictation is unsupported:** Use keyboard entry.

**A draft contains questionable wording:** Check its sources and actual experimental facts. Correct or reject it before adoption. AI and OCR can make mistakes.

Labfolio is a research productivity prototype, not a validated electronic laboratory notebook, audit-trail system, clinical tool or automatic scientific-analysis service. Researchers remain responsible for record accuracy and manuscript content.
