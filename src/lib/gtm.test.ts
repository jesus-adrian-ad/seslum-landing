import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { buildGtmDeferredScript, buildGtmHeadSnippet, buildGtmNoscriptHtml, GTM_IDLE_TIMEOUT_MS, isValidGtmId } from "@/lib/gtm";

const GOOGLE_HEAD_SNIPPET = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NPV6M437');`;

describe("isValidGtmId", () => {
  it.each(["GTM-ABC1234", "GTM-K9X2PQ"])("accepts %s", (id) => {
    expect(isValidGtmId(id)).toBe(true);
  });

  it.each(["", "GTM-", "gtm-abc1234", "G-ABC1234", "GTM-ABC1234\"><script>", " GTM-ABC1234"])("rejects %j", (id) => {
    expect(isValidGtmId(id)).toBe(false);
  });
});

describe("buildGtmHeadSnippet", () => {
  it("matches the snippet Google provides for the container", () => {
    expect(buildGtmHeadSnippet("GTM-NPV6M437")).toBe(GOOGLE_HEAD_SNIPPET);
  });

  it("refuses an id that could break out of the script", () => {
    expect(() => buildGtmHeadSnippet("GTM-ABC');alert(1)//")).toThrow();
  });
});

interface Harness {
  readonly loadListeners: Array<{ type: string; run: () => void; once: unknown }>;
  readonly idleCalls: Array<{ run: () => void; timeout: unknown }>;
  readonly timeouts: Array<{ run: () => void; delay: unknown }>;
  readonly inserted: string[];
}

function runDeferred(withIdleCallback: boolean): Harness {
  const harness: Harness = { loadListeners: [], idleCalls: [], timeouts: [], inserted: [] };
  const script = { async: false, src: "" };
  const fakeWindow = {
    addEventListener: (type: string, run: () => void, options: { once?: boolean }) =>
      harness.loadListeners.push({ type, run, once: options.once }),
    setTimeout: (run: () => void, delay: number) => harness.timeouts.push({ run, delay }),
    ...(withIdleCallback
      ? {
          requestIdleCallback: (run: () => void, options: { timeout?: number }) =>
            harness.idleCalls.push({ run, timeout: options.timeout }),
        }
      : {}),
  };
  const fakeDocument = {
    createElement: () => script,
    getElementsByTagName: () => [{ parentNode: { insertBefore: (node: typeof script) => harness.inserted.push(node.src) } }],
  };
  runInNewContext(buildGtmDeferredScript("GTM-NPV6M437"), { window: fakeWindow, document: fakeDocument });
  return harness;
}

const GTM_SCRIPT_URL = "https://www.googletagmanager.com/gtm.js?id=GTM-NPV6M437";

describe("buildGtmDeferredScript", () => {
  it("wraps Google's snippet unchanged", () => {
    expect(buildGtmDeferredScript("GTM-NPV6M437")).toContain(GOOGLE_HEAD_SNIPPET);
  });

  it("waits for the load event and then for idle time before loading the container", () => {
    const harness = runDeferred(true);
    expect(harness.inserted).toEqual([]);
    expect(harness.loadListeners).toHaveLength(1);
    expect(harness.loadListeners[0]?.type).toBe("load");
    expect(harness.loadListeners[0]?.once).toBe(true);
    harness.loadListeners[0]?.run();
    expect(harness.inserted).toEqual([]);
    expect(harness.idleCalls).toHaveLength(1);
    expect(harness.idleCalls[0]?.timeout).toBe(GTM_IDLE_TIMEOUT_MS);
    harness.idleCalls[0]?.run();
    expect(harness.inserted).toEqual([GTM_SCRIPT_URL]);
  });

  it("falls back to a timeout where requestIdleCallback does not exist", () => {
    const harness = runDeferred(false);
    harness.loadListeners[0]?.run();
    expect(harness.inserted).toEqual([]);
    expect(harness.timeouts).toHaveLength(1);
    harness.timeouts[0]?.run();
    expect(harness.inserted).toEqual([GTM_SCRIPT_URL]);
  });
});

describe("buildGtmNoscriptHtml", () => {
  it("matches Google's noscript with hidden instead of an inline style", () => {
    expect(buildGtmNoscriptHtml("GTM-NPV6M437")).toBe(
      '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NPV6M437" title="Google Tag Manager" height="0" width="0" hidden></iframe></noscript>',
    );
  });

  it("never carries an inline style, which the CSP blocks", () => {
    expect(buildGtmNoscriptHtml("GTM-NPV6M437")).not.toMatch(/\sstyle\s*=/i);
  });

  it("refuses an invalid id", () => {
    expect(() => buildGtmNoscriptHtml("GTM-")).toThrow();
  });
});
