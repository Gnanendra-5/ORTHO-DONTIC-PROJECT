import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const VIEWPORT = { width: 1920, height: 1080 };
const DEFAULT_URL = 'http://localhost:5174';

const TIMING_PROFILES = {
  conference: { scale: 1, label: 'conference' },
  rehearsal: { scale: 0.72, label: 'rehearsal' },
  fast: { scale: 0.18, label: 'fast' },
};

const BASE_TIMINGS = {
  settle: 550,
  intro: 1400,
  openingRead: 1500,
  cardRead: 1350,
  cardSweep: 900,
  fieldRead: 1150,
  microPause: 450,
  buttonHover: 1500,
  postClick: 900,
  scroll: 1050,
  sceneOutro: 1150,
  finalFrame: 3200,
  modalRead: 5600,
  reportClosePause: 1300,
  processingIntro: 1000,
  processingRow: 650,
  processingCenter: 1200,
};

const CURSOR = {
  baseSteps: 24,
  stepDelay: 9,
  curvature: 0.26,
  driftRatio: 0.18,
  scrollSteps: 18,
  hoverDriftSteps: 16,
};

function parseFlags(argv) {
  const flags = {
    url: DEFAULT_URL,
    pace: 'conference',
    headless: false,
    recordVideo: false,
    holdOpen: false,
    fullscreen: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--headless') {
      flags.headless = true;
    } else if (arg === '--record-video') {
      flags.recordVideo = true;
    } else if (arg === '--hold-open') {
      flags.holdOpen = true;
    } else if (arg === '--fullscreen') {
      flags.fullscreen = true;
    } else if (arg.startsWith('--url=')) {
      flags.url = arg.slice('--url='.length);
    } else if (arg.startsWith('--pace=')) {
      flags.pace = arg.slice('--pace='.length);
    }
  }

  if (!TIMING_PROFILES[flags.pace]) {
    const supported = Object.keys(TIMING_PROFILES).join(', ');
    throw new Error(`Unsupported pace "${flags.pace}". Use one of: ${supported}.`);
  }

  return flags;
}

function printHelp() {
  console.log(`
Cinematic orthodontic AI demo presenter

Usage:
  npm run demo:cinematic
  node scripts/cinematic-demo.mjs --pace=rehearsal --record-video

Options:
  --url=http://localhost:5174   Override the local demo URL.
  --pace=conference|rehearsal|fast
                                Adjust timing for production demos or rehearsals.
  --headless                    Run without opening a visible browser.
  --record-video                Save a Playwright video to artifacts/cinematic-video.
  --hold-open                   Keep the browser open on the final dashboard.
  --fullscreen                  Press F11 after launch for a presentation-only fullscreen pass.
  --help                        Show this help message.
`.trim());
}

