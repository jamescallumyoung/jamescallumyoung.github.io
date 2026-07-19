async function main() {
  // Only fetched by browsers that lack native declarative shadow root
  // parsing (roughly pre-2023/2024 depending on engine). Must run and
  // finish before any component's connectedCallback fires, or Lit's
  // hydration support below finds no shadow root and re-renders from
  // scratch instead of hydrating.
  if (!("shadowRootMode" in HTMLTemplateElement.prototype)) {
    const { hydrateShadowRoots } = await import(
      "@webcomponents/template-shadowroot/template-shadowroot.js"
    );
    hydrateShadowRoots(document);
  }

  // Must load before `lit` core / any component module so LitElement
  // recognizes and hydrates existing declarative shadow root content
  // instead of wiping and re-rendering it.
  await import("@lit-labs/ssr-client/lit-element-hydrate-support.js");

  await import("../components/index.js");
}

main();
