import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Search tasks" onChange={() => {}} value="" />);
    expect(screen.getByPlaceholderText("Search tasks")).toBeInTheDocument();
  });

  it("calls onChange with typed value", () => {
    const onChange = vi.fn();
    render(<Input value="" onChange={onChange} placeholder="Search tasks" />);
    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "abc" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});