const ORG = "https://github.com/nabat-dev";
const REPO = "https://github.com/nabat-dev/nabat";

const goImportHTML = `<!DOCTYPE html>
<html>
<head>
<meta name="go-import" content="nabat.dev git ${REPO}">
<meta name="go-source" content="nabat.dev _ ${REPO}/tree/main{/dir} ${REPO}/blob/main{/file}#L{line}">
<meta http-equiv="refresh" content="0; url=${ORG}">
</head>
<body>Redirecting to <a href="${ORG}">${ORG}</a></body>
</html>`;

export interface Env {
  ASSETS: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (url.searchParams.get("go-get") === "1") {
      return new Response(goImportHTML, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (path.startsWith("/demos/") || path.startsWith("/schema/")) {
      const key = path.slice(1);
      const object = await env.ASSETS.get(key);
      if (object === null) {
        return new Response("Not Found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=86400");
      return new Response(object.body, { headers });
    }

    return Response.redirect(ORG, 302);
  },
} satisfies ExportedHandler<Env>;
