export type AssetType = "image" | "audio";

export type BaseAssetDefinition = {
  id: string;
  src: string;
  type?: AssetType;
  required?: boolean;
  description?: string;
  fallbackAssetId?: string;
};

export type ImageAssetDefinition = BaseAssetDefinition & {
  type?: "image";
};

export type AudioAssetDefinition = BaseAssetDefinition & {
  type: "audio";
};

export type AssetDefinition = ImageAssetDefinition | AudioAssetDefinition;

export type AssetManifest = {
  images: ImageAssetDefinition[];
  audio?: AudioAssetDefinition[];
};

export type AssetLoadStatus = "pending" | "loaded" | "failed";

export type LoadedAssetBase = {
  id: string;
  src: string;
  type: AssetType;
  status: AssetLoadStatus;
  definition: AssetDefinition;
  error?: string;
};

export type LoadedImageAsset = LoadedAssetBase & {
  type: "image";
  definition: ImageAssetDefinition;
  image?: HTMLImageElement;
};

export type LoadedAudioAsset = LoadedAssetBase & {
  type: "audio";
  definition: AudioAssetDefinition;
};

export type LoadedAsset = LoadedImageAsset | LoadedAudioAsset;

export type AssetLoadingProgress = {
  total: number;
  pending: number;
  loaded: number;
  failed: number;
  percent: number;
};
