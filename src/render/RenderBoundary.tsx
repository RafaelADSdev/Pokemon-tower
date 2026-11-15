import { Component, type ReactNode } from "react";

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

export class RenderBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
