import { startApp } from "./app.js";

const { verificationUrlPromise: verificationUrlPromise, claimsPromise } = startApp();

console.log("verification url:", await verificationUrlPromise);
console.log("claims:", await claimsPromise);
