<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import * as XLSX from "xlsx";
import zipcelx from "zipcelx";
import PreviewDataTable from "../../../views/dashboards/analytics/PreviewDataTable.vue";
import { VDataTable } from "vuetify/labs/VDataTable";

// Reactive data
const headers = ref([
  {
    title: "Question",
    key: "que",
    align: "start",
  },
  {
    title: "Answer",
    key: "ans",
    align: "start",
  },
]);

const qaData = ref([]);
const cachedPages = ref({}); // Cache for page data: { pageNum: [...data] }
const lastSeenIds = ref({}); // Cache for lastSeenIds: { pageNum: lastSeenId }
const selectedIdsByPage = ref({}); // Track selections by page: { pageNum: [...selectedIds] }
const editedItems = ref({}); // Track edited items: { itemId: { question: '...', answer: '...' } }
const editingContent = ref({
  itemId: null,
  field: null,
  text: "",
  originalText: "",
});

const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(0);
const totalItems = ref(0);
const pageSize = ref(25);
const knowledgeBases = ref([]); // List of knowledge bases
const topics = ref([]);
const tenantPartitionKey = ref("kedar");
const tempTenantKey = ref("");
const selectedKbId = ref(null); // Selected knowledge base ID
const selectedKbName = ref(""); // Selected knowledge base name
const tempKbId = ref(""); // Temporary KB ID for form
const showDeleteModal = ref(false);
const showKbDeleteModal = ref(false);
const statusMessage = ref("");
const statusType = ref("info"); // 'info', 'success', 'error'
const statusTimeout = ref(null);
const cacheTimestamp = ref(null); // When the cache was last refreshed
const tempTopicId = ref("");
const selectedTopicId = ref(null);
const selectedTopicName = ref("");
const ques = ref([]);
const validationMessage = ref("");
const isValidFile = ref(false);
const saveMessage = ref("");
const saveSuccess = ref(false);
const isSaving = ref(false);

// Template refs
const editTextarea = ref(null);

// Computed properties
const allSelected = computed(() => {
  return (
    qaData.value.length > 0 &&
    selectedIdsByPage.value[currentPage.value] &&
    selectedIdsByPage.value[currentPage.value].length === qaData.value.length
  );
});

const isFormValid = computed(() => {
  return (
    // tempTenantKey.value.trim() &&
    !tenantPartitionKey.value || // No tenant set yet, so only validate tenant field
    (knowledgeBases.value.length > 0 && tempKbId.value) || // Tenant set, so validate KB selection
    (topics.value.length > 0 && tempTopicId.value)
  );
});

// Methods
const itemKb = (item) => {
  return {
    title: item.kb_name,
    value: item._id,
  };
};

const itemTopic = (item) => {
  return {
    title: item.topic_name,
    value: item._id,
  };
};

const submitSelections = () => {
  if (!tenantPartitionKey.value && tempTenantKey.value.trim()) {
    tenantPartitionKey.value = tempTenantKey.value.trim();
    // Don't reset tempTenantKey yet as we need it for the next step
  }

  if (tenantPartitionKey.value && tempKbId.value) {
    // Find the KB name for the selected ID
    const selectedKb = knowledgeBases.value.find(
      (kb) => kb._id === tempKbId.value
    );
    if (selectedKb) {
      selectedKbId.value = tempKbId.value;
      selectedKbName.value = selectedKb.kb_name;

      // Reset temporary values
      // tempTenantKey.value = "";
      tempKbId.value = "";
      tempTopicId.value = "";
      selectedTopicId.value = null;
      selectedTopicName.value = "";
      qaData.value = [];
      cachedPages.value = {};
      lastSeenIds.value = {};
      selectedIdsByPage.value = {};
      editedItems.value = {};
      editingContent.value = {
        itemId: null,
        field: null,
        text: "",
        originalText: "",
      };
      // Reset data states
      // resetState();

      // // Fetch first page of data
      // fetchData(1);
    }
  }

  if (selectedKbId.value && tempTopicId.value) {
    const selectedTopic = topics.value.find(
      (tp) => tp._id === tempTopicId.value
    );

    if (selectedTopic) {
      selectedTopicId.value = tempTopicId.value;
      selectedTopicName.value = selectedTopic.topic_name;

      tempTopicId.value = "";
      resetState();
      fetchData(1);
    }
  }
};

