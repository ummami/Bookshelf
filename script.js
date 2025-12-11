
let library = [];
let selectedBook = null;
let chosenRating = 0;
let currentShelf = 'all';
let previousView = 'home';
const STORAGE_KEY = "bookshelfLibraryV1";

function loadLibraryFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      library = parsed;
    }
  } catch (err) {
    console.error("Error loading library from storage", err);
  }
}

function saveLibraryToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (err) {
    console.error("Error saving library to storage", err);
  }
}

const trendingBooks = [
  { title: "Dune", authors: ["Frank Herbert"], rating: 0, cover: "https://covers.openlibrary.org/b/isbn/0441172717-M.jpg" },
  { title: "The Alchemist", authors: ["Paulo Coelho"], rating: 0, cover: "https://covers.openlibrary.org/b/isbn/0062315005-M.jpg" },
  { title: "1984", authors: ["George Orwell"], rating: 0, cover: "https://covers.openlibrary.org/b/isbn/9780452284234-M.jpg" },
  { title: "To Kill a Mockingbird", authors: ["Harper Lee"], rating: 0, cover: "https://covers.openlibrary.org/b/isbn/0060935464-M.jpg" },
  { title: "The Great Gatsby", authors: ["F. Scott Fitzgerald"], rating: 0, cover: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg" }
];


const homeView = document.getElementById("homeView");
const searchView = document.getElementById("searchView");
const libraryView = document.getElementById("libraryView");
const detailView = document.getElementById("detailView");
const detailContent = document.getElementById("detailContent");
const backFromDetailBtn = document.getElementById("backFromDetail");
const trendingGrid = document.getElementById("trendingGrid");
const recentGrid = document.getElementById("recentGrid");
const libraryGrid = document.getElementById("libraryGrid");
const searchGrid = document.getElementById("searchGrid");
const searchInput = document.getElementById("searchInput");
const ratingModalBackdrop = document.getElementById("ratingModalBackdrop");
const shelfModalBackdrop = document.getElementById("shelfModalBackdrop");
const ratingModalTitle = document.getElementById("ratingModalTitle");
const shelfModalTitle = document.getElementById("shelfModalTitle");
const homeNavBtn = document.getElementById("homeNav");
const libraryNavBtn = document.getElementById("libraryNav");
const libraryEmpty = document.getElementById("libraryEmpty");
const libraryStats = document.getElementById("libraryStats");
const libraryStatsText = document.getElementById("libraryStatsText");
const reviewModalBackdrop = document.getElementById("reviewModalBackdrop");
const reviewModalTitle = document.getElementById("reviewModalTitle");
const reviewTextarea = document.getElementById("reviewTextarea");
const saveReviewButton = document.getElementById("saveReviewButton");
const cancelReviewButton = document.getElementById("cancelReviewButton");


function initEventListeners() {
  homeNavBtn.addEventListener("click", () => showView("home"));
  libraryNavBtn.addEventListener("click", () => showView("library"));
  backFromDetailBtn.addEventListener("click", () => showView(previousView));
   document.querySelector(".logo").addEventListener("click", () => showView("home"));

  document.getElementById("searchButton").addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      runSearch(query);
      showView("search");
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        runSearch(query);
        showView("search");
      }
    }
  });


  document.querySelectorAll("#shelfModalBackdrop .modal-btn[data-shelf]").forEach(btn => {
    btn.addEventListener("click", () => {
      const shelf = btn.dataset.shelf;
      addToLibrary(selectedBook, shelf);
      shelfModalBackdrop.classList.add("hidden");
    });
  });

  document.getElementById("cancelShelfButton").addEventListener("click", () => {
    shelfModalBackdrop.classList.add("hidden");
  });

  shelfModalBackdrop.addEventListener("click", (e) => {
    if (e.target === shelfModalBackdrop) {
      shelfModalBackdrop.classList.add("hidden");
    }
  });

  
  document.querySelectorAll(".modal-star-button").forEach(btn => {
    btn.addEventListener("click", () => {
      chosenRating = parseInt(btn.dataset.star);
      updateStars(chosenRating);
    });
  });

  document.getElementById("saveRatingButton").addEventListener("click", () => {
  if (chosenRating > 0) {
    const book = library.find((b) => b.title === selectedBook);
    if (book) {
      book.rating = chosenRating;
      saveLibraryToStorage();   
    }
    alert(`Rated "${selectedBook}" ${chosenRating} stars!`);
    loadHomePage();
    renderLibrary();
    showBookDetail(
      selectedBook.replace(/'/g, "\\'").replace(/"/g, "&quot;")
    );
  }
  ratingModalBackdrop.classList.add("hidden");
});


  document.getElementById("cancelRatingButton").addEventListener("click", () => {
    ratingModalBackdrop.classList.add("hidden");
  });

  ratingModalBackdrop.addEventListener("click", (e) => {
    if (e.target === ratingModalBackdrop) {
      ratingModalBackdrop.classList.add("hidden");
    }
  });

  
