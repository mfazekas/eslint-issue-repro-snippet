
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
  } catch (error: any) {
    core.setFailed(error.message);
  }
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