// The API reference, made from the source: every export of every entry point in package.json,
// with its signature and its doc comment, read with the TypeScript compiler the package is
// built with. `apiOf()` is the data; `apiPage()` is the page the demo site serves as api.html.
// A dev-only tool: the package itself depends on nothing.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

/** The source file an entry in `exports` is built from: ./dist/hearts.js is src/hearts.ts. */
const sourceOf = (entry) => resolve(root, entry.default.replace("./dist/", "src/").replace(/\.js$/, ".ts"));

const clip = (text, most = 420) => {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > most ? `${one.slice(0, most - 1)}…` : one;
};

/** Every entry point with its exports: [{ entry, name, exports: [{ name, kind, signature, doc }] }]. */
export function apiOf() {
  const entries = Object.entries(pkg.exports).map(([key, entry]) => ({ key, name: key === "." ? pkg.name : `${pkg.name}/${key.slice(2)}`, file: ["ts", "tsx"].map((ext) => sourceOf(entry).replace(/\.ts$/, `.${ext}`)).find((file) => ts.sys.fileExists(file)) }));
  const config = ts.getParsedCommandLineOfConfigFile(join(root, "tsconfig.json"), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
  const program = ts.createProgram(entries.map((entry) => entry.file), { ...config.options, noEmit: true });
  const checker = program.getTypeChecker();
  return entries.map(({ key, name, file }) => {
    const module = checker.getSymbolAtLocation(program.getSourceFile(file));
    const exports = checker.getExportsOfModule(module).map((symbol) => {
      const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
      const declaration = target.declarations?.[0];
      const doc = ts.displayPartsToString(target.getDocumentationComment(checker)).trim();
      let kind = "const";
      let signature = "";
      if (target.flags & ts.SymbolFlags.Function) {
        kind = "function";
        const type = checker.getTypeOfSymbolAtLocation(target, declaration);
        signature = type.getCallSignatures().map((call) => `${symbol.name}${checker.signatureToString(call, declaration, ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature).replace(/ => /, ": ")}`).join("\n");
        signature = signature.replace(/^(\w+)(<[^(]*>)?\((.*)\): /s, (whole, fn, generics, args) => `${fn}${generics ?? ""}(${args}): `);
      } else if (target.flags & (ts.SymbolFlags.TypeAlias | ts.SymbolFlags.Interface)) {
        kind = "type";
        signature = clip(declaration.getText().replace(/^export /, ""));
      } else if (target.flags & ts.SymbolFlags.Module) {
        kind = "namespace";
        signature = `import { ${symbol.name} } from "${pkg.name}"; // or everything in it from "${pkg.name}/${symbol.name}"`;
        return { name: symbol.name, kind, signature, doc: `Everything the ${pkg.name}/${symbol.name} entry point exports, as one namespace.` };
      } else {
        const type = checker.getTypeOfSymbolAtLocation(target, declaration);
        const calls = type.getCallSignatures();
        if (calls.length > 0) {
          kind = "function";
          signature = clip(`${symbol.name}: ${checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation)}`);
        } else signature = clip(`${symbol.name}: ${checker.typeToString(type, declaration, ts.TypeFormatFlags.NoTruncation)}`);
      }
      return { name: symbol.name, kind, signature: kind === "function" ? clip(signature, 600) : signature, doc };
    });
    exports.sort((a, b) => a.name.localeCompare(b.name, "en"));
    return { entry: key, name, exports };
  });
}

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/** A doc comment as HTML: paragraphs, and `code` in backticks. Nothing else is read as markup. */
const prose = (doc) =>
  doc
    .replace(/```\w*\n([\s\S]*?)```/g, (whole, code) => `\u0000${Buffer.from(code).toString("base64")}\u0000`)
    .split(/\n\s*\n/)
    .map((paragraph) => (paragraph.startsWith("\u0000") ? `<pre>${escape(Buffer.from(paragraph.replaceAll("\u0000", ""), "base64").toString()).trimEnd()}</pre>` : `<p>${escape(paragraph.replace(/\n/g, " ")).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`))
    .join("\n");
const anchor = (entry, name) => `${entry === "." ? "main" : entry.slice(2)}-${name}`;

/** The reference as one page, between the family's header and footer. `frame` wraps the body in the page. */
export function apiBody(api = apiOf()) {
  const total = api.reduce((sum, entry) => sum + entry.exports.length, 0);
  const contents = api.map((entry) => `<li><a href="#${anchor(entry.entry, "")}"><code>${escape(entry.name)}</code></a> <span class="fam-muted">${entry.exports.length}</span></li>`).join("\n");
  const sections = api
    .map(
      (entry) => `<section class="api-entry" id="${anchor(entry.entry, "")}">
        <h2><code>${escape(entry.name)}</code></h2>
        <p class="api-names">${entry.exports.map((one) => `<a href="#${anchor(entry.entry, one.name)}">${escape(one.name)}</a>`).join(" ")}</p>
        ${entry.exports
          .map(
            (one) => `<article id="${anchor(entry.entry, one.name)}" data-kind="${one.kind}">
          <h3><span class="fam-badge">${one.kind}</span> ${escape(one.name)}</h3>
          <pre>${escape(one.signature)}</pre>
          ${one.doc === "" ? "" : prose(one.doc)}
        </article>`,
          )
          .join("\n")}
      </section>`,
    )
    .join("\n");
  return { total, html: `<section class="api-contents"><p class="fam-fine">${pkg.name} ${pkg.version} · ${api.length} entry points · ${total} exports</p><ul>${contents}</ul></section>\n${sections}` };
}
