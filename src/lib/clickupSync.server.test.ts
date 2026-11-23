import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { syncStudentWithClickUp } from './clickupSync.server';
import { getCourseModules } from './content';

type Row = Record<string, any>;

class FakeQuery {
  private action: 'select' | 'upsert' | 'update' = 'select';
  private payload: Row = {};
  private options: Row = {};
  private filters: { field: string; operator: 'eq' | 'lte'; value: unknown }[] = [];

  constructor(private table: string, private state: { mapping: Row | null; lock: Row | null }) {}

  select(_columns?: string) { return this; }
  upsert(payload: Row, options: Row) { this.action = 'upsert'; this.payload = payload; this.options = options; return this; }
  update(payload: Row) { this.action = 'update'; this.payload = payload; return this; }
  eq(field: string, value: unknown) { this.filters.push({ field, operator: 'eq', value }); return this; }
  lte(field: string, value: unknown) { this.filters.push({ field, operator: 'lte', value }); return this; }
  maybeSingle() { return this.execute(); }
  then(resolve: (value: any) => unknown, reject?: (reason: unknown) => unknown) {
    return this.execute().then(resolve, reject);
  }

  private matches(row: Row) {
    return this.filters.every(filter => {
      if (filter.operator === 'eq') return row[filter.field] === filter.value;
      return String(row[filter.field]) <= String(filter.value);
    });
  }

  private async execute() {
    if (this.table === 'profiles') return { data: { id: 'student', email: 'elev@example.com', full_name: 'Elev Test', tariff: 'pro', created_at: '' }, error: null };
    if (this.table === 'enrollments') return { data: { course_id: 'start', flow_id: 'start-f1', tariff: 'pro', granted_at: '' }, error: null };
    if (this.table === 'exercise_responses') return { data: [], error: null };
    if (this.table === 'student_insights') return { data: null, error: null };
    if (this.table === 'clickup_student_sync') {
      if (this.action === 'select') return { data: this.state.mapping, error: null };
      this.state.mapping = { ...(this.state.mapping || {}), ...this.payload };
      return { data: this.state.mapping, error: null };
    }
    if (this.table === 'clickup_sync_locks') {
      if (this.action === 'upsert') {
        if (this.state.lock && this.options.ignoreDuplicates) return { data: null, error: null };
        this.state.lock = { ...this.payload };
        return { data: this.state.lock, error: null };
      }
      if (!this.state.lock || !this.matches(this.state.lock)) return { data: null, error: null };
      this.state.lock = { ...this.state.lock, ...this.payload };
      return { data: this.state.lock, error: null };
    }
    throw new Error(`Unexpected table: ${this.table}`);
  }
}

describe('ClickUp synchronization locking', () => {
  test('two simultaneous autosaves create one student task and one subtask per module', async () => {
    const state: { mapping: Row | null; lock: Row | null } = { mapping: null, lock: null };
    const admin = { from: (table: string) => new FakeQuery(table, state) };
    const createdTasks: Row[] = [];
    let nextId = 0;
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      if (init?.method === 'POST' && String(input).endsWith('/task')) {
        createdTasks.push(body);
        await new Promise(resolve => setTimeout(resolve, 5));
        nextId += 1;
        return Response.json({ id: `clickup-${nextId}`, url: `https://app.clickup.com/t/${nextId}` });
      }
      return Response.json({});
    };

    try {
      const input = {
        studentId: '00000000-0000-4000-8000-000000000001',
        courseId: 'start',
        exerciseId: 'st-e-0-1',
      };
      const credentials = { lovableApiKey: 'test', connectionKey: 'test' };
      await Promise.all([
        syncStudentWithClickUp(admin, input, credentials),
        syncStudentWithClickUp(admin, input, credentials),
      ]);

      const modules = getCourseModules('start');
      const parents = createdTasks.filter(task => !task.parent);
      const subtasks = createdTasks.filter(task => task.parent);
      assert.equal(parents.length, 1);
      assert.equal(subtasks.length, modules.length);
      assert.equal(new Set(subtasks.map(task => task.name)).size, modules.length);
      assert.equal(new Set(subtasks.map(task => task.parent)).size, 1);
      assert.ok(state.mapping?.task_id);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
