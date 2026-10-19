import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { buildGtmHeadSnippet, buildGtmNoscriptHtml, buildGtmOnLoadScript, isValidGtmId } from "@/lib/gtm";

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

describe("buildGtmOnLoadScript", () => {
  it("wraps Google's snippet unchanged", () => {
    expect(buildGtmOnLoadScript("GTM-NPV6M437")).toContain(GOOGLE_HEAD_SNIPPET);
  });

  it("runs the snippet only once the page has loaded", () => {
    const listeners: Array<{ type: string; run: () => void; once: unknown }> = [];
    const inserted: string[] = [];
    const script = { async: false, src: "" };
    const fakeWindow = {
      addEventListener: (type: string, run: () => void, options: { once?: boolean }) =>
        listeners.push({ type, run, once: options.once }),
    };
    const fakeDocument = {
      createElement: () => script,
      getElementsByTagName: () => [{ parentNode: { insertBefore: (node: typeof script) => inserted.push(node.src) } }],
    };
    runInNewContext(buildGtmOnLoadScript("GTM-NPV6M437"), { window: fakeWindow, document: fakeDocument });
    expect(inserted).toEqual([]);
    expect(listeners).toHaveLength(1);
    expect(listeners[0]?.type).toBe("load");
    expect(listeners[0]?.once).toBe(true);
    listeners[0]?.run();
    expect(inserted).toEqual(["https://www.googletagmanager.com/gtm.js?id=GTM-NPV6M437"]);
    expect(script.async).toBe(true);
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
