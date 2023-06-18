
const core = require('@actions/core');
const github = require('@actions/github');
const { ESLint } = require('eslint');

function log(...args: any[]) {
  console.log('=>', ...args);
}

async function run() {
  try {
    const issueNumber = getIssueNumber();
    log("issueNumber", issueNumber);
    const [code, { isTypescript = false }] = getCode();
    log("code", code, "isTypescript", isTypescript);
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