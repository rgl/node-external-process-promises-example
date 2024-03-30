# About

[![Build](https://github.com/rgl/node-external-process-promises-example/actions/workflows/build.yml/badge.svg)](https://github.com/rgl/node-external-process-promises-example/actions/workflows/build.yml)

This example Node.js application starts an external process and parses its output to resolve two promises.

This is implemented by the `startApp` function, which is used as:

```typescript
const { verificationUrlPromise, claimsPromise } = startApp();

console.log("verification url:", await verificationUrlPromise);
console.log("claims:", await claimsPromise);
```

# Usage

Install [Node.js](https://nodejs.org).

Install the dependencies:

```bash
npm ci
```

Run the example:

```bash
npm run example
```
