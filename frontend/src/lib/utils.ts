import axios from "axios";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenString = (str: string, length = 10) => {
  if (!str) return "";
  return `${str?.slice(0, length)}...${str?.slice(-length)}`;
};

export function truncateString(str: string, maxLength: number): string {
  if (typeof str !== "string") return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, Math.max(0, maxLength)) + (maxLength > 0 ? "..." : "");
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
};

export const maskEmail = (email: string): string => {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return `${local[0]}***${domain}`;
  return `${local.slice(0, 2)}***${domain}`;
};

export const convertNaNToZero = (value: number | string | null | undefined) => {
  return Number.isNaN(Number(value)) ? 0 : value;
};

export const getCurrency = (currency: string = "NGN"): string | undefined => {
  const currencyMap = {
    EUR: "€",
    ZAR: "R",
    USD: "$",
    UGX: "UGX",
    RWF: "RF",
    NGN: "₦",
    KES: "K",
    GHS: "GH¢",
    GBP: "GBP",
  };
  return currencyMap[currency as keyof typeof currencyMap] ?? "₦";
};

export const getApiErrorMessage = (error: unknown) => {
  const fallback = "Failed to add employee";
  const maybeError = error as {
    response?: { data?: { message?: string | string[]; error?: string } };
    message?: string;
  };

  const message = maybeError?.response?.data?.message;
  if (Array.isArray(message) && message.length) {
    return message.join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (typeof maybeError?.response?.data?.error === "string") {
    return maybeError.response.data.error;
  }
  if (typeof maybeError?.message === "string" && maybeError.message.trim()) {
    return maybeError.message;
  }

  return fallback;
};

export const StatusConst = {
  COMMITTED: "COMMITTED",
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  APPROVED: "APPROVED",
  DECLINED: "DECLINED",
  REJECTED: "REJECTED",
  DRAFT: "DRAFT",
  FAILED: "FAILED",
  IN_PROGRESS: "IN_PROGRESS",
  CANCELLED: "CANCELLED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PROCESSING: "PROCESSING",
  ONGOING: "ONGOING",
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  PAID: "PAID",
  PARTIAL: "PARTIAL",
};

export function formatNaira(amount: number | undefined): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return "N/A";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function toRequestMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    );
  }

  return error instanceof Error ? error.message : "Unexpected request error";
}

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];
