import { useMemo } from "react";
import { normalizeAdsterraKey, normalizeScriptSrc } from "@/lib/ads-config";

interface AdsterraBannerIframeProps {
  adKey: string;
  width: number;
  height: number;
  scriptUrl?: string;
  className?: string;
}

export function AdsterraBannerIframe({
  adKey,
  width,
  height,
  scriptUrl,
  className = "",
}: AdsterraBannerIframeProps) {
  const cleanKey = normalizeAdsterraKey(adKey);
  const cleanScriptUrl =
    normalizeScriptSrc(scriptUrl) || `//www.highperformanceformat.com/${cleanKey}/invoke.js`;

  const srcDoc = useMemo(() => {
    if (!cleanKey) return "";
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key': '${cleanKey}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };
  </script>
  <script type="text/javascript" src="${cleanScriptUrl}"></script>
</body>
</html>`;
  }, [cleanKey, cleanScriptUrl, width, height]);

  if (!cleanKey) return null;

  return (
    <div
      className={`overflow-hidden flex items-center justify-center max-w-full ${className}`}
      style={{ minHeight: height }}
    >
      <iframe
        title={`Adsterra Ad ${width}x${height}`}
        srcDoc={srcDoc}
        width={width}
        height={height}
        className="border-0 overflow-hidden max-w-full"
        scrolling="no"
      />
    </div>
  );
}