saveReviewButton.addEventListener("click", () => {
  const text = reviewTextarea.value.trim();
  const book = library.find((b) => b.title === selectedBook);
  if (book && text) {
    book.review = text;
    saveLibraryToStorage();     
    alert(`Saved your review for "${selectedBook}".`);
    loadHomePage();
    renderLibrary();
    showBookDetail(
      selectedBook.replace(/'/g, "\\'").replace(/"/g, "&quot;")
    );
  }
  reviewModalBackdrop.classList.add("hidden");
});


  cancelReviewButton.addEventListener("click", () => {
    reviewModalBackdrop.classList.add("hidden");
  });

  reviewModalBackdrop.addEventListener("click", (e) => {
    if (e.target === reviewModalBackdrop) {
      reviewModalBackdrop.classList.add("hidden");
    }
  });


  document.querySelectorAll(".shelf-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".shelf-filter").forEach(b => 
        b.classList.remove("shelf-filter-active")
      );
      btn.classList.add("shelf-filter-active");
      currentShelf = btn.dataset.shelf;
      renderLibrary();
    });
  });
}

function showView(view) {
  homeView.classList.add("hidden");
  searchView.classList.add("hidden");
  libraryView.classList.add("hidden");
  detailView.classList.add("hidden");
  homeNavBtn.classList.remove("nav-link-active");
  libraryNavBtn.classList.remove("nav-link-active");

  if (view === "home") {
    homeView.classList.remove("hidden");
    homeNavBtn.classList.add("nav-link-active");
    loadHomePage();
    previousView = "home";
  } else if (view === "search") {
    searchView.classList.remove("hidden");
    previousView = "search";
  } else if (view === "library") {
    libraryView.classList.remove("hidden");
    libraryNavBtn.classList.add("nav-link-active");
    renderLibrary();
    previousView = "library";
  } else if (view === "detail") {
    detailView.classList.remove("hidden");
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function makeCard(book, showShelfButtons = false) {
  const safeTitle = book.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");

  let ratingBadge = "";
  if (typeof book.rating === "number" && book.rating > 0) {
    const ratingDisplay = Number.isInteger(book.rating)
      ? book.rating.toString()
      : book.rating.toFixed(1);
    ratingBadge = `<div class="book-card-meta">★ ${ratingDisplay} / 5</div>`;
  }

  let reviewBadge = "";
  if (book.review) {
    const fullReview = book.review.trim();
    const truncated =
      fullReview.length > 90 ? fullReview.slice(0, 90) + "..." : fullReview;

    const fullEscaped = escapeHtml(fullReview);
    const shortEscaped = escapeHtml(truncated);

    reviewBadge = `
      <div class="book-card-meta book-card-meta-muted">
        <span
          class="review-text"
          data-full="${fullEscaped}"
        >
          ${shortEscaped}
        </span>
      </div>
    `;
  }

  let buttons = '';
  if (showShelfButtons && book.shelf) {
    buttons = `
      <button class="btn btn-rating" onclick="openRatingModal('${safeTitle}')">Rate</button>
      <button class="btn btn-want" onclick="openReviewModal('${safeTitle}')">Review</button>
      <button class="btn btn-secondary" onclick="removeFromLibrary('${safeTitle}')">Remove</button>
    `;
  } else {
  buttons = `
    <button class="btn btn-finished" onclick="openShelfModal('${safeTitle}')">Add to Shelf</button>
    <button class="btn btn-rating" onclick="openRatingModal('${safeTitle}')">Rate</button>
    <button class="btn btn-want" onclick="openReviewModal('${safeTitle}')">Review</button>
  `;
}

  
  return `
  <div class="book-card">
    <div class="book-card-image-wrapper">
      <img
        src="${book.cover}"
        class="book-card-image"
        alt="${book.title}"
        onclick="showBookDetail('${safeTitle}')"
      />
      <div class="book-card-overlay">
        <div class="book-card-actions">
          ${buttons}
        </div>
      </div>
    </div>
    <div class="book-card-body">
      <div class="book-card-title" onclick="showBookDetail('${safeTitle}')">${book.title}</div>
      <div class="book-card-authors">${(book.authors || []).join(", ")}</div>
      ${ratingBadge}
      ${reviewBadge}
    </div>
  </div>
`;
}

function loadHomePage() {
  trendingGrid.innerHTML = trendingBooks.map(b => makeCard(b, false)).join("");
  
  const recent = library.slice(0, 6);
  if (recent.length > 0) {
    document.getElementById("recentContainer").classList.remove("hidden");
    recentGrid.innerHTML = recent.map(b => makeCard(b, true)).join("");
  } else {
    document.getElementById("recentContainer").classList.add("hidden");
  }
}

async function runSearch(query) {
  searchGrid.innerHTML = '<div class="loading">Searching...</div>';
  
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`);
    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      searchGrid.innerHTML = "<div class='empty-state'><p class='empty-text'>No results found.</p></div>";
      return;
    }

    const books = data.docs.map(doc => ({
      title: doc.title,
      authors: doc.author_name || ["Unknown Author"],
      cover: doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : 'https://via.placeholder.com/180x270/1a0f32/c084fc?text=No+Cover',
      rating: 0
    }));

    searchGrid.innerHTML = books.map(b => makeCard(b, false)).join("");
  } catch (error) {
    searchGrid.innerHTML = "<div class='empty-state'><p class='empty-text'>Error searching. Please try again.</p></div>";
    console.error('Search error:', error);
  }
}


window.openShelfModal = function(title) {
  const unescapedTitle = title.replace(/\\'/g, "'");
  selectedBook = unescapedTitle;
  shelfModalTitle.textContent = unescapedTitle;
  shelfModalBackdrop.classList.remove("hidden");
};

window.openRatingModal = function(title) {
  const unescapedTitle = title.replace(/\\'/g, "'");
  selectedBook = unescapedTitle;
  ratingModalTitle.textContent = unescapedTitle;
  chosenRating = 0;
  updateStars(0);
  ratingModalBackdrop.classList.remove("hidden");
};

window.openReviewModal = function(title) {
  const unescapedTitle = title.replace(/\\'/g, "'");
  selectedBook = unescapedTitle;
  reviewModalTitle.textContent = unescapedTitle;

  const existing = library.find(b => b.title === unescapedTitle);
  reviewTextarea.value = existing && existing.review ? existing.review : "";

  reviewModalBackdrop.classList.remove("hidden");
};

window.removeFromLibrary = function (title) {
  const unescapedTitle = title.replace(/\\'/g, "'");
  library = library.filter((b) => b.title !== unescapedTitle);
  alert(`"${unescapedTitle}" removed from library!`);
  saveLibraryToStorage();       
  loadHomePage();
  renderLibrary();
};


window.showBookDetail = function(title) {
  const unescapedTitle = title.replace(/\\'/g, "'");
  
  let book = library.find(b => b.title === unescapedTitle);
  
  if (!book) {
    book = trendingBooks.find(b => b.title === unescapedTitle);
  }
  
  if (!book) {
    const allCards = document.querySelectorAll('.book-card-title');
    allCards.forEach(card => {
      if (card.textContent === unescapedTitle) {
        const cardEl = card.closest('.book-card');
        const img = cardEl.querySelector('.book-card-image');
        const authors = cardEl.querySelector('.book-card-authors');
        book = {
          title: unescapedTitle,
          authors: [authors.textContent],
          cover: img.src,
          rating: 0
        };
      }
    });
  }
  
  if (!book) return;

  const isInLibrary = library.some(b => b.title === unescapedTitle);
  const safeTitle = book.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
  
  let ratingSection = '';
  if (book.rating && book.rating > 0) {
    const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
    ratingSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Your Rating</h3>
        <div class="detail-rating-display">${stars} ${book.rating}/5</div>
        <button class="btn btn-rating" onclick="openRatingModal('${safeTitle}')">Change Rating</button>
      </div>
    `;
  } else {
    ratingSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Your Rating</h3>
        <p class="detail-review-text" style="margin-bottom: 1rem;">You haven't rated this book yet.</p>
        <button class="btn btn-rating" onclick="openRatingModal('${safeTitle}')">Rate This Book</button>
      </div>
    `;
  }

  let reviewSection = '';
  if (book.review) {
    reviewSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Your Review</h3>
        <div class="detail-review-text">${escapeHtml(book.review)}</div>
        <button class="btn btn-want" onclick="openReviewModal('${safeTitle}')">Edit Review</button>
      </div>
    `;
  } else {
    reviewSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Your Review</h3>
        <p class="detail-review-text" style="margin-bottom: 1rem;">You haven't written a review yet.</p>
        <button class="btn btn-want" onclick="openReviewModal('${safeTitle}')">Write Review</button>
      </div>
    `;
  }

  let shelfSection = '';
  if (isInLibrary && book.shelf) {
    const shelfNames = {
      finished: 'Finished',
      reading: 'Reading',
      wantToRead: 'Want to Read'
    };
    shelfSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Shelf Status</h3>
        <div class="detail-shelf-status">${shelfNames[book.shelf]}</div>
        <div style="margin-top: 1rem;">
          <button class="btn btn-secondary" onclick="openShelfModal('${safeTitle}')">Change Shelf</button>
          <button class="btn btn-secondary" onclick="removeFromLibrary('${safeTitle}'); showView('${previousView}')">Remove from Library</button>
        </div>
      </div>
    `;
  } else {
    shelfSection = `
      <div class="detail-section">
        <h3 class="detail-section-title">Add to Library</h3>
        <p class="detail-review-text" style="margin-bottom: 1rem;">This book is not in your library yet.</p>
        <button class="btn btn-finished" onclick="openShelfModal('${safeTitle}')">Add to Shelf</button>
      </div>
    `;
  }

  detailContent.innerHTML = `
    <div class="detail-container">
      <div>
        <img src="${book.cover}" class="detail-cover" alt="${book.title}" />
      </div>
      <div class="detail-info">
        <div>
          <h2 class="detail-title">${book.title}</h2>
          <p class="detail-authors">by ${(book.authors || []).join(", ")}</p>
        </div>
        ${shelfSection}
        ${ratingSection}
        ${reviewSection}
      </div>
    </div>
  `;

  showView("detail");
};

function addToLibrary(title, shelf) {
  const unescapedTitle =
    typeof title === "string" ? title.replace(/\\'/g, "'") : title;

  let book = trendingBooks.find((b) => b.title === unescapedTitle);

  if (!book) {
    const allCards = document.querySelectorAll(".book-card-title");
    allCards.forEach((card) => {
      if (card.textContent === unescapedTitle) {
        const cardEl = card.closest(".book-card");
        const img = cardEl.querySelector(".book-card-image");
        const authors = cardEl.querySelector(".book-card-authors");
        book = {
          title: unescapedTitle,
          authors: [authors.textContent],
          cover: img.src,
          rating: 0,
        };
      }
    });
  }

  if (!book) return;

  const existingBook = library.find((b) => b.title === unescapedTitle);
  if (existingBook) {
    existingBook.shelf = shelf;
    alert(`"${book.title}" moved to ${shelf}!`);
  } else {
    library.unshift({ ...book, shelf });
    alert(`"${book.title}" added to ${shelf}!`);
  }

  saveLibraryToStorage();   
  loadHomePage();
  renderLibrary();

  
  if (!detailView.classList.contains("hidden")) {
    const safeTitle = unescapedTitle
      .replace(/'/g, "\\'")
      .replace(/"/g, "&quot;");
    showBookDetail(safeTitle);
  }
}

function updateLibraryStats() {
  if (!libraryStats || !libraryStatsText) return;

  if (library.length === 0) {
    libraryStats.classList.add("hidden");
    return;
  }

  const total = library.length;
  const finished = library.filter(b => b.shelf === "finished").length;
  const reading = library.filter(b => b.shelf === "reading").length;
  const want = library.filter(b => b.shelf === "wantToRead").length;
  const ratedBooks = library.filter(b => typeof b.rating === "number" && b.rating > 0);
  const avgRatingVal = ratedBooks.length
    ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
    : "N/A";

  libraryStatsText.textContent =
    `Total: ${total} • Finished: ${finished} • Reading: ${reading} • Want to Read: ${want} • Avg Rating: ${avgRatingVal}`;
  libraryStats.classList.remove("hidden");
}

function renderLibrary() {
  let booksToShow = library;
  
  if (currentShelf !== 'all') {
    booksToShow = library.filter(b => b.shelf === currentShelf);
  }

  if (booksToShow.length === 0) {
    libraryEmpty.classList.remove("hidden");
    libraryGrid.innerHTML = "";
  } else {
    libraryEmpty.classList.add("hidden");
    libraryGrid.innerHTML = booksToShow.map(b => makeCard(b, true)).join("");
  }

  updateLibraryStats();
}

function updateStars(rating) {
  const starButtons = document.querySelectorAll(".modal-star-button");
  starButtons.forEach((btn, idx) => {
    const star = btn.querySelector(".star-icon-large");
    if (idx < rating) {
      star.classList.add("star-icon-filled");
    } else {
      star.classList.remove("star-icon-filled");
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  loadLibraryFromStorage();   
  initEventListeners();     
  loadHomePage();             
  renderLibrary();           
});
