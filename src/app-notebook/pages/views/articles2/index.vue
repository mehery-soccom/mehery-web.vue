<template>
  <v-responsive class="border rounded">
    <v-app>
      <!-- <v-app-bar title="App bar"></v-app-bar> -->

      <!-- <v-navigation-drawer> -->
        <v-list v-for="kb in knowledgebases" :key="kb._id">
            <!-- <v-list-item title="My Knowledgebases"></v-list-item>
            <v-divider></v-divider> -->
            <v-list-item :title="kb.title" @click="loadPages(kb._id, kb.title, kb.code, kb.category, kb.type)"></v-list-item>
            <v-btn @click="deleteKB(kb._id)">Delete</v-btn>
            <v-divider></v-divider>
        </v-list>
      <!-- </v-navigation-drawer> -->

      <!-- <v-main>
        <v-container>
          <h1>Main Content</h1>
        </v-container>
      </v-main> -->
    </v-app>
  </v-responsive>
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
  mounted() {
    this.fetchknowledgebases();
  },
  methods: {
    resetKb(){
      this.parentId= null;
      this.parentCode= null;
      this.parentCategory= null;
      this.parentType= null;
      this.selectedKbTitle= "";
      this.iskbselected= false;
      this.knowledgebases = [];
      this.fetchknowledgebases();
    },
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
      this.isLoading = true;
      this.error = null;
      try {
        // Simulate an API call - replace with your actual API endpoint
        const response = await fetch(
          "http://localhost:8090/nexus/notebook/article/api/kb",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              tnt: this.tenantPartitionKey,
            },
            body: JSON.stringify({
              kb_id: id
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
        this.resetKb();
        this.isLoading = false;
      }
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
      if (!this.type || !this.category.trim()) {
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
              title: this.title.trim() || null,
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

</style>