import pkg from 'jsdom';
const { JSDOM, ResourceLoader } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CustomResourceLoader extends ResourceLoader {
    fetch(url, options) {
        if (url.startsWith("http://localhost:3001/assets/")) {
            const localPath = path.join(__dirname, "dist", new URL(url).pathname);
            return Promise.resolve(fs.readFileSync(localPath));
        }
        return super.fetch(url, options);
    }
}

const html = fs.readFileSync(path.join(__dirname, "dist/index.html"), "utf8");

const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: new CustomResourceLoader(),
    url: "http://localhost:3001/",
    beforeParse(window) {
        // Add polyfills
        window.matchMedia = window.matchMedia || function () {
            return { matches: false, addListener: function () { }, removeListener: function () { } };
        };
    }
});

dom.window.addEventListener("error", (event) => {
    console.log("CRASH CAUGHT BY JSDOM:");
    console.error(event.error || event.message);
});

setTimeout(() => {
    const root = dom.window.document.getElementById("root");
    const rootHtml = root ? root.innerHTML : null;
    if (!rootHtml) {
        console.log("Root is completely empty!");
    } else {
        console.log(`Root has ${rootHtml.length} chars of content.`);
        console.log("Preview of root HTML:");
        console.log(rootHtml.substring(0, 200));
    }
    process.exit(0);
}, 3000);
