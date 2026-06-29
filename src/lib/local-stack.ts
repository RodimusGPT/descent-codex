export type BuilderProfile = "solo" | "team" | "company";
export type ModelClass = "small" | "mid" | "large" | "frontier";
export type ConcurrencyClass = "single" | "team" | "service";
export type PrivacyClass = "flexible" | "local-required";
export type HardwareBudget = "mini" | "desktop-gpu" | "workstation" | "server";

export type LocalStackInput = {
  builder: BuilderProfile;
  concurrency: ConcurrencyClass;
  hardware: HardwareBudget;
  model: ModelClass;
  privacy: PrivacyClass;
};

export type LocalStackRecommendation = {
  fit: "fits" | "constrained" | "reframe";
  hardware: string;
  id: string;
  operations: string;
  serving: string;
  summary: string;
  title: string;
};

export const BUILDER_OPTIONS = [
  { id: "solo", label: "Solo builder" },
  { id: "team", label: "Team server" },
  { id: "company", label: "Company fleet" },
] as const satisfies readonly { id: BuilderProfile; label: string }[];

export const MODEL_OPTIONS = [
  { id: "small", label: "3B-8B" },
  { id: "mid", label: "14B-32B" },
  { id: "large", label: "70B class" },
  { id: "frontier", label: "MoE / frontier" },
] as const satisfies readonly { id: ModelClass; label: string }[];

export const CONCURRENCY_OPTIONS = [
  { id: "single", label: "1 user" },
  { id: "team", label: "Team use" },
  { id: "service", label: "Internal service" },
] as const satisfies readonly { id: ConcurrencyClass; label: string }[];

export const PRIVACY_OPTIONS = [
  { id: "flexible", label: "Flexible" },
  { id: "local-required", label: "Local required" },
] as const satisfies readonly { id: PrivacyClass; label: string }[];

export const HARDWARE_OPTIONS = [
  { id: "mini", label: "Mini / laptop" },
  { id: "desktop-gpu", label: "Desktop GPU" },
  { id: "workstation", label: "Workstation" },
  { id: "server", label: "Server rack" },
] as const satisfies readonly { id: HardwareBudget; label: string }[];

const isHighDemand = (input: LocalStackInput) =>
  input.builder === "company" || input.concurrency === "service";

export const selectLocalStack = (input: LocalStackInput): LocalStackRecommendation => {
  if (input.model === "frontier") {
    return {
      fit: input.hardware === "server" ? "constrained" : "reframe",
      hardware:
        input.hardware === "server"
          ? "A local rack can host parts of this class, but expect multi-node complexity."
          : "Do not plan this around a single commodity box; choose a smaller local model or a hosted/rack-scale path.",
      id: "frontier-reframe",
      operations:
        "Add explicit model admission, budget limits, fallback models, evals, and capacity planning before exposing it broadly.",
      serving:
        "Use a production engine such as vLLM, SGLang, TensorRT-LLM, or NIM behind a gateway; avoid desktop wrappers.",
      summary:
        "The model class dominates the decision. Commodity local hardware is useful for smaller models, not as a turnkey replacement for frontier-scale serving.",
      title: "Reframe the workload",
    };
  }

  if (input.model === "large" && (input.hardware === "mini" || input.hardware === "desktop-gpu")) {
    return {
      fit: "reframe",
      hardware:
        "A 70B-class model usually needs aggressive quantization plus more memory headroom than mini systems or 32 GB GPUs provide comfortably.",
      id: "large-reframe",
      operations:
        "Pick a smaller model, reduce context/concurrency, or move to a workstation/server before adding team traffic.",
      serving:
        "Prototype with llama.cpp or Ollama if needed, but treat it as a model-sizing experiment rather than the target stack.",
      summary: "The chosen hardware tier is below the practical comfort zone for this model class.",
      title: "Downsize or raise the hardware tier",
    };
  }

  if (input.builder === "solo" && input.concurrency === "single" && input.hardware !== "server") {
    return {
      fit: input.model === "large" ? "constrained" : "fits",
      hardware:
        input.hardware === "mini"
          ? "Use unified-memory or efficient CPU/GPU local hardware for small quantized models."
          : "Use one consumer or workstation GPU with enough VRAM for the selected quantization and context.",
      id: "desktop-lab",
      operations:
        "Keep operations light: model files, local logs, prompt tests, and manual updates are usually enough.",
      serving:
        "Start with Ollama, LM Studio, llama.cpp server, MLX-LM on Apple Silicon, or LocalAI if an OpenAI-compatible endpoint is useful.",
      summary:
        "This is a local lab stack: fast to set up, easy to replace, and best for one active user.",
      title: "Desktop local inference",
    };
  }

  if (input.hardware === "server" || isHighDemand(input)) {
    return {
      fit: input.model === "large" ? "constrained" : "fits",
      hardware:
        "Use a rack or tower server with 1-4 GPUs, enough PCIe lanes, cooling, power, NVMe capacity, and predictable remote access.",
      id: "managed-fleet",
      operations:
        "Add auth, quotas, model registry, eval gates, telemetry, logs, backup, rollout policy, and incident ownership.",
      serving:
        "Run vLLM, SGLang, TensorRT-LLM, or NIM behind LiteLLM or Ray Serve; add Kubernetes/GPU Operator, Dynamo, KServe, or llm-d only when scheduling complexity justifies it.",
      summary:
        "This is no longer just local inference. The hard part is operating a small internal service without losing control of capacity and reliability.",
      title: "Managed on-prem service",
    };
  }

  return {
    fit: input.model === "large" ? "constrained" : "fits",
    hardware:
      "Use a workstation GPU tier, unified-memory desktop, or small server with room for context growth and concurrent sessions.",
    id: "team-node",
    operations:
      "Add a shared endpoint, basic auth, usage logs, model-version notes, and a rollback path before calling it production.",
    serving:
      "Use vLLM or SGLang for shared serving; keep Ollama or llama.cpp for desktop fallback and model-conversion work.",
    summary:
      "A single shared node can serve a small team if the model, context length, and concurrency are deliberately bounded.",
    title: "Single-node team server",
  };
};
