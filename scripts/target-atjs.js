// Adobe Target integration via at.js 2.0 - the legacy, self-hosted library,
// as opposed to Adobe Experience Platform Web SDK (which requires a paid
// AEP Datastream / Edge Network setup). at.js is freely downloadable and
// self-hostable: https://github.com/adobe/at-js (download the built bundle
// from the Target admin console, Setup > Implementation > at.js, or from
// Adobe's open-source repo) - vendor it into this repo the same way any
// other third-party script is vendored.
//
// Docs referenced:
// https://experienceleague.adobe.com/en/docs/target-learn/tutorials/implementation/understanding-how-atjs-20-works
// https://experienceleague.adobe.com/en/docs/target-learn/tutorials/implementation/implement-atjs-20-in-a-single-page-application

// TODO: vendor the real at.js bundle from Target's admin console into this
// repo (e.g. scripts/vendor/at.js) and point this at that local path.
const AT_JS_PATH = './vendor/at.js';

// Confirmed from the migration spec (Section 2.2): "Target (AT.js v2.11.4)
// posts to unitedstatestennisas.tt.omtrdc.net".
const TARGET_CONFIG = {
  clientCode: 'unitedstatestennisas',
  imsOrgId: 'A6D83F7A5347FCE90A490D44@AdobeOrg',
  // at.js hides <body> itself until a decision arrives - its default
  // anti-flicker approach (see "understanding-how-atjs-20-works").
  bodyHidingEnabled: true,
  // we call triggerView manually below instead of letting at.js auto-fire.
  pageLoadEnabled: false,
  timeout: 1000,
};

function initATJS(path, config) {
  window.targetGlobalSettings = config;
  return new Promise((resolve) => {
    // don't block the page if at.js fails to load
    import(path).then(resolve).catch(() => resolve());
  });
}

/**
 * Fires a Target view evaluation for the current page. Called once at.js has
 * loaded; this repo has no client-side router, so there is only ever one
 * view per page load (no SPA-style triggerView() on navigation needed).
 */
function triggerView() {
  if (!window.adobe?.target) return;
  const viewName = document.title || window.location.pathname;
  window.adobe.target.triggerView(viewName, { page: true });
}

/**
 * Loads Target's personalization for the current page. This site has no
 * consent-management requirement, so this runs unconditionally. Meant to be
 * awaited from loadEager() - Target must resolve early (in parallel with
 * rendering) to avoid a flash of default, un-personalized content once a
 * decision arrives.
 * @returns {Promise<void>}
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadTargetEager() {
  await initATJS(AT_JS_PATH, TARGET_CONFIG);
  triggerView();
}
