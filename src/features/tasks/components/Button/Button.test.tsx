import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Create task</Button>);
    expect(screen.getByText("Create task")).toBeInTheDocument();
  });

  it("fires onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Create task</Button>);
    fireEvent.click(screen.getByText("Create task"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disables interaction when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Create task
      </Button>
    );
    fireEvent.click(screen.getByText("Create task"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies fullWidth class", () => {
    render(<Button fullWidth>Create task</Button>);
    expect(screen.getByText("Create task")).toHaveClass("w-full");
  });
});