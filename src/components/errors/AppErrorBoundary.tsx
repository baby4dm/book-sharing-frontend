import { Component, type ErrorInfo, type ReactNode } from "react";
import { classifyError } from "@/lib/errors";
import ErrorScreen from "./ErrorScreen";

interface State {
  error: unknown;
}

export default class AppErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error: error ?? new Error("Unknown error") };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <main className="flex min-h-dvh items-center bg-background">
        <ErrorScreen
          kind={classifyError(this.state.error)}
          error={this.state.error}
          inRouter={false}
          backTo={{ to: "/", label: "На головну" }}
        />
      </main>
    );
  }
}
