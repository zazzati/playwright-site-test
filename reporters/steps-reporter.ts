/**
 * Custom Playwright reporter.
 * Saves per-test step data and screenshot paths to report-data.json
 * so the custom show-report.js server can render the hierarchical view.
 * Also fires Telegram notifications for each test and a run summary.
 */
import type {
  Reporter,
  TestCase,
  TestResult,
  TestStep,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const telegram = require('../notifiers/telegram');

interface StepRecord {
  title: string;
  category: string;
  duration: number;
  error: string | null;
}

interface TestRecord {
  title: string;
  suiteName: string;
  file: string;
  status: string;
  duration: number;
  error: string | null;
  steps: StepRecord[];
  screenshot: string | null;
}

interface ReportData {
  site: string;
  runId: string;
  startTime: string;
  duration: number;
  stats: { passed: number; failed: number; skipped: number };
  tests: TestRecord[];
}

export default class StepsReporter implements Reporter {
  private tests: TestRecord[] = [];
  private testSteps = new Map<string, StepRecord[]>();
  private telegramJobs: Promise<void>[] = [];
  private runStartTime: Date = new Date();

  onTestBegin(test: TestCase, _result: TestResult): void {
    this.testSteps.set(test.id, []);
  }

  onBegin(_config: unknown, _suite: unknown): void {
    this.runStartTime = new Date();
  }

  onStepEnd(test: TestCase, _result: TestResult, step: TestStep): void {
    const cat = step.category as string;
    // In Playwright 1.59+, page actions are 'pw:api', user expects are 'expect',
    // user-defined steps are 'test.step'. Skip hook/fixture/attach.
    if (cat !== 'pw:api' && cat !== 'expect' && cat !== 'test.step') return;

    const parentCat = step.parent?.category as string | undefined;
    // Only include steps that are direct children of the test body (no parent)
    // or direct children of a user-defined test.step block.
    if (parentCat !== undefined && parentCat !== 'test.step') return;

    const steps = this.testSteps.get(test.id);
    if (steps) {
      steps.push({
        title: step.title,
        category: cat,
        duration: step.duration,
        error: step.error?.message ?? null,
      });
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const steps = this.testSteps.get(test.id) ?? [];

    // Capture screenshot attachment (created when screenshot:'on' is set)
    const screenshotAtt = result.attachments.find(
      (a) => a.name === 'screenshot' && a.contentType === 'image/png',
    );
    const screenshot = screenshotAtt?.path ?? null;

    // Build suite breadcrumb: title path is [file, suite..., testTitle]
    // We drop the first (file) and last (test title) entries
    const titlePath = test.titlePath();
    const suiteName = titlePath.slice(1, -1).join(' › ');

    this.tests.push({
      title: test.title,
      suiteName,
      file: test.location.file,
      status: result.status,
      duration: result.duration,
      error: result.error?.message ?? null,
      steps,
      screenshot,
    });

    this.testSteps.delete(test.id);

    // ── Telegram notification (fire-and-forget, collected for onEnd await) ──
    const runId = process.env.RUN_ID ??
      `run_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;
    const site = process.env.PROJECT_NAME ?? 'all';
    const job = telegram.sendTestResult({
      site,
      runId,
      title:      test.title,
      suiteName,
      status:     result.status,
      duration:   result.duration,
      error:      result.error?.message ?? null,
      screenshot,
      startTime:  this.runStartTime.toISOString(),
    }).catch((e: Error) => {
      console.warn(`  ⚠️  Telegram notification failed: ${e.message}`);
    });
    this.telegramJobs.push(job);
  }

  async onEnd(result: FullResult): Promise<void> {
    const runId =
      process.env.RUN_ID ??
      `run_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;
    const projectName = process.env.PROJECT_NAME ?? 'all';
    const outputDir = path.join('test-results', projectName, runId);

    const stats = { passed: 0, failed: 0, skipped: 0 };
    for (const t of this.tests) {
      if (t.status === 'passed') stats.passed++;
      else if (t.status === 'failed') stats.failed++;
      else stats.skipped++;
    }

    const data: ReportData = {
      site: projectName,
      runId,
      startTime: result.startTime.toISOString(),
      duration: result.duration,
      stats,
      tests: this.tests,
    };

    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'report-data.json'),
      JSON.stringify(data, null, 2),
    );
    console.log(`\n📊 Report data: ${outputDir}/report-data.json`);

    // ── Wait for all per-test Telegram notifications to finish ──
    await Promise.allSettled(this.telegramJobs);

    // ── Send run summary (only if more than one test, to avoid duplicate noise) ──
    if (this.tests.length > 1) {
      await telegram.sendRunSummary({
        site: projectName,
        runId,
        startTime: result.startTime.toISOString(),
        duration:  result.duration,
        stats,
      }).catch((e: Error) => {
        console.warn(`  ⚠️  Telegram run summary failed: ${e.message}`);
      });
    }
  }
}