const changeSelections = () => {
  selectedKbId.value = null;
  selectedKbName.value = "";
  selectedTopicId.value = null;
  selectedTopicName.value = "";
  resetState();
};

const resetStateComplete = () => {
  qaData.value = [];
  cachedPages.value = {};
  lastSeenIds.value = {};
  selectedIdsByPage.value = {};
  editedItems.value = {};
  editingContent.value = {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  };
  knowledgeBases.value = [];
  topics.value = [];
  currentPage.value = 1;
  totalPages.value = 0;
  totalItems.value = 0;
  cacheTimestamp.value = null;
  selectedKbId.value = null;
  tenantPartitionKey.value = null;
  selectedKbName.value = "";
  tempTopicId.value = "";
  selectedTopicId.value = null;
  selectedTopicName.value = "";
  ques.value = [];
  validationMessage.value = "";
  isValidFile.value = false;
  saveMessage.value = "";
  saveSuccess.value = false;
  isSaving.value = false;
};

const resetState = () => {
  qaData.value = [];
  cachedPages.value = {};
  lastSeenIds.value = {};
  selectedIdsByPage.value = {};
  editedItems.value = {};
  editingContent.value = {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  };
  currentPage.value = 1;
  totalPages.value = 0;
  totalItems.value = 0;
  cacheTimestamp.value = null;
  ques.value = [];
  validationMessage.value = "";
  isValidFile.value = false;
  saveMessage.value = "";
  saveSuccess.value = false;
  isSaving.value = false;
};

const downloadTemplate = () => {
  // Create sample data for the template
  const sampleData = [
    [
      { type: "string", value: "Question" },
      { type: "string", value: "Answer" },
    ],
    [
      { type: "string", value: "What is Vue.js?" },
      {
        type: "string",
        value:
          "Vue.js is a progressive JavaScript framework for building user interfaces.",
      },
    ],
    [
      { type: "string", value: "What is Excel?" },
      {
        type: "string",
        value: "Excel is a spreadsheet application developed by Microsoft.",
      },
    ],
    [
      { type: "string", value: "Sample Question 3" },
      { type: "string", value: "Sample Answer 3" },
    ],
  ];

  // Use zipcelx to create and download the Excel file
  const config = {
    filename: "qa_template",
    sheet: {
      data: sampleData,
    },
  };

  zipcelx(config);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    resetValidation();
    return;
  }

  validateAndParseFile(file);
};

const validateAndParseFile = (file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Validate the file format
      if (!validateFileFormat(jsonData)) {
        return;
      }

      // Parse the data
      parseQuestionsAndAnswers(jsonData);
    } catch (error) {
      validationMessage.value = "Error reading file: " + error.message;
      isValidFile.value = false;
      ques.value = [];
    }
  };

  reader.readAsArrayBuffer(file);
};

const validateFileFormat = (data) => {
  // Check if file has data
  if (!data || data.length < 2) {
    validationMessage.value =
      "File must contain at least a header row and one data row.";
    isValidFile.value = false;
    ques.value = [];
    return false;
  }

  // Check if header row exists and has correct columns
  const headers = data[0];
  if (!headers || headers.length < 2) {
    validationMessage.value = "File must have at least 2 columns.";
    isValidFile.value = false;
    ques.value = [];
    return false;
  }

  // Check if headers match expected format (case-insensitive)
  const expectedHeaders = ["question", "answer"];
  const actualHeaders = headers
    .slice(0, 2)
    .map((h) => (h || "").toString().toLowerCase().trim());

  const headersMatch = expectedHeaders.every(
    (expected, index) => actualHeaders[index] === expected
  );

  if (!headersMatch) {
    validationMessage.value = `Headers must be "Question" and "Answer". Found: "${headers[0]}" and "${headers[1]}"`;
    isValidFile.value = false;
    ques.value = [];
    return false;
  }

  return true;
};