function makeTimings(profileName) {
  const scale = TIMING_PROFILES[profileName].scale;
  const entries = Object.entries(BASE_TIMINGS).map(([key, value]) => [
    key,
    Math.max(120, Math.round(value * scale)),
  ]);

  return {
    ...Object.fromEntries(entries),
    cursorStepDelay: Math.max(1, Math.round(CURSOR.stepDelay * scale)),
    cursorStepFactor: scale <= 0.2 ? 0.45 : scale < 0.5 ? 0.62 : scale < 0.85 ? 0.82 : 1,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutSine(progress) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function distance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function bezierPoint(start, controlA, controlB, end, progress) {
  const inverse = 1 - progress;
  const x =
    inverse ** 3 * start.x +
    3 * inverse ** 2 * progress * controlA.x +
    3 * inverse * progress ** 2 * controlB.x +
    progress ** 3 * end.x;
  const y =
    inverse ** 3 * start.y +
    3 * inverse ** 2 * progress * controlA.y +
    3 * inverse * progress ** 2 * controlB.y +
    progress ** 3 * end.y;

  return { x, y };
}

function safeFileName(input) {
  return input.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function byExactText(page, text) {
  return page.getByText(text, { exact: true });
}

function labeledField(page, label) {
  return page.getByLabel(label, { exact: true });
}

function fieldBlock(page, label) {
  return page.locator('label').filter({ hasText: label }).nth(0);
}

function buttonByText(page, text) {
  return page.getByRole('button', { name: text });
}

class CinematicDirector {
  constructor(page, timings) {
    this.page = page;
    this.timings = timings;
    this.cursor = { x: VIEWPORT.width * 0.12, y: VIEWPORT.height * 0.18 };
  }

  log(message) {
    console.log(`[demo] ${message}`);
  }

  async pause(ms, label) {
    if (label) {
      this.log(`${label} (${ms}ms)`);
    }
    await sleep(ms);
  }

  async waitForAppReady(url) {
    this.log(`Opening ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => {
      if (!('fonts' in document)) return true;
      return document.fonts.status === 'loaded';
    });
    await this.page.bringToFront();
    await this.page.mouse.move(this.cursor.x, this.cursor.y);
    await this.pause(this.timings.intro, 'Allowing fonts and entrance animation to settle');
  }

  async ensureVisible(locator, targetRatio = 0.4) {
    await locator.waitFor({ state: 'visible', timeout: 15000 });

    if ((this.timings.cursorStepFactor ?? 1) <= 0.5) {
      await locator.scrollIntoViewIfNeeded();
      return;
    }

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const rect = await locator.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          top: bounds.top,
          bottom: bounds.bottom,
          height: bounds.height,
        };
      });

      const desiredCenter = windowHeight(targetRatio);
      const currentCenter = rect.top + rect.height / 2;
      const delta = currentCenter - desiredCenter;

      if (Math.abs(delta) < 36) {
        return;
      }

      await this.softScroll(delta, this.timings.scroll);
      await this.pause(this.timings.microPause);
    }
  }

  async softScroll(totalDelta, duration = this.timings.scroll) {
    const steps = Math.max(
      CURSOR.scrollSteps,
      Math.min(34, Math.round(Math.abs(totalDelta) / 55)),
    );
    let previous = 0;

    for (let index = 1; index <= steps; index += 1) {
      const progress = easeInOutSine(index / steps);
      const current = totalDelta * progress;
      const increment = current - previous;
      previous = current;
      await this.page.mouse.wheel(0, increment);
      await sleep(Math.max(8, Math.round(duration / steps)));
    }
  }

  async getBox(locator) {
    const box = await locator.boundingBox();

    if (!box) {
      throw new Error('Unable to resolve a visible bounding box for a cinematic target.');
    }

    return box;
  }

  pointFromBox(box, xRatio = 0.5, yRatio = 0.5, offsetX = 0, offsetY = 0) {
    return {
      x: clamp(box.x + box.width * xRatio + offsetX, 12, VIEWPORT.width - 12),
      y: clamp(box.y + box.height * yRatio + offsetY, 12, VIEWPORT.height - 12),
    };
  }

  async moveToPoint(target, options = {}) {
    const {
      duration = this.timings.cardSweep,
      curvature = CURSOR.curvature,
      steps,
      settle = 0,
    } = options;

    const from = { ...this.cursor };
    const travel = distance(from, target);
    const basePointCount = Math.max(CURSOR.baseSteps, Math.min(44, Math.round(travel / 20)));
    const pointCount =
      steps ??
      Math.max(6, Math.round(basePointCount * (this.timings.cursorStepFactor ?? 1)));

    const controlPull = Math.max(40, travel * curvature);
    const direction = target.x >= from.x ? 1 : -1;
    const arc = target.y >= from.y ? 1 : -1;

    const controlA = {
      x: lerp(from.x, target.x, 0.28),
      y: from.y - controlPull * arc * 0.28,
    };
    const controlB = {
      x: lerp(from.x, target.x, 0.72),
      y: target.y + controlPull * arc * 0.18 * direction,
    };

    for (let index = 1; index <= pointCount; index += 1) {
      const progress = easeInOutSine(index / pointCount);
      const point = bezierPoint(from, controlA, controlB, target, progress);
      await this.page.mouse.move(point.x, point.y);
      await sleep(
        Math.max(2, Math.round(duration / pointCount) + (this.timings.cursorStepDelay ?? CURSOR.stepDelay)),
      );
    }

    this.cursor = { ...target };

    if (settle > 0) {
      await this.pause(settle);
    }
  }

  async moveToLocator(locator, options = {}) {
    const {
      xRatio = 0.5,
      yRatio = 0.5,
      offsetX = 0,
      offsetY = 0,
      scrollTarget = 0.42,
      duration,
      settle = 0,
    } = options;

    await this.ensureVisible(locator, scrollTarget);
    const box = await this.getBox(locator);
    const target = this.pointFromBox(box, xRatio, yRatio, offsetX, offsetY);
    await this.moveToPoint(target, { duration, settle });
    return box;
  }

  async gentleDrift(box, duration = this.timings.microPause) {
    const driftX = Math.max(8, Math.min(32, box.width * CURSOR.driftRatio));
    const driftY = Math.max(6, Math.min(24, box.height * CURSOR.driftRatio));
    const waypoints = [
      this.pointFromBox(box, 0.48, 0.46, driftX * 0.4, -driftY * 0.2),
      this.pointFromBox(box, 0.54, 0.52, -driftX * 0.3, driftY * 0.25),
      this.pointFromBox(box, 0.5, 0.5),
    ];

    for (const point of waypoints) {
      await this.moveToPoint(point, {
        duration: Math.max(120, Math.round(duration / waypoints.length)),
        steps: CURSOR.hoverDriftSteps,
      });
    }
  }

  async spotlight(locator, options = {}) {
    const {
      label = 'Spotlight',
      linger = this.timings.cardRead,
      drift = true,
      duration,
      xRatio,
      yRatio,
      offsetX,
      offsetY,
      scrollTarget,
    } = options;

    this.log(label);
    const box = await this.moveToLocator(locator, {
      duration,
      xRatio,
      yRatio,
      offsetX,
      offsetY,
      scrollTarget,
    });

    if (drift && (this.timings.cursorStepFactor ?? 1) > 0.5) {
      await this.gentleDrift(box);
    }

    await this.pause(linger);
  }

  async sweep(locator, options = {}) {
    const {
      label = 'Card sweep',
      linger = this.timings.cardRead,
      scrollTarget = 0.42,
      from = 0.14,
      to = 0.86,
      yRatio = 0.55,
    } = options;

    this.log(label);
    await this.ensureVisible(locator, scrollTarget);
    const box = await this.getBox(locator);
    await this.moveToPoint(this.pointFromBox(box, from, yRatio), {
      duration: this.timings.cardSweep,
    });
    await this.moveToPoint(this.pointFromBox(box, to, yRatio), {
      duration: this.timings.cardSweep,
    });
    await this.gentleDrift(box, Math.round(this.timings.microPause * 0.9));
    await this.pause(linger);
  }

  async click(locator, options = {}) {
    const {
      label = 'Click',
      hover = this.timings.buttonHover,
      post = this.timings.postClick,
      scrollTarget = 0.45,
    } = options;

    this.log(label);
    await this.moveToLocator(locator, {
      duration: this.timings.cardSweep,
      scrollTarget,
    });
    await this.pause(hover);
    await this.page.mouse.down();
    await sleep(85);
    await this.page.mouse.up();
    await this.pause(post);
  }

  async moveToQuietCorner() {
    await this.moveToPoint(
      {
        x: VIEWPORT.width * 0.88,
        y: VIEWPORT.height * 0.9,
      },
      { duration: this.timings.cardSweep * 1.2 },
    );
  }
}

function windowHeight(ratio) {
  return VIEWPORT.height * ratio;
}

async function ensureDemoAvailable(url) {
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Unable to reach the local orthodontic demo at ${url}. Start the app before running the cinematic automation.\n${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function sceneOpening(page, director) {
  const title = page.getByRole('heading', { name: 'Orthodontic AI Decision Support' });

  await title.waitFor({ state: 'visible', timeout: 15000 });
  await director.pause(director.timings.openingRead, 'Opening title card');
  await director.spotlight(title, {
    label: 'Introducing the dashboard title',
    linger: director.timings.openingRead,
    xRatio: 0.38,
    yRatio: 0.48,
  });
  await director.spotlight(byExactText(page, 'Inference Online'), {
    label: 'Reviewing live AI status',
    linger: director.timings.cardRead,
  });
  await director.spotlight(byExactText(page, 'Case 04-217'), {
    label: 'Framing the active patient case',
    linger: director.timings.cardRead,
  });
  await director.sweep(byExactText(page, 'Clinical pipeline ready'), {
    label: 'Settling into the readiness banner',
    linger: director.timings.cardRead,
    yRatio: 0.45,
  });
}

async function scenePatientInput(page, director) {
  await director.spotlight(byExactText(page, 'Medical Image System'), {
    label: 'Introducing the patient imaging workspace',
    linger: director.timings.cardRead,
    scrollTarget: 0.34,
  });
  await director.spotlight(byExactText(page, 'Cephalometric'), {
    label: 'Hovering the cephalometric image',
    linger: director.timings.cardRead,
    scrollTarget: 0.46,
  });
  await director.spotlight(byExactText(page, 'OPG'), {
    label: 'Hovering the panoramic OPG card',
    linger: director.timings.cardRead,
    scrollTarget: 0.46,
  });
  await director.spotlight(byExactText(page, 'Patient Demographics'), {
    label: 'Pausing on patient demographics',
    linger: director.timings.cardRead,
    scrollTarget: 0.38,
  });
  await director.spotlight(byExactText(page, 'Cephalometric Measurements'), {
    label: 'Previewing cephalometric measurements',
    linger: director.timings.cardRead,
    scrollTarget: 0.46,
  });
  await director.spotlight(byExactText(page, 'Clinical Findings'), {
    label: 'Previewing clinical findings',
    linger: director.timings.cardRead,
    scrollTarget: 0.46,
  });

  await director.spotlight(fieldBlock(page, 'Age'), {
    label: 'Highlighting patient age',
    linger: director.timings.fieldRead,
    scrollTarget: 0.37,
  });
  await director.spotlight(fieldBlock(page, 'Skeletal class'), {
    label: 'Highlighting skeletal classification input',
    linger: director.timings.fieldRead,
    scrollTarget: 0.37,
  });
  await director.spotlight(fieldBlock(page, 'Growth pattern'), {
    label: 'Highlighting the growth pattern input',
    linger: director.timings.fieldRead,
    scrollTarget: 0.37,
  });

  await director.spotlight(fieldBlock(page, 'ANB angle'), {
    label: 'Highlighting ANB for the AI input story',
    linger: director.timings.fieldRead,
    scrollTarget: 0.36,
  });
  await director.spotlight(fieldBlock(page, 'U1-NA'), {
    label: 'Highlighting the U1-NA cephalometric measurement',
    linger: director.timings.fieldRead,
    scrollTarget: 0.36,
  });
  await director.spotlight(
    page.locator('button').filter({ hasText: 'Tongue thrust habit' }),
    {
      label: 'Highlighting tongue thrust habit',
      linger: director.timings.fieldRead,
      scrollTarget: 0.48,
    },
  );
  await director.spotlight(
    page.locator('button').filter({ hasText: 'Scissor bite' }),
    {
      label: 'Highlighting scissor bite',
      linger: director.timings.fieldRead,
      scrollTarget: 0.48,
    },
  );

  await director.click(buttonByText(page, 'RUN AI ANALYSIS'), {
    label: 'Launching the AI analysis flow',
    hover: 1500,
    post: director.timings.processingIntro,
    scrollTarget: 0.72,
  });
}

async function sceneProcessing(page, director) {
  const heading = page.getByRole('heading', { name: 'AI Processing Pipeline' });
  await heading.waitFor({ state: 'visible', timeout: 15000 });

  await director.spotlight(byExactText(page, 'Neural sequence'), {
    label: 'Sweeping across the neural processing stage',
    linger: director.timings.processingCenter,
    scrollTarget: 0.32,
    offsetX: 165,
    offsetY: 175,
  });

  const stepFocusPoints = [
    { label: 'Analyzing cephalometric parameters', point: { x: 1325, y: 424 } },
    { label: 'Extracting orthodontic features', point: { x: 1325, y: 512 } },
    { label: 'Running DSD classification', point: { x: 1325, y: 598 } },
    { label: 'Running TDPS regression', point: { x: 1325, y: 684 } },
    { label: 'Generating SHAP explainability', point: { x: 1325, y: 770 } },
  ];

  for (const step of stepFocusPoints) {
    director.log(`Showcasing: ${step.label}`);
    await director.moveToPoint(step.point, {
      duration: director.timings.cardSweep,
      settle: 0,
    });
    await director.pause(director.timings.processingRow);
  }

  await director.pause(director.timings.processingRow, 'Holding for the final recommendation state');
  await page
    .getByRole('heading', { name: 'DSD Classification Results' })
    .waitFor({ state: 'visible', timeout: 15000 });
}

async function sceneDsd(page, director) {
  await director.pause(director.timings.cardRead, 'Allowing the DSD results to settle');
  await director.spotlight(
    page
      .locator('section')
      .filter({ hasText: 'Primary Outcome' })
      .getByRole('heading', { name: 'Class I Malocclusion' }),
    {
    label: 'Highlighting the primary malocclusion prediction',
    linger: director.timings.cardRead,
    scrollTarget: 0.28,
    },
  );
  await director.spotlight(
    page
      .locator('section')
      .filter({ hasText: 'Prediction 2' })
      .getByRole('heading', { name: 'Class II Division 1' }),
    {
    label: 'Highlighting the secondary Class II Division 1 signal',
    linger: director.timings.cardRead,
    scrollTarget: 0.44,
    },
  );
  await director.spotlight(
    page
      .locator('section')
      .filter({ hasText: 'Prediction 3' })
      .getByRole('heading', { name: 'Horizontal Growth Pattern' }),
    {
    label: 'Highlighting the growth pattern output',
    linger: director.timings.cardRead,
    scrollTarget: 0.48,
    },
  );
  await director.spotlight(
    page
      .locator('section')
      .filter({ hasText: 'Prediction 4' })
      .getByRole('heading', { name: 'Non-Extraction Treatment' }),
    {
    label: 'Highlighting the treatment strategy recommendation',
    linger: director.timings.cardRead,
    scrollTarget: 0.52,
    },
  );
  await director.spotlight(byExactText(page, 'Model Confidence'), {
    label: 'Reading the DSD analytics cards',
    linger: director.timings.cardRead,
    scrollTarget: 0.72,
  });
  await director.spotlight(byExactText(page, 'Classification Accuracy'), {
    label: 'Reading the classification accuracy card',
    linger: director.timings.cardRead,
    scrollTarget: 0.72,
  });
  await director.spotlight(byExactText(page, 'AI Reliability'), {
    label: 'Reading the AI reliability card',
    linger: director.timings.cardRead,
    scrollTarget: 0.72,
  });
  await director.click(buttonByText(page, 'Continue to TDPS Analysis'), {
    label: 'Transitioning into TDPS prediction',
    hover: director.timings.buttonHover,
    post: director.timings.sceneOutro,
    scrollTarget: 0.8,
  });
}

async function sceneTdps(page, director) {
  const heading = page.getByRole('heading', { name: 'TDPS Duration Forecast' });
  await heading.waitFor({ state: 'visible', timeout: 15000 });

  await director.spotlight(byExactText(page, 'Projected active treatment'), {
    label: 'Framing the circular duration indicator',
    linger: director.timings.cardRead,
    scrollTarget: 0.32,
    offsetY: 180,
  });
  await director.spotlight(byExactText(page, 'Planned treatment progression'), {
    label: 'Framing the treatment timeline',
    linger: director.timings.cardRead,
    scrollTarget: 0.34,
    offsetY: 190,
  });

  const factorNames = [
    'Adult Patient',
    'Tongue Thrust Habit',
    'Scissor Bite',
    'Gingivitis',
  ];

  for (const factorName of factorNames) {
    await director.spotlight(byExactText(page, factorName), {
      label: `Reviewing factor card: ${factorName}`,
      linger: director.timings.cardRead,
      scrollTarget: 0.52,
    });
  }

  await director.spotlight(byExactText(page, 'View SHAP Explainability'), {
    label: 'Preparing the transition to SHAP explainability',
    linger: director.timings.cardRead,
    scrollTarget: 0.82,
  });
  await director.click(buttonByText(page, 'View SHAP Explainability'), {
    label: 'Opening SHAP explainability',
    hover: director.timings.buttonHover,
    post: director.timings.sceneOutro,
    scrollTarget: 0.82,
  });
}

async function sceneShap(page, director) {
  const heading = page.getByRole('heading', { name: 'SHAP Explainability Review' });
  await heading.waitFor({ state: 'visible', timeout: 15000 });

  const featureButtons = [
    'U1-NA Angle',
    'ANB Angle',
    'Tongue Thrust Habit',
    'Growth Pattern',
  ];

  for (const featureName of featureButtons) {
    await director.spotlight(
      page.locator('button').filter({ hasText: featureName }),
      {
        label: `Showing SHAP feature: ${featureName}`,
        linger: director.timings.cardRead,
        scrollTarget: 0.4,
      },
    );
  }

  await director.spotlight(byExactText(page, 'Clinical interpretation'), {
    label: 'Holding on the clinical interpretation panel',
    linger: director.timings.cardRead,
    scrollTarget: 0.44,
  });
  await director.pause(director.timings.cardRead, 'Giving the audience time to absorb the explainability story');
  await director.click(buttonByText(page, 'Clinician Review'), {
    label: 'Transitioning to the final clinical decision',
    hover: director.timings.buttonHover,
    post: director.timings.sceneOutro,
    scrollTarget: 0.84,
  });
}

async function sceneFinalDecision(page, director) {
  const heading = page.getByRole('heading', { name: 'Final Clinical Decision' });
  await heading.waitFor({ state: 'visible', timeout: 15000 });

  const cards = [
    'Case overview',
    'Orthodontic classification',
    'Proposed clinical pathway',
    'Prediction confidence profile',
    'Why the AI recommended this plan',
  ];

  for (const cardTitle of cards) {
    await director.spotlight(byExactText(page, cardTitle), {
      label: `Reviewing final decision card: ${cardTitle}`,
      linger: director.timings.cardRead,
      scrollTarget: 0.4,
    });
  }

  await director.click(buttonByText(page, 'Clinician Approved'), {
    label: 'Simulating clinician approval',
    hover: director.timings.buttonHover,
    post: director.timings.cardRead,
    scrollTarget: 0.84,
  });
  await director.spotlight(byExactText(page, 'Clinician sign-off complete'), {
    label: 'Holding on the clinician approval confirmation',
    linger: director.timings.cardRead,
    scrollTarget: 0.82,
  });

  await director.click(buttonByText(page, 'Generate Report'), {
    label: 'Opening the generated report modal',
    hover: director.timings.buttonHover,
    post: director.timings.postClick,
    scrollTarget: 0.84,
  });

  const modalTitle = page.getByRole('heading', { name: 'Orthodontic AI Clinical Summary' });
  await modalTitle.waitFor({ state: 'visible', timeout: 15000 });
  const reportModal = page
    .locator('div')
    .filter({ has: page.getByRole('heading', { name: 'Orthodontic AI Clinical Summary' }) })
    .nth(0);

  await director.spotlight(modalTitle, {
    label: 'Presenting the clinical report',
    linger: director.timings.cardRead,
    scrollTarget: 0.22,
  });
  await director.spotlight(reportModal.getByText('Patient Overview', { exact: true }), {
    label: 'Reading the patient overview section',
    linger: director.timings.cardRead,
    scrollTarget: 0.38,
  });
  await director.spotlight(reportModal.getByText('AI Findings', { exact: true }), {
    label: 'Reading the AI findings section',
    linger: director.timings.cardRead,
    scrollTarget: 0.38,
  });
  await director.spotlight(reportModal.getByText('Approach', { exact: true }), {
    label: 'Reading the treatment recommendation section',
    linger: director.timings.cardRead,
    scrollTarget: 0.58,
  });
  await director.spotlight(reportModal.getByText('Clinician status', { exact: true }), {
    label: 'Reading the governance note section',
    linger: director.timings.cardRead,
    scrollTarget: 0.58,
  });
  await director.pause(director.timings.modalRead, 'Holding the report for the conference audience');
  const closeButton = reportModal.locator('button').nth(0);

  await director.click(closeButton, {
    label: 'Closing the report modal cleanly',
    hover: director.timings.buttonHover,
    post: director.timings.reportClosePause,
    scrollTarget: 0.18,
  });

  await director.moveToQuietCorner();
  await director.pause(director.timings.finalFrame, 'Ending on the final decision dashboard');
}

async function runDemo(flags) {
  await ensureDemoAvailable(flags.url);

  const timings = makeTimings(flags.pace);
  const videoDir = path.resolve(process.cwd(), 'artifacts', 'cinematic-video');
  if (flags.recordVideo) {
    await mkdir(videoDir, { recursive: true });
  }

  let browser;
  let context;
  let page;
  let videoHandle = null;

  try {
    browser = await chromium.launch({
      headless: flags.headless,
      args: [
        '--window-position=0,0',
        `--window-size=${VIEWPORT.width},${VIEWPORT.height}`,
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    context = await browser.newContext({
      viewport: VIEWPORT,
      screen: VIEWPORT,
      deviceScaleFactor: 1,
      colorScheme: 'dark',
      reducedMotion: 'no-preference',
      recordVideo: flags.recordVideo
        ? { dir: videoDir, size: VIEWPORT }
        : undefined,
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });
    });

    page = await context.newPage();
    videoHandle = page.video();

    const director = new CinematicDirector(page, timings);
    director.log(`Running ${TIMING_PROFILES[flags.pace].label} pace at ${flags.url}`);

    await director.waitForAppReady(flags.url);

    if (flags.fullscreen && !flags.headless) {
      await page.keyboard.press('F11');
      await director.pause(timings.intro, 'Switching the browser into fullscreen mode');
    }

    await sceneOpening(page, director);
    await scenePatientInput(page, director);
    await sceneProcessing(page, director);
    await sceneDsd(page, director);
    await sceneTdps(page, director);
    await sceneShap(page, director);
    await sceneFinalDecision(page, director);

    if (flags.holdOpen && !flags.headless) {
      director.log('Holding the browser open. Close it manually when your presentation is complete.');
      await new Promise(() => {});
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Executable doesn\'t exist')) {
      throw new Error(
        `${message}\nInstall the Playwright Chromium browser first with: npx playwright install chromium`,
      );
    }
    throw error;
  } finally {
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }

    if (flags.recordVideo && videoHandle) {
      const videoPath = await videoHandle.path();
      console.log(`[demo] Video saved to ${videoPath}`);
    }
  }
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));

  if (flags.help) {
    printHelp();
    return;
  }

  await runDemo(flags);
}

main().catch((error) => {
  console.error(`[demo] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
