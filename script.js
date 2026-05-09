document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("h1,h3,h4,li").forEach(el => {

        const base = el.textContent
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "");

        el.id = base;
    });
});

const pageURLs = [
    "unit1.html",
    "unit2.html",
    "unit3.html",
    "unit4.html",
    "unit5.html",
    "unit6.html",
    "unit7.html",
    "unit8.html",
    "unit9.html",
    "vocab.html"
];

const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const form = document.getElementById ("searches");
const info = document.getElementById("info");

let pages = [];

// LOAD ALL PAGES
async function loadPages() {
    const loaded = await Promise.all(
        pageURLs.map(async (url) => {
            
        try {

        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser()
        .parseFromString(html, "text/html");

        // collect searchable elements
        const elements = [
            ...doc.querySelectorAll("h1,h3,h4,p,li")
        ];

        return elements.map(el => {
            const text = el.textContent || "";

            // find nearest heading/section id
            const anchor = "#" + el.textContent
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");
            
        return {
            url,
            title: doc.title || url,
            text,
            anchor
        };
    });

} catch (err) {
    console.error("Failed:", url, err);
    return [];
}
})
);

pages = loaded.flat();

console.log("Loaded pages:", pages);
}


// --------------------
// SEARCH FUNCTION
// --------------------
function performSearch(query) {

    info.style.display = "none";

    results.innerHTML = "";

    query = (query || "").toLowerCase().trim();

    if (!query) return;

    const regex = new RegExp(query, "gi");

    let found = false;

    const grouped = new Map();

    pages.forEach(item => {

    const lowerText = item.text.toLowerCase();

    if (!lowerText.includes(query)) return;

    found = true;

    if (!grouped.has(item.url)) {
        grouped.set(item.url, {
            title: item.title,
            url: item.url,
            matches: []
        });
    }

    grouped.get(item.url).matches.push({
        text: item.text,
        anchor: item.anchor
    });
});

    grouped.forEach(page => {

    const div = document.createElement("div");
    div.className = "search-result";

    const title = document.createElement("h3");
    title.textContent = page.title;

    title.style.cursor = "pointer";
    title.onclick = () => {
        window.location.href = page.url;
    };

    div.appendChild(title);

    const container = document.createElement("div");
    
    const matches = Array.isArray(page.matches) ? page.matches : [];

    matches.forEach(match => {
        const p = document.createElement("p");

      // highlight matches
    p.innerHTML = match.text.replace(
        regex,
        m => `<span class="search-highlight">${m}</span>`
    );

      // make each paragraph clickable to anchor if available
    if (match.anchor) {
        const wrapper = document.createElement("div");
        wrapper.className = "match-box";

        wrapper.onclick = () => {
            const id = match.text
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");

            window.location.href = `${page.url}#${id}`;
        };

        wrapper.appendChild(p);
        container.appendChild(wrapper);

        } else {
            container.appendChild(p);
        }
    });

    div.appendChild(container);
    results.appendChild(div);
});

  if (!found) {
    results.innerHTML = "<p>No results found.</p>";
}
}


// --------------------
// INIT
// --------------------
document.addEventListener("DOMContentLoaded", () => {

    if (!form || !input || !results) {
        console.log("skip search init");
        return;
    }

    loadPages().then(() => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            performSearch(input.value);
        });
    });

});
