import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "@/pages/Index";

describe("Book A Call CTA", () => {
  it("nav CTA uses 1rem 2rem inline padding", () => {
    const { container } = render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    );
    const cta = Array.from(container.querySelectorAll<HTMLAnchorElement>("a.cta-holo")).find(
      (a) => a.textContent?.includes("Book A Call")
    );
    expect(cta).toBeTruthy();
    expect(cta!.style.padding).toBe("1rem 2rem");
    expect(cta!.className).toContain("rounded-full");
    expect(cta!.className).toContain("text-xs");
  });
});
