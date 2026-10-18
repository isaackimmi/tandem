"use client";
import { Component, type ReactNode } from "react";
import { PanelError } from "@/components/Feedback/PanelError";

export class RegionBoundary extends Component<
  { children: ReactNode; label: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <PanelError
        title={`${this.props.label} couldn’t load`}
        onRetry={() => this.setState({ failed: false })}
      />
    ) : (
      this.props.children
    );
  }
}
