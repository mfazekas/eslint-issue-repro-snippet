
const core = require('@actions/core');
const github = require('@actions/github');
const { ESLint } = require('eslint');

// eslint plugins
require('eslint-plugin-import');
require('eslint-plugin-react');

const Config = {
  /// the login of the but used to make the comment
  botLogin: 'github-actions[bot]',
  /// the label to add when lint fails
  label: 'error-in-code',
  /// this is the marker is added to all comments made by this action
  commentMarker: '<!-- lint-action -->',
  /// the comment prefix to add when lint fails
  commentPrelude:
    '## Lint failed :sob:\n\nPlease fix the errors in your code example - [More info](https://github.com/rnmapbox/maps/wiki/ErrorInExamplesInIssue).:\n\n',
  /// the comment to add when no code example is found
  noCodeExampleComment:
    'No code example found in issue body - [More info](https://github.com/rnmapbox/maps/wiki/ErrorInExamplesInIssue)',
  /// whether to close the issue if no code example is found
  closeIssueIfNoCodeExample: false,
  /// whether to close the issue when lint fails
  closeIssue: true,
  /// whether to reopen the issue when lint passes
  reopenIssue: true,
  /// eslint formatter to use (stylish or codeframe is recommended)
  formatter: 'codeframe',
  closeLabel: 'reopen-on-code-fixed',
  /// the eslint config used for javascript
  eslintConfig: {
    root: true,
    env: {
      browser: true,
      es2021: true,
    },
    extends: 'plugin:react/recommended',
    overrides: [],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '17.0.2',
      },
    },
    plugins: ['react', 'eslint-plugin-import'],
    rules: {
      'import/prefer-default-export': ['error'],
      'no-undef': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '!../assets/example.png'],
              message:
                'Repo example should complete - it should not use files from your project',
            },
            {
              group: ['!react', '!react-native', '!@rnmapbox/maps'],
              message: 'Should not use third-party libraries',
            },
          ],
        },
      ],
    },
  },
  /// the eslint config used for typescript
  eslintConfigForTypescript: {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
      browser: true,
      es2021: true,
    },
    extends: 'plugin:react/recommended',
    overrides: [],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: '17.0.2',
      },
    },
    plugins: ['react', 'eslint-plugin-import'],
    rules: {
      'import/prefer-default-export': ['error'],
      'no-undef': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '!../assets/example.png'],
              message:
                'Repo example should complete - it should not use files from your project',
            },
            {
              group: ['!react', '!react-native', '!@rnmapbox/maps'],
              message: 'Should not use third-party libraries',
            },
          ],
        },
      ],
    },
  },
};

function log(...args: any[]) {
  console.log('=>', ...args);
}

async function run() {
  try {
    const issueNumber = getIssueNumber();
    log("-- eslintConfig:", core.getInput('eslint-config'))
    log("issueNumber", issueNumber);
    const [code, { isTypescript = false }] = getCode();
    log("code", code, "isTypescript", isTypescript);

    const eslint = new ESLint({
      fix: false,
      useEslintrc: false,
      overrideConfig: isTypescript
        ? Config.eslintConfigForTypescript
        : Config.eslintConfig,
    });
    const results = await eslint.lintText(code, {
      filePath: isTypescript ? 'example.tsx' : 'example.jsx',
    });
    log("results", results);
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

function getCode():[string | undefined, { isTypescript?: boolean }] {
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  const { body } = issue;
  const start = body.search(/```(jsx?|tsx?|javascript|typescript)/i);
  if (start < 0) {
    return [undefined, { isTypescript: undefined }];
  }
  const end = body.indexOf('```', start + 1);
  const bodywithprefix = body.substring(start, end);

  const isTypescript = !!bodywithprefix.match(/```(tsx?|typescript)/i);

  return [
    bodywithprefix.replace(/^```(jsx?|tsx?|javascript|typescript)/i, ''),
    { isTypescript },
  ];
}

function getIssueNumber() {
  const { issue } = github.context.payload;
  if (!issue) {
    throw new Error('Could not find issue in context');
  }
  return issue.number;
}

log("Hello Wold!")
run();