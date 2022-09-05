const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const DELETED_EVENT = "deleted-book";
const STORAGE_KEY = "MY_BOOKSHELF_APP";
const modal = document.querySelector("#modal");
const deleteButton = document.getElementById("confirm-delete");
const closeModal = document.getElementById("cancel-delete");
const books = [];

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung web storage");
    return false;
  }
  return true;
};

document.addEventListener(RENDER_EVENT, () => {
  const uncompletedBook = document.getElementById("uncompleted");
  uncompletedBook.innerHTML = "";

  const completedBook = document.getElementById("iscompleted");
  completedBook.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBookElement(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBook.append(bookElement);
    } else {
      completedBook.append(bookElement);
    }
  }
});

document.addEventListener(DELETED_EVENT, () => {
  const deletedCustomAlert = document.createElement("div");
  deletedCustomAlert.classList.add("alert");
  deletedCustomAlert.innerText = "Berhasil Dihapus!";

  document.body.insertBefore(deletedCustomAlert, document.body.children[0]);
  setTimeout(() => {
    deletedCustomAlert.remove();
  }, 2000);
});

const loadDataFromStorage = () => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (data !== null) {
    for (const item of data) {
      books.push(item);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const addBook = () => {
  const bookTitle = document.getElementById("title");
  const bookAuthor = document.getElementById("author");
  const bookYear = document.getElementById("year");
  const bookHasCompleted = document.getElementById("is-read");
  let bookStatus;

  if (bookHasCompleted.checked) {
    bookStatus = true;
  } else {
    bookStatus = false;
  }

  books.push({
    id: +new Date(),
    title: bookTitle.value,
    author: bookAuthor.value,
    year: Number(bookYear.value),
    isComplete: bookStatus,
  });

  bookTitle.value = null;
  bookAuthor.value = null;
  bookYear.value = null;
  bookHasCompleted.checked = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

//delete modal
deleteButton.addEventListener("click", () => {
  modal.style.transition = "1s";
  modal.classList.remove("modal-open");
});

//close modal
closeModal.addEventListener("click", () => {
  modal.style.transition = "1s";
  modal.classList.remove("modal-open");
});

const makeBookElement = (bookObject) => {
  const bookTitleComponent = document.createElement("p");
  bookTitleComponent.classList.add("item-title");
  bookTitleComponent.innerHTML = `${bookObject.title} <span>(${bookObject.year})</span>`;

  const bookAuthorComponent = document.createElement("p");
  bookAuthorComponent.classList.add("item-writer");
  bookAuthorComponent.innerText = bookObject.author;

  const descContainer = document.createElement("div");
  descContainer.classList.add("item-desc");
  descContainer.append(bookTitleComponent, bookAuthorComponent);

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("item-action");

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(descContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    const returnButton = document.createElement("button");
    returnButton.classList.add("return-btn");
    returnButton.innerHTML = `<i class="ri-refresh-line"></i>`;

    returnButton.addEventListener("click", () => {
      returnBookFromCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-btn");
    trashButton.innerHTML = `<i class="ri-delete-bin-line"></i>`;

    trashButton.addEventListener("click", () => {
      modal.classList.toggle("modal-open");

      deleteButton.addEventListener("click", () => {
        deleteBook(bookObject.id);
        modal.style.transition = "1s";
        modal.classList.remove("modal-open");
      });
    });

    actionContainer.append(returnButton, trashButton);
    container.append(actionContainer);
  } else {
    const completedBotton = document.createElement("button");
    completedBotton.classList.add("completed-btn");
    completedBotton.innerHTML = `<i class="ri-check-line"></i>`;

    completedBotton.addEventListener("click", () => {
      addBookToCompleted(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-btn");
    trashButton.innerHTML = `<i class="ri-delete-bin-line"></i>`;

    trashButton.addEventListener("click", () => {
      modal.classList.toggle("modal-open");

      deleteButton.addEventListener("click", () => {
        deleteBook(bookObject.id);
        modal.style.transition = "1s";
        modal.classList.remove("modal-open");
      });
    });

    actionContainer.append(completedBotton, trashButton);
    container.append(actionContainer);
  }

  return container;
};

const addBookToCompleted = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const returnBookFromCompleted = (bookId) => {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const deleteBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
};

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const simpanForm = document.getElementById("formAddBook");
  simpanForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("formSearch");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });

});

const searchBook = () => {
  const searchInput = document.getElementById("search").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
    const itemTitle = bookItems[i].querySelector(".item-title");
    if (itemTitle.textContent.toLowerCase().includes(searchInput)) {
      bookItems[i].classList.remove("hidden");
    } else {
      bookItems[i].classList.add("hidden");
    }
  }
};
