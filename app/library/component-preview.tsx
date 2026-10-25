"use client";
import { Component as ReactComponent, useEffect, type ReactNode } from "react";
import { componentPreviews } from "../open-source/components/preview-map";
import "../open-source/components/component-library.css";
class PreviewBoundary extends ReactComponent<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div role="alert">
        This example could not render. Inspect its original source and
        dependencies.
      </div>
    ) : (
      this.props.children
    );
  }
}
export function ComponentPreview({ id }: { id: string }) {
  useEffect(() => {
    const old = document.body.dataset.componentTheme;
    document.body.dataset.componentTheme = "light";
    return () => {
      if (old) document.body.dataset.componentTheme = old;
      else delete document.body.dataset.componentTheme;
    };
  }, []);
  const Preview = componentPreviews[id];
  return (
    <div className="oss-kit mb-component-preview" data-preview-ready="true">
      <div className="kit-preview-canvas" data-appearance="light">
        <div className="kit-preview-inner">
          <PreviewBoundary>
            {Preview ? (
              <Preview />
            ) : (
              <p role="alert">
                Preview unavailable. Original source is included in the
                download.
              </p>
            )}
          </PreviewBoundary>
        </div>
      </div>
    </div>
  );
}
