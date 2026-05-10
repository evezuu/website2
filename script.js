// id creator (finally working)
// keep at the start to make it the first thing loading in (otherwise nothing works)

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


// pages to seaarch
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

//me when i connect javascript
const input = document.getElementById("searchInput");
const results = document.getElementById("results");
const form = document.getElementById ("searches");
const info = document.getElementById("info");

// data storer/database!
let pages = [];

// load load load 
async function loadPages() {
    const loaded = await Promise.all(
        pageURLs.map(async (url) => {
            
        try {

        // goes through all of my htmls
        // makes them all into a tree thingy and then that lets my function search through it all (essentially)
        const res = await fetch(url);
        const html = await res.text();
        const doc = new DOMParser()
        .parseFromString(html, "text/html");

        // collects searchable elements
        const elements = [
            ...doc.querySelectorAll("h1,h3,h4,p,li")
        ];

        return elements.map(el => {
            const text = el.textContent || "";

            // find nearest anchor/id thingy to display
            const anchor = "#" + el.textContent
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");
            
        // what the function builds essentially
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


// search function
function performSearch(query) {

    info.style.display = "none";

    results.innerHTML = ""; //clears prev results !

    query = (query || "").toLowerCase().trim(); //makes it all case sensitive

    if (!query) return;

    const regex = new RegExp(query, "gi"); //searches for all instances of a pattern,, js for highlighting the term searched

    let found = false;

    const grouped = new Map(); //group by pages

    pages.forEach(item => {

    const lowerText = item.text.toLowerCase();

    if (!lowerText.includes(query)) return; //skip if search term not there

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

// create/build html for display
    grouped.forEach(page => {

    const div = document.createElement("div");
    div.className = "search-result";

    const title = document.createElement("h3");
    title.textContent = page.title;

    //let's people click to go to places :)
    title.style.cursor = "pointer";
    title.onclick = () => {
        window.location.href = page.url;
    };

    div.appendChild(title); //title goes inside result card

    const container = document.createElement("div"); //RESULT CONTAINER CREATED
    
    const matches = Array.isArray(page.matches) ? page.matches : []; //makes sure it runs if breaks, uses empty array

    matches.forEach(match => { //no word unfound
        const p = document.createElement("p");

      // highlight matches
    p.innerHTML = match.text.replace(
        regex,
        m => `<span class="search-highlight">${m}</span>` 
    );

      // make each paragraph clickable to anchor 
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

        // puts html inside clicking box thing
        wrapper.appendChild(p);
        container.appendChild(wrapper);

        } else {
            container.appendChild(p);  //no anchor, plain text,, lets me spot if some thing isn't clickable for some godforsaken reason
        } 
    });

    div.appendChild(container);
    results.appendChild(div); //display!
});

// fail :(
  if (!found) {
    results.innerHTML = "<p>No results found.</p>";
}
}



// init
document.addEventListener("DOMContentLoaded", () => {

    // if search isn't available stops the event listener from working 
    if (!form || !input || !results) {
        console.log("skip search init");
        return;
    }

    //RUN RUN RUN
    loadPages().then(() => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            performSearch(input.value);
        });
    });

});

// SIDEBAR FOR TOC IN VOCAB
document.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");

    button.addEventListener("click", () => {
        sidebar.classList.toggle("closed"); //closing closing ehehe
    });
});


