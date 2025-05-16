<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="form-container">
      <div class="field">
        <label>Type:</label>
        <div class="button-group">
          <button
            type="button"
            :class="{ active: type === 'Information' }"
            @click="type = 'Information'"
          >
            Information
          </button>
          <button
            type="button"
            :class="{ active: type === 'Guide' }"
            @click="type = 'Guide'"
          >
            Guide
          </button>
        </div>
      </div>

      <div class="field">
        <label>Category:</label>
        <input type="text" v-model="category" required />
      </div>

      <div class="field">
        <label>Title:</label>
        <input type="text" v-model="title" required />
      </div>

      <button type="submit">Create</button>
    </form>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="clearError" class="clear-error-button">X</button>
    </div>
    <div v-if="isLoading" class="">
      <p>Loading ...</p>
    </div>
    <!-- Knowledgebases Table -->
    <table class="kb-table" v-if="knowledgebases.length > 0">
      <thead>
        <tr>
          <th>Type</th>
          <th>Category</th>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="kb in knowledgebases" :key="kb._id">
          <td>{{ kb.type }}</td>
          <td>{{ kb.category }}</td>
          <td>{{ kb.title }}</td>
          <td>
            <button @click="deleteKB(kb._id)">Delete</button>
            <button
              @click="
                loadPages(kb._id, kb.title, kb.code, kb.category, kb.type)
              "
            >
              Load Pages
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Page Form -->
    <form
      @submit.prevent="submitPage"
      class="form-container"
      v-if="iskbselected"
    >
      <h3>Add Page for Knowledge base: {{ selectedKbTitle }}</h3>
      <div class="field">
        <label>Title:</label>
        <input type="text" v-model="pageTitle" required />
      </div>

      <div class="field">
        <label>Document (max 2000 characters):</label>
        <textarea
          v-model="document"
          maxlength="2000"
          rows="5"
          required
        ></textarea>
        <small>{{ document.length }} / 2000</small>
      </div>

      <button type="submit">Add Page</button>
    </form>

    <!-- Pages Table -->
    <table class="kb-table" v-if="pages.length > 0">
      <thead>
        <tr>
          <th>Title</th>
          <th>Content</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pg in pages" :key="pg._id">
          <td>{{ pg.title }}</td>
          <td>{{ pg.content }}</td>
          <td>
            <button @click="openEditModal(pg)">Edit</button>
            <button @click="deletePage(pg._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Edit Modal -->
    <div class="modal-backdrop" v-if="showModal">
      <div class="modal">
        <h3>Edit Page</h3>
        <div class="field">
          <label>Title:</label>
          <input v-model="editPage.title" type="text" />
        </div>
        <div class="field">
          <label>Content (max 2000 chars):</label>
          <textarea
            v-model="editPage.content"
            maxlength="2000"
            rows="5"
          ></textarea>
          <small>{{ editPage.content.length }} / 2000</small>
        </div>
        <div class="modal-actions">
          <button @click="submitEdit">Update</button>
          <button @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isThisSecond } from "date-fns";

