import type {
  AssetLoadingProgress,
  AssetManifest,
  ImageAssetDefinition,
  LoadedAsset,
  LoadedImageAsset
} from "../types/assets";

export class AssetLoader {
  private manifest: AssetManifest = { images: [] };
  private readonly assets = new Map<string, LoadedAsset>();

  async loadManifest(manifest: AssetManifest): Promise<void> {
    this.manifest = manifest;
    this.assets.clear();

    await this.loadImages(manifest.images);
  }

  async loadImages(definitions: ImageAssetDefinition[]): Promise<void> {
    await Promise.all(definitions.map((definition) => this.loadImage(definition)));
  }

  getManifest(): AssetManifest {
    return this.manifest;
  }

  getAsset(assetId: string): LoadedAsset | undefined {
    return this.assets.get(assetId);
  }

  getImage(assetId: string): HTMLImageElement | undefined {
    const asset = this.getImageAsset(assetId);

    if (asset?.status === "loaded") {
      return asset.image;
    }

    const fallbackAssetId = asset?.definition.fallbackAssetId;
    if (fallbackAssetId) {
      return this.getImage(fallbackAssetId);
    }

    return undefined;
  }

  getImageAsset(assetId: string): LoadedImageAsset | undefined {
    const asset = this.assets.get(assetId);
    return asset?.type === "image" ? asset : undefined;
  }

  hasFailed(assetId: string): boolean {
    return this.assets.get(assetId)?.status === "failed";
  }

  getFailedAssets(): LoadedImageAsset[] {
    return [...this.assets.values()].filter(
      (asset): asset is LoadedImageAsset => asset.type === "image" && asset.status === "failed"
    );
  }

  getFailedAssetIds(): string[] {
    return this.getFailedAssets().map((asset) => asset.id);
  }

  getRequiredFailedAssetIds(): string[] {
    return this.getFailedAssets()
      .filter((asset) => asset.definition.required)
      .map((asset) => asset.id);
  }

  getLoadingProgress(): AssetLoadingProgress {
    const assets = [...this.assets.values()];
    const total = assets.length;
    const loaded = assets.filter((asset) => asset.status === "loaded").length;
    const failed = assets.filter((asset) => asset.status === "failed").length;
    const pending = assets.filter((asset) => asset.status === "pending").length;
    const completed = loaded + failed;

    return {
      total,
      pending,
      loaded,
      failed,
      percent: total === 0 ? 100 : Math.round((completed / total) * 100)
    };
  }

  drawImageOrFallback(
    ctx: CanvasRenderingContext2D,
    assetId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    label = assetId
  ): void {
    const image = this.getImage(assetId);

    if (image) {
      ctx.drawImage(image, x, y, width, height);
      return;
    }

    this.drawFallback(ctx, x, y, width, height, label);
  }

  private loadImage(definition: ImageAssetDefinition): Promise<void> {
    const image = new Image();

    this.assets.set(definition.id, {
      id: definition.id,
      src: definition.src,
      type: "image",
      definition,
      image,
      status: "pending"
    });

    return new Promise((resolve) => {
      image.onload = () => {
        this.assets.set(definition.id, {
          id: definition.id,
          src: definition.src,
          type: "image",
          definition,
          image,
          status: "loaded"
        });
        resolve();
      };

      image.onerror = () => {
        this.assets.set(definition.id, {
          id: definition.id,
          src: definition.src,
          type: "image",
          definition,
          status: "failed",
          error: `画像を読み込めませんでした: ${definition.src}`
        });
        resolve();
      };

      image.src = definition.src;
    });
  }

  private drawFallback(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "#f5e6c8");
    gradient.addColorStop(1, "#c9d7c0");

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(88, 60, 32, 0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1.5, y + 1.5, width - 3, height - 3);
    ctx.fillStyle = "rgba(47, 35, 27, 0.78)";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();
  }
}
