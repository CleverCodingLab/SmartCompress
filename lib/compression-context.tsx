"use client";

/**
 * Compression state management using React Context + useReducer.
 * Manages the full lifecycle: idle → uploading → compressing → done/error.
 */

import React, { createContext, useContext, useReducer, ReactNode } from "react";

/* ── Types ── */

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  ext: string;
  kind: "image" | "video";
  preview?: string; // Object URL for preview
}

export interface CompressionSettings {
  maxWidth: number;
  quality: number;
  crf: number;
}

export interface CompressionResult {
  fileId: string;
  downloadId: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;
  savedPercent: number;
  outputExt: string;
  kind: "image" | "video";
}

export type CompressionStatus =
  | "idle"
  | "uploading"
  | "compressing"
  | "done"
  | "error";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export interface CompressionState {
  files: UploadedFile[];
  settings: CompressionSettings;
  status: CompressionStatus;
  results: CompressionResult[];
  currentFileIndex: number;
  totalFiles: number;
  error: string | null;
  toasts: ToastMessage[];
}

/* ── Actions ── */

type Action =
  | { type: "ADD_FILES"; payload: UploadedFile[] }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<CompressionSettings> }
  | { type: "START_COMPRESSION"; payload: { totalFiles: number } }
  | {
      type: "COMPRESSION_PROGRESS";
      payload: { currentFileIndex: number; result: CompressionResult };
    }
  | { type: "COMPRESSION_COMPLETE" }
  | { type: "COMPRESSION_ERROR"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "ADD_TOAST"; payload: ToastMessage }
  | { type: "REMOVE_TOAST"; payload: string };

/* ── Initial State ── */

const initialSettings: CompressionSettings = {
  maxWidth: 1920,
  quality: 82,
  crf: 28,
};

const initialState: CompressionState = {
  files: [],
  settings: initialSettings,
  status: "idle",
  results: [],
  currentFileIndex: 0,
  totalFiles: 0,
  error: null,
  toasts: [],
};

/* ── Reducer ── */

function compressionReducer(
  state: CompressionState,
  action: Action
): CompressionState {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        files: [...state.files, ...action.payload],
        status: state.status === "done" ? "idle" : state.status,
        error: null,
      };

    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
        results: state.results.filter((r) => r.fileId !== action.payload),
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case "START_COMPRESSION":
      return {
        ...state,
        status: "compressing",
        results: [],
        currentFileIndex: 0,
        totalFiles: action.payload.totalFiles,
        error: null,
      };

    case "COMPRESSION_PROGRESS":
      return {
        ...state,
        currentFileIndex: action.payload.currentFileIndex,
        results: [...state.results, action.payload.result],
      };

    case "COMPRESSION_COMPLETE":
      return {
        ...state,
        status: "done",
      };

    case "COMPRESSION_ERROR":
      return {
        ...state,
        status: "error",
        error: action.payload,
      };

    case "CLEAR_ALL":
      // Revoke any object URLs
      state.files.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return { ...initialState };

    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
}

/* ── Context ── */

interface CompressionContextValue {
  state: CompressionState;
  dispatch: React.Dispatch<Action>;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  updateSettings: (settings: Partial<CompressionSettings>) => void;
  startCompression: () => Promise<void>;
  clearAll: () => void;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const CompressionContext = createContext<CompressionContextValue | null>(null);

/* ── Supported extensions ── */

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff", ".gif", ".webp"]);
const VIDEO_EXT = new Set([".webm", ".mov", ".mkv", ".avi", ".m4v", ".mp4"]);

function getFileKind(ext: string): "image" | "video" | null {
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return null;
}

/* ── Provider ── */

export function CompressionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compressionReducer, initialState);

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: "ADD_TOAST", payload: { id, message, type } });

      // Auto-remove toast after 4 seconds
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", payload: id });
      }, 4000);
    },
    [dispatch]
  );

  const addFiles = (files: File[]) => {
    let rejectedCount = 0;
    const uploadedFiles: UploadedFile[] = files
      .map((file) => {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const kind = getFileKind(ext);
        if (!kind) {
          rejectedCount++;
          return null;
        }

        const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const preview =
          kind === "image" ? URL.createObjectURL(file) : undefined;

        return {
          id,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          ext,
          kind,
          preview,
        } as UploadedFile;
      })
      .filter(Boolean) as UploadedFile[];

    if (rejectedCount > 0) {
      showToast(`${rejectedCount} file(s) are not in a supported format.`, "warning");
    }

    if (uploadedFiles.length > 0) {
      dispatch({ type: "ADD_FILES", payload: uploadedFiles });
    }
  };

  const removeFile = (id: string) => {
    const file = state.files.find((f) => f.id === id);
    if (file?.preview) URL.revokeObjectURL(file.preview);
    dispatch({ type: "REMOVE_FILE", payload: id });
  };

  const updateSettings = (settings: Partial<CompressionSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  };

  const startCompression = async () => {
    if (state.files.length === 0) return;

    dispatch({
      type: "START_COMPRESSION",
      payload: { totalFiles: state.files.length },
    });

    try {
      for (let i = 0; i < state.files.length; i++) {
        const uploadedFile = state.files[i];
        const formData = new FormData();
        formData.append("file", uploadedFile.file);
        formData.append("maxWidth", String(state.settings.maxWidth));
        formData.append("quality", String(state.settings.quality));
        formData.append("crf", String(state.settings.crf));

        const response = await fetch("/api/compress", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Compression failed");
        }

        const data = await response.json();

        const result: CompressionResult = {
          fileId: uploadedFile.id,
          downloadId: data.id,
          originalName: data.originalName,
          originalSize: data.originalSize,
          compressedSize: data.compressedSize,
          ratio: data.ratio,
          savedPercent: data.savedPercent,
          outputExt: data.outputExt,
          kind: data.kind,
        };

        dispatch({
          type: "COMPRESSION_PROGRESS",
          payload: { currentFileIndex: i + 1, result },
        });
      }

      dispatch({ type: "COMPRESSION_COMPLETE" });
      showToast("All files compressed successfully!", "success");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      dispatch({
        type: "COMPRESSION_ERROR",
        payload: errMsg,
      });
      showToast(`Compression failed: ${errMsg}`, "error");
    }
  };

  const clearAll = () => {
    dispatch({ type: "CLEAR_ALL" });
  };

  return (
    <CompressionContext.Provider
      value={{
        state,
        dispatch,
        addFiles,
        removeFile,
        updateSettings,
        startCompression,
        clearAll,
        showToast,
      }}
    >
      {children}
    </CompressionContext.Provider>
  );
}

export function useCompression() {
  const context = useContext(CompressionContext);
  if (!context) {
    throw new Error("useCompression must be used within a CompressionProvider");
  }
  return context;
}
