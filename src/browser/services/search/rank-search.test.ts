import { describe, expect, test } from 'vitest';

import { rankSearch } from './rank-search.ts';

describe('rankSearch', () => {
  test('prioritizes titles and headings over body text', () => {
    const result = rankSearch(
      [
        {
          path: '/body.md',
          appRelativePath: '/body.md',
          groupName: 'Docs',
          title: 'Body page',
          headings: ['Other topic'],
          text: 'The search term appears in this paragraph.',
        },
        {
          path: '/heading.md',
          appRelativePath: '/heading.md',
          groupName: 'Docs',
          title: 'Heading page',
          headings: ['Search term'],
          text: 'A short paragraph.',
        },
        {
          path: '/title.md',
          appRelativePath: '/title.md',
          groupName: 'Docs',
          title: 'Search term',
          headings: [],
          text: 'A short paragraph.',
        },
      ],
      'search term'
    );

    expect(result.map(({ path }) => path)).toEqual(['/title.md', '/heading.md', '/body.md']);
  });

  test('creates prose excerpts without heading lines', () => {
    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: ['Docs'],
          text: '# Docs\n\nThis is the searchable paragraph.\n\n## Details\n\nMore details.',
        },
      ],
      'searchable'
    );

    expect(result[0]?.excerptRange).toEqual({ start: 8, end: 41 });
  });

  test('excerpts the list item that matched, not the whole list', () => {
    const text = '- first item\n- the matching item\n- third item';

    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: [],
          text,
        },
      ],
      'matching'
    );

    const { start, end } = result[0]?.excerptRange ?? { start: 0, end: 0 };

    expect(text.slice(start, end)).toBe('- the matching item');
  });

  test('excerpts the footnote definition that matched', () => {
    const text =
      'Kolay is easy[^definition].\n\n[^a]: unrelated\n[^definition]: Turkish for "easy".';

    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: [],
          text,
        },
      ],
      'turkish'
    );

    const { start, end } = result[0]?.excerptRange ?? { start: 0, end: 0 };

    expect(text.slice(start, end)).toBe('[^definition]: Turkish for "easy".');
  });

  test('excerpts prose, not the fenced sample that documents it', () => {
    const text = [
      '### Footnotes',
      '',
      '```md',
      'Kolay is easy[^definition].',
      '',
      '[^definition]: Turkish for "easy".',
      '```',
      '',
      'Kolay is easy[^definition].',
      '',
      '[^definition]: Turkish for "easy".',
    ].join('\n');

    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: [],
          text,
        },
      ],
      'turkish'
    );

    const { start, end } = result[0]?.excerptRange ?? { start: 0, end: 0 };

    expect(text.slice(start, end)).toBe('[^definition]: Turkish for "easy".');
    expect(start).toBeGreaterThan(text.indexOf('```md'));
  });

  test('excerpts prose, not the markup of an HTML block', () => {
    const text = [
      '<h1 style="',
      '  font-size: 2rem;',
      '  margin-bottom: 0">kolay</h1>',
      '',
      'Documentation system, sized for the job.',
    ].join('\n');

    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: [],
          text,
        },
      ],
      'size'
    );

    const { start, end } = result[0]?.excerptRange ?? { start: 0, end: 0 };

    expect(text.slice(start, end)).toBe('Documentation system, sized for the job.');
  });

  test('a footnote reference is not part of the heading it trails', () => {
    const entry = {
      path: '/docs.md',
      appRelativePath: '/docs.md',
      groupName: 'Docs',
      title: 'Docs',
      headings: [],
      text: '## Install[^type-module]\n\nkolay requires vite.',
    };

    // the label matches the body's heading line, so it scores as body text —
    // scoring it as a heading (25) would rank it above real heading matches
    expect(rankSearch([entry], 'type-module')[0]?.score).toBe(1);
    expect(rankSearch([entry], 'install')[0]?.score).toBe(26);
  });

  test('selects the prose range instead of formatting an excerpt', () => {
    const result = rankSearch(
      [
        {
          path: '/docs.md',
          appRelativePath: '/docs.md',
          groupName: 'Docs',
          title: 'Docs',
          headings: [],
          text: 'A **bold** paragraph with [link text](https://example.com).\n\n```js\nconst incomplete = true;',
        },
      ],
      'paragraph'
    );

    expect(result[0]?.excerptRange).toEqual({ start: 0, end: 59 });
  });

  test('a page is findable by its filename when its title does not say it', () => {
    const entry = {
      path: '/docs/ember-resources.md',
      appRelativePath: '/docs/ember-resources.md',
      groupName: 'Docs',
      title: 'cell',
      headings: [],
      text: 'boop',
    };

    // titles honor the page's first heading, so the filename is the only place
    // 'resources' appears — without scoring the path this page is unreachable
    expect(rankSearch([entry], 'resources')[0]?.score).toBe(10);
    expect(rankSearch([entry], 'cell')[0]?.score).toBe(100);
  });

  test('a path match ranks below a heading match', () => {
    const base = { groupName: 'Docs', headings: [], text: '' };
    const byPath = { ...base, path: '/api.md', appRelativePath: '/api.md', title: 'Reference' };
    const byHeading = {
      ...base,
      path: '/z.md',
      appRelativePath: '/z.md',
      title: 'Z',
      headings: ['api'],
    };

    expect(rankSearch([byPath, byHeading], 'api').map((r) => r.appRelativePath)).toEqual([
      '/z.md',
      '/api.md',
    ]);
  });
});
