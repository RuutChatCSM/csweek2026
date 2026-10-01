/** Client-side photo handling: square crop, resize and the duotone treatment used on cards. */

const OUTPUT = 640;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = src;
  });
}

/** Reads a File, centre-crops it to a square and returns a JPEG data URL. */
export async function prepareSquarePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url).catch(() => {
      throw new Error("We couldn't read that photo. Try a JPG or PNG.");
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    // Bias the crop slightly upward: faces tend to sit in the top half of portraits.
    const sx = (img.naturalWidth - side) / 2;
    const sy = img.naturalHeight > img.naturalWidth ? (img.naturalHeight - side) * 0.3 : (img.naturalHeight - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT, OUTPUT);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const hex = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Maps luminance onto a two-colour gradient. Returns a compact JPEG data URL. */
export async function applyStyle(src: string, style: "duotone" | "natural", duo: [string, string]) {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = OUTPUT;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, OUTPUT, OUTPUT);

  if (style === "duotone") {
    const data = ctx.getImageData(0, 0, OUTPUT, OUTPUT);
    const px = data.data;
    const [a, b] = [hex(duo[0]), hex(duo[1])];
    // Find the luminance range so every photo uses the full gradient.
    let lo = 255;
    let hi = 0;
    const lum = new Float32Array(px.length / 4);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      lum[j] = l;
      if (l < lo) lo = l;
      if (l > hi) hi = l;
    }
    const range = Math.max(1, hi - lo);
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      let t = (lum[j] - lo) / range;
      t = t * t * (3 - 2 * t); // gentle S-curve for punchier contrast
      px[i] = a[0] + (b[0] - a[0]) * t;
      px[i + 1] = a[1] + (b[1] - a[1]) * t;
      px[i + 2] = a[2] + (b[2] - a[2]) * t;
    }
    ctx.putImageData(data, 0, 0);
  }
  return canvas.toDataURL("image/jpeg", 0.84);
}
