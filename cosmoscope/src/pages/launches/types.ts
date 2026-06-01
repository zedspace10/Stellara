export type LaunchStatus =
  | "Go"
  | "TBD"
  | "TBC"
  | "Hold"
  | "Success"
  | "Failure"
  | "Partial Failure"
  | "In Flight"
  | "Unknown";

export interface Launch {
  id: string;
  name: string;
  net: string;             // ISO date string
  netDate: Date;
  status: LaunchStatus;
  statusDescription: string;
  rocketName: string;
  providerName: string;
  providerType: string;
  missionName: string | null;
  missionDescription: string | null;
  missionType: string | null;
  orbitName: string | null;
  padName: string;
  padLocation: string;
  countryCode: string | null;
  image: string | null;
  webcastLive: boolean;
  videoUrls: string[];
  windowStart: string | null;
  windowEnd: string | null;
}

// Raw shape from Launch Library 2
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RawLaunch = any;

export function mapStatus(abbrev: string | undefined): LaunchStatus {
  if (!abbrev) return "Unknown";
  const a = abbrev.toUpperCase();
  if (a === "GO") return "Go";
  if (a === "TBD") return "TBD";
  if (a === "TBC") return "TBC";
  if (a === "HOLD") return "Hold";
  if (a === "SUCCESS") return "Success";
  if (a === "FAILURE") return "Failure";
  if (a === "PARTIAL FAILURE") return "Partial Failure";
  if (a === "IN FLIGHT") return "In Flight";
  return "Unknown";
}

export function transformLaunch(raw: RawLaunch): Launch {
  return {
    id: String(raw.id ?? raw.slug ?? Math.random()),
    name: raw.name ?? "Unknown Mission",
    net: raw.net ?? raw.window_start ?? new Date().toISOString(),
    netDate: new Date(raw.net ?? raw.window_start ?? Date.now()),
    status: mapStatus(raw.status?.abbrev),
    statusDescription: raw.status?.description ?? raw.status?.name ?? "",
    rocketName: raw.rocket?.configuration?.name ?? raw.rocket?.configuration?.full_name ?? "Unknown",
    providerName: raw.launch_service_provider?.name ?? "Unknown",
    providerType: raw.launch_service_provider?.type ?? "",
    missionName: raw.mission?.name ?? null,
    missionDescription: raw.mission?.description ?? null,
    missionType: raw.mission?.type ?? null,
    orbitName: raw.mission?.orbit?.name ?? null,
    padName: raw.pad?.name ?? "Unknown Pad",
    padLocation: raw.pad?.location?.name ?? "Unknown Location",
    countryCode: raw.pad?.country_code ?? raw.pad?.location?.country_code ?? null,
    image: raw.image ?? null,
    webcastLive: raw.webcast_live ?? false,
    videoUrls: Array.isArray(raw.vidURLs)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? raw.vidURLs.map((v: any) => (typeof v === "string" ? v : v?.url)).filter(Boolean)
      : [],
    windowStart: raw.window_start ?? null,
    windowEnd: raw.window_end ?? null,
  };
}

export function getStatusColor(s: LaunchStatus): { bg: string; border: string; text: string; glow: string } {
  switch (s) {
    case "Go":
    case "Success":
      return { bg: "rgba(102,187,106,0.12)", border: "rgba(102,187,106,0.5)", text: "#81c784", glow: "rgba(102,187,106,0.4)" };
    case "TBD":
    case "TBC":
      return { bg: "rgba(255,167,38,0.12)", border: "rgba(255,167,38,0.5)", text: "#ffb74d", glow: "rgba(255,167,38,0.3)" };
    case "Hold":
    case "Failure":
    case "Partial Failure":
      return { bg: "rgba(239,83,80,0.12)", border: "rgba(239,83,80,0.5)", text: "#ef9a9a", glow: "rgba(239,83,80,0.3)" };
    case "In Flight":
      return { bg: "rgba(79,195,247,0.12)", border: "rgba(79,195,247,0.5)", text: "#4fc3f7", glow: "rgba(79,195,247,0.4)" };
    default:
      return { bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)", text: "rgba(255,255,255,0.6)", glow: "rgba(255,255,255,0.1)" };
  }
}

export function getStatusLabel(s: LaunchStatus): string {
  switch (s) {
    case "Go": return "Go for Launch";
    case "TBD": return "Date To Be Determined";
    case "TBC": return "Date To Be Confirmed";
    case "Hold": return "Launch on Hold";
    case "Success": return "Successful";
    case "Failure": return "Failure";
    case "Partial Failure": return "Partial Failure";
    case "In Flight": return "In Flight";
    default: return "Status Unknown";
  }
}

export function getProviderColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("spacex")) return "#ffffff";
  if (n.includes("nasa")) return "#4a90e2";
  if (n.includes("esa") || n.includes("european space")) return "#ffd54f";
  if (n.includes("roscosmos") || n.includes("russian")) return "#e53935";
  if (n.includes("isro") || n.includes("indian space")) return "#ff7043";
  if (n.includes("rocket lab")) return "#26c6da";
  if (n.includes("blue origin")) return "#1565c0";
  if (n.includes("ula") || n.includes("united launch")) return "#bdbdbd";
  if (n.includes("cnsa") || n.includes("china") || n.includes("casc")) return "#ffca28";
  if (n.includes("jaxa") || n.includes("japan")) return "#f06292";
  if (n.includes("arianespace")) return "#90caf9";
  return "#e0e0e0";
}

export function formatLaunchTime(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
