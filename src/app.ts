import { spawn, ChildProcessWithoutNullStreams } from "child_process";

export interface Claims {
    [key: string]: string;
}

export function startApp(): { verificationUrlPromise: Promise<string>, claimsPromise: Promise<Claims> } {
    let resolveVerificationUrl: (value: string) => void;
    let rejectVerificationUrl: (reason?: Error) => void;
    let resolveClaims: (value: Claims) => void;
    let rejectClaims: (reason?: Error) => void;

    // TODO when https://github.com/tc39/proposal-promise-with-resolvers lands
    //      in node.js without the --js-promise-withresolvers feature flag,
    //      replace this with Promise.withResolvers.
    const verificationUrlPromise = new Promise((resolve: (value: string) => void, reject) => {
        resolveVerificationUrl = resolve;
        rejectVerificationUrl = reject;
    });

    const claimsPromise = new Promise((resolve: (value: Claims) => void, reject) => {
        resolveClaims = resolve;
        rejectClaims = reject;
    });

    const app: ChildProcessWithoutNullStreams = spawn("cat");

    const claims: Claims = {};

    let partialLine = "";

    app.stdout.on("data", (data: Buffer) => {
        const lines = (partialLine + data.toString("utf-8")).split("\n");
        partialLine = lines.pop() ?? "";
        for (const line of lines) {
            const verificationUrlMatch = line.match(/verification url: (?<url>.+)/);
            if (verificationUrlMatch?.groups) {
                const url = verificationUrlMatch.groups.url;
                if (url) {
                    resolveVerificationUrl(url);
                }
            }
            const claimMatch = line.match(/claim (?<name>.+?): (?<value>.+)/);
            if (claimMatch?.groups) {
                const name = claimMatch.groups.name;
                const value = claimMatch.groups.value;
                claims[name] = value;
            }
        }
    });

    app.on("error", (err: Error) => {
        const error = new Error(`Failed to start child process`, { cause: err });
        rejectVerificationUrl(error);
        rejectClaims(error);
    });

    app.on("close", (code: number, signal: string) => {
        if (code !== 0) {
            const error = new Error(`Child process exited with code ${code}`);
            rejectVerificationUrl(error);
            rejectClaims(error);
        } else {
            resolveClaims(claims);
        }
    });

    app.on("spawn", () => {
        app.stdin.write(`\
verification url: http://example.com?code=abc
waiting for verification...
verification complete
claim username: alice
claim email: alice@example.com
`, "utf-8");
        app.stdin.end();
    });

    return { verificationUrlPromise: verificationUrlPromise, claimsPromise };
}
