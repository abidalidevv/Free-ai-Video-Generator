import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ComponentErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-3xl bg-card border border-destructive/30 shadow-card text-center space-y-3 my-4">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive grid place-items-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="font-display font-bold text-[16px] text-foreground">
            {this.props.fallbackTitle || "Section failed to load"}
          </div>
          <p className="text-[12.5px] text-muted-foreground max-w-md mx-auto">
            {this.props.fallbackMessage ||
              this.state.error?.message ||
              "An unexpected error occurred in this view. Your other tasks continue running."}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-secondary hover:bg-secondary/70 text-[12.5px] font-semibold text-foreground transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