export default {
  data() {
    return {
      tenantPartitionKey: "kedar",
      type: "",
      category: "",
      title: "",
      pageTitle: "",
      document: "",
      error: null,
      isLoading: false,
      knowledgebases: [],
      pages: [],
      parentId: null,
      parentCode: null,
      parentCategory: null,
      parentType: null,
      selectedKbTitle: "",
      iskbselected: false,
      editedPages: [],
      showModal: false,
      editPage: {
        _id: "",
        title: "",
        content: "",
      },
    };
  },
  computed: {
    hasChanges() {
      return Object.keys(this.changedRecords).length > 0;
    },
  },
  methods: {
    openEditModal(pg) {
      this.editPage = { ...pg }; // clone to avoid in-place mutation
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.editPage = { _id: "", title: "", content: "" };
    },
    async submitEdit() {
      const { _id, title, content } = this.editPage;

      if (!title.trim() || !content.trim()) {
        alert("Both title and content are required.");
        return;
      }

      if (content.length > 2000) {
        alert("Content exceeds 2000 character limit.");
        return;
      }

      const updatedDoc = { _id, title: title.trim(), content: content.trim() };
      const payload = { 
        kb_id: this.parentId, 
        code : this.parentCode,
        type : this.parentType,
        category : this.parentCategory,
        updateDocs: [updatedDoc] 
      };
      console.log(`Updated doc to send: ${JSON.stringify(payload)}`);
      this.isLoading = true;
      this.error = null;
      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/pages",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
            body: JSON.stringify(payload),
          }
        );
        const data = await response.json();
        if (!data.success) {
          this.error = data.message;
        } else {
          console.log(`updated : ${JSON.stringify(data)}`);
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.pages = [];
        this.fetchPages();
        this.isLoading = false;
        this.closeModal();
      }
    },
    async deletePage(id) {
      this.isLoading = true;
      this.error = null;
      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/pages",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
            body: JSON.stringify({
              kb_id: this.parentId,
              del_ids: [id],
            }),
          }
        );
        const data = await response.json();
        if (!data.success) {
          this.error = data.message;
        } else {
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.pages = [];
        this.fetchPages();
        this.isLoading = false;
      }
    },
    async deleteKB(id) {
      // this.knowledgebases = this.knowledgebases.filter((kb) => kb._id !== id);
    },
    async submitPage() {
      if (!this.pageTitle || !this.document.trim()) {
        alert("All fields are required.");
        return;
      }
      this.isLoading = true;
      this.error = null; // Clear previous errors

      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/pages",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
            body: JSON.stringify({
              // type: this.type,
              // category: this.category.trim(),
              // title: this.title.trim(),
              kb_id: this.parentId,
              code: this.parentCode,
              category: this.parentCategory,
              type: this.parentType,
              docs: [{ title: this.pageTitle, document: this.document }],
            }),
          }
        );
        const data = await response.json();
        if (!data.success) {
          this.error = data.message;
        } else {
          this.pages = [];
          this.fetchPages();
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPages() {
      this.isLoading = true;
      this.error = null;
      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          `http://localhost:8090/nexus/notebook/article/api/pages/mongodb?page=1&pageSize=100&kb_id=${this.parentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
          }
        );
        const pages = await response.json();
        // console.log(`pages : ${JSON.stringify(pages)}`);
        if (!pages.success) {
          this.error = data.message;
        } else {
          this.pages = pages.data;
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.isLoading = false;
      }
    },
    async loadPages(id, title, code, category, type) {
      this.parentId = id;
      this.parentCode = code;
      this.parentCategory = category;
      this.parentType = type;
      this.iskbselected = true;
      this.selectedKbTitle = title;
      console.log(`Load pages for knowledgebase ID: ${id}`);
      this.fetchPages();
      // You can implement the actual logic here
    },
    async submitForm() {
      if (!this.type || !this.category.trim() || !this.title.trim()) {
        alert("All fields are required.");
        return;
      }
      this.isLoading = true;
      this.error = null; // Clear previous errors

      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/kb",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
            body: JSON.stringify({
              type: this.type,
              category: this.category.trim(),
              title: this.title.trim(),
            }),
          }
        );
        const data = await response.json();
        if (!data.success) {
          this.error = data.message;
        } else {
          this.resetState();
          this.knowledgebases = [];
          this.fetchknowledgebases();
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.isLoading = false;
      }
    },
    resetState() {
      this.type = "";
      this.category = "";
      this.title = "";
      this.error = null;
    },
    async fetchknowledgebases() {
      this.isLoading = true;
      this.error = null; // Clear previous errors

      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/kb",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
          }
        );
        const data = await response.json();
        // console.log(`knowledgebases : ${JSON.stringify(data)}`);
        if (!data.success) {
          this.error = data.message;
        } else {
          this.knowledgebases = data.result;
          this.resetState();
        }
      } catch (err) {
        this.handleApiError(err);
      } finally {
        this.isLoading = false;
      }
    },
    handleApiError(err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("API Error Response:", err.response);
        switch (err.response.status) {
          case 400:
            this.error =
              "Bad Request: Please check your input. " +
              (err.response.data.message || "");
            break;
          case 401:
            this.error =
              "Unauthorized: You need to be logged in to perform this action.";
            // Potentially redirect to login or show login modal
            break;
          case 403:
            this.error =
              "Forbidden: You don't have permission to access this resource.";
            break;
          case 404:
            this.error =
              "Not Found: The requested resource could not be found.";
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            this.error =
              "Server Error: We are experiencing issues on our end. Please try again later.";
            break;
          default:
            this.error = `An unexpected error occurred: ${
              err.response.status
            } - ${err.response.statusText || "Unknown Error"}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        // `err.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error("API No Response:", err.request);
        this.error =
          "Network Error: Could not connect to the server. Please check your internet connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("API Request Setup Error:", err.message);
        this.error = `An error occurred: ${err.message}`;
      }
    },
    clearError() {
      this.error = null;
    },
  },
  mounted() {
    this.fetchknowledgebases();
  },
};
</script>

<style scoped>
.form-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.field {
  margin-bottom: 1rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: 1px solid #aaa;
  background: #f9f9f9;
  cursor: pointer;
}

button.active {
  background-color: #007bff;
  color: white;
}

input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.error-message {
  background-color: #ffebee; /* Light red */
  color: #c62828; /* Dark red */
  border: 1px solid #ef9a9a; /* Lighter red border */
  padding: 15px;
  margin-top: 15px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message p {
  margin: 0;
}

.clear-error-button {
  background: none;
  border: none;
  color: #c62828;
  font-weight: bold;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 5px;
}
.kb-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.kb-table th,
.kb-table td {
  padding: 0.5rem;
  border: 1px solid #ddd;
  text-align: left;
}
.kb-table input,
.kb-table textarea {
  width: 100%;
  border: 1px solid #ccc;
  padding: 4px;
  box-sizing: border-box;
}
</style>
