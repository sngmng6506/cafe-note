export type PreparedImage = {
  id: string;
  sourceIndex: number;
  file: File;
  previewUrl: string;
  status: "ready" | "processing" | "error";
  error?: string;
};
