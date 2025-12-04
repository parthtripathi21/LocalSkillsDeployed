// Global in-memory array
let allListings = [];

// Create a card DOM element
function createListingCard(listing) {
  const card = document.createElement("div");
  card.className =
    "bg-white shadow-lg rounded-xl p-4 border border-gray-300 w-full hover:scale-[1.02] transition-transform duration-200";

  card.innerHTML = `
    <h3 class="text-xl font-bold text-blue-700">${listing.title || ""}</h3>
    <p class="text-sm text-gray-600 mt-1">
      ${listing.description || ""}
    </p>
    <div class="mt-2 text-sm text-gray-800 font-medium">
      📍 ${listing.location || ""}
    </div>
    <div class="mt-2 text-sm">
      <span class="text-green-700 font-semibold">₹${listing.price || ""}</span> /session
    </div>
    <div class="mt-2 text-xs text-gray-500 italic">
      Category: ${listing.category || ""}
    </div>
  `;
  return card;
}

// Load from CSV
function loadFromCSV(callback) {
  Papa.parse("data.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (result) => {
      const data = result.data.map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || "",
        description: item.description || "",
        location: item.location || "",
        price: item.price || "",
        category: item.category || "",
      }));
      allListings = data;
      if (typeof callback === "function") callback(data);
    },
  });
}

// DASHBOARD PAGE LOGIC (index.html)
function initDashboardPage() {
  const listContainer = document.getElementById("dashboard-list");
  const emptyText = document.getElementById("dashboard-empty");
  const form = document.getElementById("add-listing-form");

  if (!listContainer || !form) return; // not on this page

  // Initial load
  loadFromCSV((data) => {
    listContainer.innerHTML = "";
    if (!data.length) {
      emptyText.classList.remove("hidden");
      return;
    }
    emptyText.classList.add("hidden");
    data.forEach((listing) => {
      const card = createListingCard(listing);
      listContainer.appendChild(card);
    });
  });

  // Form submit (in-memory add)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const newListing = {
      id: Date.now().toString(),
      title: formData.get("title"),
      description: formData.get("description"),
      location: formData.get("location"),
      price: formData.get("price"),
      category: formData.get("category"),
    };

    allListings.unshift(newListing);

    const card = createListingCard(newListing);
    listContainer.prepend(card);
    emptyText.classList.add("hidden");

    form.reset();
    alert("Listing added (session only, not saved to CSV file).");
  });
}

// LISTINGS PAGE LOGIC (listings.html)
function initBrowsePage() {
  const listContainer = document.getElementById("browse-list");
  const emptyText = document.getElementById("browse-empty");
  const searchInput = document.getElementById("search-input");
  const categoryButtons = document.querySelectorAll(".category-btn");

  if (!listContainer || !searchInput) return; // not on this page

  let activeCategory = "All";

  function renderFiltered() {
    let filtered = [...allListings];

    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (l) =>
          (l.category || "").toLowerCase() === activeCategory.toLowerCase()
      );
    }

    const term = searchInput.value.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (l) =>
          (l.title || "").toLowerCase().includes(term) ||
          (l.category || "").toLowerCase().includes(term) ||
          (l.location || "").toLowerCase().includes(term)
      );
    }

    listContainer.innerHTML = "";
    if (!filtered.length) {
      emptyText.classList.remove("hidden");
      return;
    }
    emptyText.classList.add("hidden");
    filtered.forEach((listing) => {
      const card = createListingCard(listing);
      listContainer.appendChild(card);
    });
  }

  // Initial load
  loadFromCSV(() => {
    renderFiltered();
  });

  // Search handler
  searchInput.addEventListener("input", () => {
    renderFiltered();
  });

  // Category buttons
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;

      categoryButtons.forEach((b) =>
        b.classList.remove("bg-blue-600", "text-white")
      );
      categoryButtons.forEach((b) =>
        b.classList.add("bg-gray-200", "text-black")
      );

      btn.classList.remove("bg-gray-200", "text-black");
      btn.classList.add("bg-blue-600", "text-white");

      renderFiltered();
    });
  });
}

// INIT on every page
document.addEventListener("DOMContentLoaded", () => {
  initDashboardPage();
  initBrowsePage();
});
