import { Loader, LoaderInline, LoaderOverlay, useLoaderFrames } from "@braille-loaders/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("react bindings", () => {
  it("renders an accessible loader label", () => {
    render(
      <Loader
        loader="braille"
        effects={[
          {
            name: "label",
            config: {
              text: "Building..."
            }
          }
        ]}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Building");
  });

  it("renders inline wrappers with child content", () => {
    render(
      <LoaderInline loader="pulse">
        <span>Loading package</span>
      </LoaderInline>
    );

    expect(screen.getByText("Loading package")).toBeInTheDocument();
  });

  it("renders overlay content", () => {
    render(
      <LoaderOverlay loader="pulse" active>
        <div>Hidden content</div>
      </LoaderOverlay>
    );

    expect(screen.getAllByRole("status").length).toBeGreaterThan(0);
    expect(screen.getByText("Hidden content")).toBeInTheDocument();
  });

  it("supports trail snapshots from the hook", () => {
    function Probe() {
      const frames = useLoaderFrames({ loader: "braille" }, 3);
      return <div>{frames.length}</div>;
    }

    render(<Probe />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