const parseQuestionsAndAnswers = (data) => {
  const parsedQues = [];

  // Skip header row (index 0) and process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Skip empty rows
    if (!row || row.length === 0 || (!row[0] && !row[1])) {
      continue;
    }

    const question = (row[0] || "").toString().trim();
    const answer = (row[1] || "").toString().trim();

    // Only add rows that have both question and answer
    if (question && answer) {
      parsedQues.push({
        que: question,
        ans: answer,
      });
    }
  }

  if (parsedQues.length === 0) {
    validationMessage.value =
      "No valid question-answer pairs found. Make sure both columns have data.";
    isValidFile.value = false;
    ques.value = [];
    return;
  }

  ques.value = parsedQues;
  validationMessage.value = `Successfully loaded ${parsedQues.length} question-answer pairs.`;
  isValidFile.value = true;

  // Clear any previous save messages
  saveMessage.value = "";
};

const resetValidation = () => {
  ques.value = [];
  validationMessage.value = "";
  isValidFile.value = false;
  saveMessage.value = "";
};

const saveToBackend = async () => {
  if (ques.value.length === 0) return;

  isSaving.value = true;
  saveMessage.value = "";

  try {
    const payload = {
      kb_id: selectedKbId.value,
      topic_id: selectedTopicId.value,
      ques: ques.value.map((pair) => ({
        que: pair.que.trim(),
        ans: pair.ans.trim(),
      })),
    };
    // Replace this URL with your actual backend endpoint
    const response = await fetch(
      "http://localhost:8090/nexus/notebook/api/qapairs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          tnt: tenantPartitionKey.value,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      saveMessage.value = `Successfully saved ${ques.value.length} question-answer pairs to the backend.`;
      saveSuccess.value = true;
      loading.value = true;
      refreshData();
      loading.value = false;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    saveMessage.value = `Error saving to backend: ${error.message}`;
    saveSuccess.value = false;
  } finally {
    isSaving.value = false;
  }
};

const fetchTopics = async () => {
  if (!selectedKbId.value) return;
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:8090/nexus/notebook/api/qapairs/topic?isDetailed=false&kb_id=${selectedKbId.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          tnt: tenantPartitionKey.value,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    topics.value = data.result || [];
    console.log(topics.value);

    if (topics.value.length === 0) {
      showStatus("No knowledge bases found for this tenant", "info");
    }
  } catch (error) {
    console.error("Error fetching topics:", error);
    showStatus("Failed to load topics: " + error.message, "error");
    knowledgeBases.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchKnowledgeBases = async () => {
  if (!tenantPartitionKey.value) return;

  loading.value = true;

  try {
    const response = await fetch(
      "http://localhost:8090/nexus/notebook/api/qapairs/kb?isDetailed=false",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          tnt: tenantPartitionKey.value,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    knowledgeBases.value = data.result || [];

    if (knowledgeBases.value.length === 0) {
      showStatus("No knowledge bases found for this tenant", "info");
    }
  } catch (error) {
    console.error("Error fetching knowledge bases:", error);
    showStatus(
      "Failed to load knowledge bases: " + error.message,
      "error"
    );
    knowledgeBases.value = [];
  } finally {
    loading.value = false;
  }
};

// Load data from cache or fetch from server
const loadPageData = async (pageNum) => {
  if (!tenantPartitionKey.value || !selectedKbId.value) return;

  // If page exists in cache, use it
  if (cachedPages.value[pageNum]) {
    qaData.value = cachedPages.value[pageNum];
    // Initialize selection array for this page if needed
    if (!selectedIdsByPage.value[pageNum]) {
      selectedIdsByPage.value[pageNum] = [];
    }
    return;
  }

  // Otherwise, fetch from server
  await fetchData(pageNum);
};

// Refresh all data (clear cache and fetch first page)
const refreshData = () => {
  resetState();
  fetchData(1);
  showStatus("Data refreshed", "success");
};

const fetchData = async (pageNum) => {
  if (!tenantPartitionKey.value || !selectedKbId.value) return;

  loading.value = true;

  try {
    let url = `http://localhost:8090/nexus/notebook/api/qapairs/mongodb?page=${pageNum}&pageSize=${pageSize.value}&kb_id=${selectedKbId.value}&topic_id=${selectedTopicId.value}`;

    // Add lastSeenId parameter for pages beyond the first page
    if (pageNum > 1 && lastSeenIds.value[pageNum - 1]) {
      url += `&lastSeenId=${lastSeenIds.value[pageNum - 1]}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        tnt: tenantPartitionKey.value,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();

    // Update the current data
    qaData.value = data.data;
    totalPages.value = parseInt(data.totalPages);
    totalItems.value = parseInt(data.total);

    // Cache the retrieved data
    cachedPages.value[pageNum] = data.data;

    // Initialize selection array for this page if needed
    if (!selectedIdsByPage.value[pageNum]) {
      selectedIdsByPage.value[pageNum] = [];
    }

    // Update the lastSeenId for pagination
    if (qaData.value.length > 0) {
      lastSeenIds.value[pageNum] = qaData.value[qaData.value.length - 1]._id;
    }

    // Update cache timestamp
    cacheTimestamp.value = new Date();
  } catch (error) {
    console.error("Error fetching QA pairs:", error);
    qaData.value = [];
    showStatus("Failed to load data: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const toggleSelectAll = () => {
  if (!selectedIdsByPage.value[currentPage.value]) {
    selectedIdsByPage.value[currentPage.value] = [];
  }

  if (allSelected.value) {
    selectedIdsByPage.value[currentPage.value] = [];
  } else {
    selectedIdsByPage.value[currentPage.value] = qaData.value.map(
      (item) => item._id
    );
  }
};

const showDelKbModal = () => {
  showKbDeleteModal.value = true;
};

const confirmDeleteSelected = () => {
  if (getSelectedCount() > 0) {
    showDeleteModal.value = true;
  }
};

const cancelDeleteKb = () => {
  showKbDeleteModal.value = false;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
};

// Get all selected IDs across all pages
const getAllSelectedIds = () => {
  let allSelectedIds = [];
  for (const pageNum in selectedIdsByPage.value) {
    allSelectedIds = [
      ...allSelectedIds,
      ...selectedIdsByPage.value[pageNum],
    ];
  }
  return allSelectedIds;
};

// Get total count of selected items
const getSelectedCount = () => {
  return getAllSelectedIds().length;
};

const deleteKnowledgeBase = async () => {
  showDelKbModal.value = false;
  loading.value = true;
  try {
    const response = await fetch(
      "http://localhost:8090/nexus/notebook/api/qapairs/kb",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          tnt: tenantPartitionKey.value,
        },
        body: JSON.stringify({
          kb_id: selectedKbId.value,
          kb_name: selectedKbName.value,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`response del: ${JSON.stringify(data)}`);

    // Show success message
    showStatus(
      `Successfully deleted ${selectedKbName.value} knowledge base`,
      "success"
    );

    // Clear cache and reload data
    resetStateComplete();
  } catch (error) {
    console.error("Error deleting records:", error);
    showStatus("Failed to delete records: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const deleteSelected = async () => {
  showDeleteModal.value = false;
  loading.value = true;
  const selectedIds = getAllSelectedIds();

  try {
    const url = `http://localhost:8090/nexus/notebook/api/qapairs`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        tnt: tenantPartitionKey.value,
      },
      body: JSON.stringify({
        kb_id: selectedKbId.value,
        topic_id: selectedTopicId.value,
        del_ids: selectedIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`response del: ${JSON.stringify(data)}`);

    // Show success message
    showStatus(
      `Successfully deleted ${selectedIds.length} item(s)`,
      "success"
    );

    // Clear cache and reload data
    resetState();
    fetchData(1);
  } catch (error) {
    console.error("Error deleting records:", error);
    showStatus("Failed to delete records: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const showStatus = (message, type = "info") => {
  statusMessage.value = message;
  statusType.value = type;

  // Clear any existing timeout
  if (statusTimeout.value) {
    clearTimeout(statusTimeout.value);
  }

  // Auto-clear success and info messages after 5 seconds
  if (type !== "error") {
    statusTimeout.value = setTimeout(() => {
      clearStatus();
    }, 5000);
  }
};

const clearStatus = () => {
  statusMessage.value = "";
  if (statusTimeout.value) {
    clearTimeout(statusTimeout.value);
    statusTimeout.value = null;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1;
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1;
  }
};

// Format cache status message
const getCacheStatus = () => {
  const pagesCount = Object.keys(cachedPages.value).length;
  let timeAgo = "";

  if (cacheTimestamp.value) {
    const seconds = Math.floor((new Date() - cacheTimestamp.value) / 1000);
    if (seconds < 60) {
      timeAgo = `${seconds} seconds ago`;
    } else if (seconds < 3600) {
      timeAgo = `${Math.floor(seconds / 60)} minutes ago`;
    } else {
      timeAgo = `${Math.floor(seconds / 3600)} hours ago`;
    }
  }

  return `${pagesCount} page(s) cached ${timeAgo}`;
};

// Start editing a cell
const startEditing = (itemId, field) => {
  // Get the current item from the data
  const item = qaData.value.find((item) => item._id === itemId);
  if (!item) return;

  // Set up the editing state
  editingContent.value = {
    itemId: itemId,
    field: field,
    text: item[field],
    originalText: item[field],
  };

  // Focus the textarea after Vue updates the DOM
  nextTick(() => {
    if (editTextarea.value) {
      const textarea = Array.isArray(editTextarea.value)
        ? editTextarea.value[0]
        : editTextarea.value;

      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    }
  });
};

// Complete editing and save changes
const finishEditing = (itemId, field) => {
  // Make sure we're editing this item and field
  if (
    editingContent.value.itemId !== itemId ||
    editingContent.value.field !== field
  ) {
    return;
  }

  const newText = editingContent.value.text.trim();
  const originalText = editingContent.value.originalText.trim();

  // Only update if content changed
  if (newText !== originalText) {
    // Find item in the current data and update it
    const item = qaData.value.find((item) => item._id === itemId);
    if (item) {
      item[field] = newText;

      // Update the item in cache as well
      Object.values(cachedPages.value).forEach((pageData) => {
        const cachedItem = pageData.find((i) => i._id === itemId);
        if (cachedItem) {
          cachedItem[field] = newText;
        }
      });

      // Track this item as edited
      if (!editedItems.value[itemId]) {
        editedItems.value[itemId] = {
          _id: itemId,
          question: item.question,
          answer: item.answer,
          kb_id: selectedKbId.value, // Add the KB ID for the update API
        };
      } else {
        editedItems.value[itemId][field] = newText;
      }
    }
  }

  // Clear editing state
  editingContent.value = {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  };
};

// Check if we're currently editing a specific cell
const isEditingCell = (itemId, field) => {
  return (
    editingContent.value.itemId === itemId &&
    editingContent.value.field === field
  );
};

// Check if an item has been edited
const isItemEdited = (itemId) => {
  return !!editedItems.value[itemId];
};

// Get count of edited items
const getEditedCount = () => {
  return Object.keys(editedItems.value).length;
};

// Send all edited items to the update API
const updateEditedItems = async () => {
  if (getEditedCount() === 0) return;

  loading.value = true;
  const editedItemsArray = Object.values(editedItems.value);

  try {
    const response = await fetch(
      "http://localhost:8090/nexus/notebook/api/qapairs",
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          tnt: tenantPartitionKey.value,
        },
        body: JSON.stringify({
          kb_id: selectedKbId.value,
          topic_id: selectedTopicId.value,
          updateDocs: editedItemsArray,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Update response: ${JSON.stringify(data)}`);

    // Show success message
    showStatus(
      `Successfully updated ${editedItemsArray.length} item(s)`,
      "success"
    );

    // Clear edited items after successful update
    editedItems.value = {};
    refreshData();
  } catch (error) {
    console.error("Error updating records:", error);
    showStatus("Failed to update records: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(
  currentPage,
  (newPage) => {
    if (tenantPartitionKey.value && selectedKbId.value) {
      loadPageData(newPage);
    }
  },
  { immediate: true }
);

watch(
  tenantPartitionKey,
  (newValue) => {
    if (newValue) {
      fetchKnowledgeBases();
    }
  },
  { immediate: true }
);

watch(
  selectedKbId,
  (newValue) => {
    if (newValue) {
      fetchTopics();
    }
  },
  { immediate: true }
);

</script>
<template>
  <div class="qa-table-container">
    <h1 class="title">FQA's</h1>
    
    <!-- Selection Status Messages -->
    <div
      v-if="!tenantPartitionKey || !selectedKbId || !selectedTopicId"
      class="selection-status"
    >
      <v-chip v-if="!tenantPartitionKey" closable>
        Tenant is not selected
      </v-chip>
      <v-chip v-else-if="!selectedKbId" closable>
        Knowledge base is not selected
      </v-chip>
      <v-chip v-else-if="!selectedTopicId" closable>
        Topic is not selected
      </v-chip>
    </div>

    <!-- Tenant and KB Display & Change Option -->
    <div class="selection-info" v-if="tenantPartitionKey">
      <div class="current-selections">
        <div class="selection-item">
          <v-chip>Current Tenant: {{ tenantPartitionKey }}</v-chip>
        </div>
        
        <div class="selection-form-container" v-if="tenantPartitionKey">
          <form @submit.prevent="submitSelections">
            <v-select
              v-model="tempKbId"
              :item-props="itemKb"
              :items="knowledgeBases"
              label="Select"
            />
            <v-btn class="me-4" type="submit" :disabled="!isFormValid">
              Select Knowledge base
            </v-btn>
          </form>
        </div>
        
        <div class="selection-form-container" v-if="selectedKbId">
          <form @submit.prevent="submitSelections">
            <v-select
              v-model="tempTopicId"
              :item-props="itemTopic"
              :items="topics"
              label="Select"
            />
            <v-btn class="me-4" type="submit" :disabled="!isFormValid">
              Select Topic
            </v-btn>
          </form>
        </div>
      </div>

      <div class="data-controls">
        <v-btn v-if="selectedKbId && selectedTopicId" @click="refreshData">
          Refresh Data
        </v-btn>
        <v-btn
          v-if="selectedKbId && selectedTopicId"
          @click="updateEditedItems"
          :disabled="getEditedCount() === 0"
        >
          Update {{ getEditedCount() }} Edited Item(s)
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>Loading data...</p>
    </div>
    
    <div
      class="excel-qa-manager p-6 max-w-4xl mx-auto"
      v-if="selectedKbId && selectedTopicId"
    >
      <h2 class="text-2xl font-bold mb-6">Question & Answer Excel Upload</h2>

      <!-- Download Template Button -->
      <div class="mb-6">
        <v-btn @click="downloadTemplate">Download Sample Template</v-btn>
      </div>

      <!-- Upload Excel File -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2">
          Upload Excel File :
        </label>
        <v-file-input
          clearable
          label="File input"
          variant="outlined"
          @change="handleFileUpload"
          @click:clear="resetValidation"
          accept=".xlsx,.xls"
        />
      </div>

      <!-- Validation Messages -->
      <div v-if="validationMessage" class="mb-4">
        <v-alert
          :type="isValidFile ? 'success' : 'error'"
          :text="validationMessage"
          variant="tonal"
          closable
        />
      </div>

      <!-- Preview of Questions and Answers -->
      <PreviewDataTable
        :items="ques"
        :headers="headers"
        :title="`Preview (${ques.length} items)`"
      />
      
      <!-- Save Button -->
      <div class="mb-6" v-if="ques.length > 0">
        <v-btn
          @click="saveToBackend"
          :color="ques.length > 0 && !isSaving ? 'success' : 'grey'"
          :disabled="ques.length === 0 || isSaving"
          variant="elevated"
        >
          {{ isSaving ? "Saving..." : "Save" }}
        </v-btn>
      </div>

      <!-- Save Status -->
      <div v-if="saveMessage" class="mb-4">
        <v-alert
          :type="saveSuccess ? 'success' : 'error'"
          :text="saveMessage"
          variant="tonal"
          closable
        />
      </div>
    </div>

    <!-- Actions Bar - Only show when items are loaded and selections are possible -->
    <div
      v-if="
        !loading &&
        tenantPartitionKey &&
        selectedKbId &&
        selectedTopicId &&
        qaData.length > 0
      "
      class="actions-bar"
    >
      <div class="selection-info">
        <span v-if="getSelectedCount() === 0">No items selected</span>
        <span v-else>{{ getSelectedCount() }} item(s) selected</span>
      </div>
      <div class="bulk-actions">
        <v-btn
          @click="confirmDeleteSelected"
          color="error"
          :disabled="getSelectedCount() === 0"
        >
          Delete Selected
        </v-btn>
        <v-btn @click="showDelKbModal" color="error">
          Delete Entire Knowledge base
        </v-btn>
        <v-btn @click="toggleSelectAll" color="secondary">
          {{ allSelected ? "Unselect All" : "Select All" }}
        </v-btn>
      </div>
    </div>

    <!-- Data Table -->
    <!-- <div
      v-if="
        !loading &&
        tenantPartitionKey &&
        selectedKbId &&
        selectedTopicId &&
        qaData.length > 0
      "
      class="table-wrapper"
    >
      <div class="table-header">
        <h2>QA Pairs Data</h2>
        <span class="data-info">
          Showing {{ qaData.length }} of {{ totalItems }} items
        </span>
      </div>

      <div class="table-responsive">
        <v-table>
          <thead>
            <tr>
              <th class="checkbox-col">
                <v-checkbox
                  :model-value="allSelected"
                  @update:model-value="toggleSelectAll"
                  hide-details
                />
              </th>
              <th>Question</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in qaData"
              :key="item._id"
              :class="{ 'edited-row': isItemEdited(item._id) }"
            >
              <td class="checkbox-col">
                <v-checkbox
                  :model-value="selectedIdsByPage[currentPage]?.includes(item._id)"
                  @update:model-value="toggleItemSelection(item._id)"
                  hide-details
                />
              </td>
              <td
                @click="startEditing(item._id, 'question')"
                :class="{ editing: isEditingCell(item._id, 'question') }"
              >
                <div
                  v-if="isEditingCell(item._id, 'question')"
                  class="edit-container"
                >
                  <v-textarea
                    v-model="editingContent.text"
                    class="edit-input"
                    @blur="finishEditing(item._id, 'question')"
                    @keydown.enter.prevent="finishEditing(item._id, 'question')"
                    ref="editTextarea"
                    auto-grow
                    rows="2"
                    hide-details
                  />
                </div>
                <div v-else>{{ item.question }}</div>
              </td>
              <td
                @click="startEditing(item._id, 'answer')"
                :class="{ editing: isEditingCell(item._id, 'answer') }"
              >
                <div
                  v-if="isEditingCell(item._id, 'answer')"
                  class="edit-container"
                >
                  <v-textarea
                    v-model="editingContent.text"
                    class="edit-input"
                    @blur="finishEditing(item._id, 'answer')"
                    @keydown.enter.prevent="finishEditing(item._id, 'answer')"
                    ref="editTextarea"
                    auto-grow
                    rows="2"
                    hide-details
                  />
                </div>
                <div v-else>{{ item.answer }}</div>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="pagination">
        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="pagination-controls">
          <v-btn
            @click="previousPage"
            :disabled="currentPage === 1"
            prepend-icon="mdi-chevron-left"
          >
            Previous
          </v-btn>
          <v-btn
            @click="nextPage"
            :disabled="currentPage === totalPages"
            append-icon="mdi-chevron-right"
          >
            Next
          </v-btn>
        </div>
      </div>
    </div> -->
    <!-- Data Table -->
     
<!-- Data Table -->
<div
  v-if="
    !loading &&
    tenantPartitionKey &&
    selectedKbId &&
    selectedTopicId &&
    qaData.length > 0
  "
  class="table-wrapper"
>
  <div class="table-header">
    <h2>QA Pairs Data</h2>
    <span class="data-info">
      Showing {{ qaData.length }} of {{ totalItems }} items
    </span>
  </div>

  <VDataTable
    v-model:selected="selectedItems"
    :headers="headers"
    :items="qaData"
    :loading="loading"
    item-value="_id"
    select-strategy="page"
    show-select
    hover
    class="qa-data-table"
  >
    <!-- Question column with inline editing -->
    <template #item.question="{ item }">
      <div
        @click="startEditing(item._id, 'question')"
        :class="{ 
          'editing-cell': isEditingCell(item._id, 'question'),
          'edited-cell': isItemEdited(item._id)
        }"
        class="editable-cell"
      >
        <div
          v-if="isEditingCell(item._id, 'question')"
          class="edit-container"
        >
          <v-textarea
            v-model="editingContent.text"
            class="edit-input"
            @blur="finishEditing(item._id, 'question')"
            @keydown.enter.prevent="finishEditing(item._id, 'question')"
            @keydown.escape="cancelEditing"
            ref="editTextarea"
            auto-grow
            rows="2"
            hide-details
            density="compact"
            variant="outlined"
          />
        </div>
        <div v-else class="cell-content">
          {{ item.question }}
        </div>
      </div>
    </template>

    <!-- Answer column with inline editing -->
    <template #item.answer="{ item }">
      <div
        @click="startEditing(item._id, 'answer')"
        :class="{ 
          'editing-cell': isEditingCell(item._id, 'answer'),
          'edited-cell': isItemEdited(item._id)
        }"
        class="editable-cell"
      >
        <div
          v-if="isEditingCell(item._id, 'answer')"
          class="edit-container"
        >
          <v-textarea
            v-model="editingContent.text"
            class="edit-input"
            @blur="finishEditing(item._id, 'answer')"
            @keydown.enter.prevent="finishEditing(item._id, 'answer')"
            @keydown.escape="cancelEditing"
            ref="editTextarea"
            auto-grow
            rows="2"
            hide-details
            density="compact"
            variant="outlined"
          />
        </div>
        <div v-else class="cell-content">
          {{ item.answer }}
        </div>
      </div>
    </template>

    <!-- Custom loading -->
    <!-- <template #loading>
      <VSkeletonLoader type="table-row@5"></VSkeletonLoader>
    </template> -->

    <!-- Custom no data -->
    <template #no-data>
      <div class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1">mdi-database-search</v-icon>
        <div class="text-h6 mt-4 mb-2">No QA pairs found</div>
        <div class="text-body-2 text-grey">Try adjusting your filters or create new QA pairs</div>
      </div>
    </template>
  </VDataTable>

  <!-- Custom Pagination -->
  <div class="pagination-wrapper">
    <div class="pagination-info">
      <span v-if="selectedItems.length > 0" class="selection-info">
        {{ selectedItems.length }} item(s) selected
      </span>
      <span class="page-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
    </div>
    <div class="pagination-controls">
      <v-btn
        @click="previousPage"
        :disabled="currentPage === 1"
        variant="outlined"
        size="small"
        prepend-icon="mdi-chevron-left"
      >
        Previous
      </v-btn>
      <v-btn
        @click="nextPage"
        :disabled="currentPage === totalPages"
        variant="outlined"
        size="small"
        append-icon="mdi-chevron-right"
      >
        Next
      </v-btn>
    </div>
  </div>
</div>

    <!-- No Data Message -->
    <div
      v-if="
        !loading && tenantPartitionKey && selectedKbId && qaData.length === 0
      "
      class="no-data"
    >
      <v-alert type="info" text="No QA pairs data available. Please check your selections and try again." />
    </div>

    <!-- Delete Confirmation Modal -->
    <v-dialog v-model="showDeleteModal" max-width="500px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete {{ getSelectedCount() }} selected
            item(s)?
          </p>
          <p class="text-error">This action cannot be undone.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDelete" color="secondary">Cancel</v-btn>
          <v-btn @click="deleteSelected" color="error">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Knowledgebase Confirmation Modal -->
    <v-dialog v-model="showKbDeleteModal" max-width="500px">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          <p>
            Are you sure you want to delete entirety of
            {{ selectedKbName }} Knowledgebase?
          </p>
          <p class="text-error">This action cannot be undone.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelDeleteKb" color="secondary">Cancel</v-btn>
          <v-btn @click="deleteKnowledgeBase" color="error">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Messages -->
     <!-- v-model="showStatusMessage" -->
    <!-- <v-snackbar
      v-model="showStatus"
      :color="statusType"
      :timeout="statusType === 'error' ? -1 : 5000"
      
    >
      {{ statusMessage }}
      <template v-slot:actions>
        <v-btn @click="clearStatus" icon="mdi-close" />
      </template>
    </v-snackbar> -->
  </div>
</template>