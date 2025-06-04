<!-- src/components/QAPairsTable.vue -->
<script setup>
import { ref, reactive, computed, watch, nextTick } from "vue";
import { VDataTable } from "vuetify/labs/VDataTable";
import * as XLSX from "xlsx";
import zipcelx from "zipcelx";
const qaTableItemsPerPage = 25;
const qaTableHeaders = [
        { text: 'Question', value: 'question' },
  { text: 'Answer', value: 'answer' }
      ]
const selectedItems = ref([]);
// Reactive data
const qaData = ref([]);
const cachedPages = ref({}); // Cache for page data: { pageNum: [...data] }
const lastSeenIds = ref({}); // Cache for lastSeenIds: { pageNum: lastSeenId }
const selectedIdsByPage = ref({}); // Track selections by page: { pageNum: [...selectedIds] }
const editedItems = ref({}); // Track edited items: { itemId: { question: '...', answer: '...' } }
const editingContent = reactive({
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
const previewHeaders = ref([
  {
    align: "start",
    key: "que",
    sortable: false,
    title: "Question",
  },
  { title: "Answer", key: "ans" },
]);
const previewPage = ref(1);
const previewItemsPerPage = ref(5);
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
      // tempTenantKey.value = ""
      tempKbId.value = "";
      tempTopicId.value = "";
      selectedTopicId.value = null;
      selectedTopicName.value = "";
      qaData.value = [];
      cachedPages.value = {};
      lastSeenIds.value = {};
      selectedIdsByPage.value = {};
      editedItems.value = {};
      Object.assign(editingContent, {
        itemId: null,
        field: null,
        text: "",
        originalText: "",
      });
      // Reset data states
      // resetState()

      // // Fetch first page of data
      // fetchData(1)
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
  Object.assign(editingContent, {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  });
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
  Object.assign(editingContent, {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  });
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
  previewPage.value = 1;
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
    showStatus("Failed to load knowledge bases: " + error.message, "error");
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
    console.log(`qaData : `,qaData.value);
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
    allSelectedIds = [...allSelectedIds, ...selectedIdsByPage.value[pageNum]];
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
    showStatus(`Successfully deleted ${selectedIds.length} item(s)`, "success");

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
  Object.assign(editingContent, {
    itemId: itemId,
    field: field,
    text: item[field],
    originalText: item[field],
  });

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
  if (editingContent.itemId !== itemId || editingContent.field !== field) {
    return;
  }

  const newText = editingContent.text.trim();
  const originalText = editingContent.originalText.trim();

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
  Object.assign(editingContent, {
    itemId: null,
    field: null,
    text: "",
    originalText: "",
  });
};

// Check if we're currently editing a specific cell
const isEditingCell = (itemId, field) => {
  return editingContent.itemId === itemId && editingContent.field === field;
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
// Update qaData whenever the page changes
watch(
  currentPage,
  (newPage) => {
    if (tenantPartitionKey.value && selectedKbId.value) {
      loadPageData(newPage);
    }
  },
  { immediate: true }
);

// Fetch knowledge bases when tenant key is set
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
const previewPageCount = computed(() => {
  return Math.ceil(ques.value.length / previewItemsPerPage.value);
});
</script>
<template>
  <div class="qa-table-container">
    <h1 class="title">FQA's</h1>
    <!-- Selection Status Messages -->
    <div
      v-if="!tenantPartitionKey || !selectedKbId || !selectedTopicId"
      class="selection-status"
    >
      <div v-if="!tenantPartitionKey" class="status-alert">
        Tenant is not selected
      </div>
      <div v-else-if="!selectedKbId" class="status-alert">
        Knowledge base is not selected
      </div>
      <div v-else-if="!selectedTopicId" class="status-alert">
        Topic is not selected
      </div>
    </div>

    <!-- Tenant and KB Display & Change Option -->
    <div class="selection-info" v-if="tenantPartitionKey">
      <div class="current-selections">
        <div class="selection-item">
          <span
            >Current Tenant: <strong>{{ tenantPartitionKey }}</strong></span
          >
        </div>
        <!-- <div class="selection-item">
          <span
            >Knowledge Base: <strong>{{ selectedKbName }}</strong></span
          >
        </div>
        <div class="selection-item">
          <span
            >Topic: <strong>{{ selectedTopicName }}</strong></span
          >
        </div> -->
        <div class="selection-form-container" v-if="tenantPartitionKey">
          <form @submit.prevent="submitSelections" class="selection-form">
            <div
              class="form-group"
              v-if="tenantPartitionKey && knowledgeBases.length > 0"
            >
              <label for="kbSelection">Knowledge Base:</label>
              <p v-if="selectedKbId">
                Selected Knowledge base : {{ selectedKbName }}
              </p>
              <select
                id="kbSelection"
                v-model="tempKbId"
                required
                class="form-input"
              >
                <option value="" disabled>Select a knowledge base</option>
                <option
                  v-for="kb in knowledgeBases"
                  :key="kb._id"
                  :value="kb._id"
                >
                  {{ kb.kb_name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid"
            >
              Select Knowledge Base
            </button>
          </form>
        </div>
        <div class="selection-form-container" v-if="selectedKbId">
          <form @submit.prevent="submitSelections" class="selection-form">
            <div class="form-group" v-if="selectedKbId && topics.length > 0">
              <label for="topicSelection">Select Topic:</label>
              <p v-if="selectedTopicId">
                Selected Topic : {{ selectedTopicName }}
              </p>
              <select
                id="topicSelection"
                v-model="tempTopicId"
                required
                class="form-input"
              >
                <option value="" disabled>
                  Select a Topic from knowledge base
                </option>
                <option v-for="tp in topics" :key="tp._id" :value="tp._id">
                  {{ tp.topic_name }}
                </option>
              </select>
            </div>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!isFormValid"
            >
              Select Topic
            </button>
          </form>
        </div>
        <!-- <button @click="changeSelections" class="btn btn-secondary">
          Change Selections
        </button> -->
      </div>

      <div class="data-controls">
        <button
          v-if="selectedKbId && selectedTopicId"
          @click="refreshData"
          class="btn btn-primary"
        >
          Refresh Data
        </button>
        <button
          v-if="selectedKbId && selectedTopicId"
          @click="updateEditedItems"
          class="btn btn-success"
          :disabled="getEditedCount() === 0"
        >
          Update {{ getEditedCount() }} Edited Item(s)
        </button>
        <!-- <span v-if="Object.keys(cachedPages).length > 0" class="cache-info">
          {{ getCacheStatus() }}
        </span> -->
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
        <button
          @click="downloadTemplate"
          class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg border"
        >
          Download Sample Template
        </button>
      </div>

      <!-- Upload Excel File -->
      <div class="mb-6">
        <label class="block text-sm font-medium mb-2"
          >Upload Excel File :
        </label>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileUpload"
          accept=".xlsx,.xls"
          class="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <!-- Validation Messages -->
      <div v-if="validationMessage" class="mb-4">
        <div
          :class="{
            'bg-green-100 border-green-400 text-green-700': isValidFile,
            'bg-red-100 border-red-400 text-red-700': !isValidFile,
          }"
          class="border px-4 py-3 rounded"
        >
          {{ validationMessage }}
        </div>
      </div>

      <!-- Preview of Questions and Answers -->
      <div v-if="ques.length > 0" class="mb-6">
        <h3 class="text-lg font-semibold mb-3">
          Preview ({{ ques.length }} items)
        </h3>
        <div class="max-h-60 overflow-y-auto border rounded-lg">
          <!-- <table class="w-full">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th
                  class="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  Question
                </th>
                <th
                  class="px-4 py-2 text-left text-sm font-medium text-gray-700"
                >
                  Answer
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in ques" :key="index" class="border-t">
                <td class="px-4 py-2 text-sm">{{ item.que }}</td>
                <td class="px-4 py-2 text-sm">{{ item.ans }}</td>
              </tr>
            </tbody>
          </table> -->
          <VDataTable
            v-model:page="previewPage"
            :headers="previewHeaders"
            :items="ques"
            :items-per-page="previewItemsPerPage"
          >
            <template v-slot:top>
              <v-text-field
                :model-value="previewItemsPerPage"
                class="pa-2"
                label="Items per page"
                min="-1"
                type="number"
                hide-details
                @update:model-value="previewItemsPerPage = parseInt($event, 10)"
              ></v-text-field>
            </template>

            <template v-slot:bottom>
              <div class="text-center pt-2">
                <VPagination
                  v-model="previewPage"
                  :length="previewPageCount"
                ></VPagination>
              </div>
            </template>
          </VDataTable>
        </div>
      </div>

      <!-- Save Button -->
      <div class="mb-6" v-if="ques.length > 0">
        <button
          @click="saveToBackend"
          :class="{
            'bg-green-500 hover:bg-green-600': ques.length > 0 && !isSaving,
            'bg-gray-400 cursor-not-allowed': ques.length === 0 || isSaving,
          }"
          class="px-4 py-2 rounded-lg border"
        >
          {{ isSaving ? "Saving..." : "Save" }}
        </button>
      </div>

      <!-- Save Status -->
      <div v-if="saveMessage" class="mb-4">
        <div
          :class="{
            'bg-green-100 border-green-400 text-green-700': saveSuccess,
            'bg-red-100 border-red-400 text-red-700': !saveSuccess,
          }"
          class="border px-4 py-3 rounded"
        >
          {{ saveMessage }}
        </div>
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
        <button
          @click="confirmDeleteSelected"
          class="btn btn-danger"
          :disabled="getSelectedCount() === 0"
        >
          Delete Selected
        </button>
        <button @click="showDelKbModal" class="btn btn-danger">
          Delete Entire Knowledge base
        </button>
        <button @click="toggleSelectAll" class="btn btn-secondary">
          {{ allSelected ? "Unselect All" : "Select All" }}
        </button>
      </div>
    </div>

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
        <span class="data-info"
          >Showing {{ qaData.length }} of {{ totalItems }} items</span
        >
      </div>

      <div class="table-responsive">
        <!-- <table class="qa-table">
          <thead>
            <tr>
              <th class="checkbox-col">
                <input
                  type="checkbox"
                  id="selectAll"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="checkbox"
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
                <input
                  type="checkbox"
                  :id="`item-${item._id}`"
                  :value="item._id"
                  v-model="selectedIdsByPage[currentPage]"
                  class="checkbox"
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
                  <textarea
                    v-model="editingContent.text"
                    class="edit-input"
                    @blur="finishEditing(item._id, 'question')"
                    @keydown.enter.prevent="finishEditing(item._id, 'question')"
                    ref="editTextarea"
                  ></textarea>
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
                  <textarea
                    v-model="editingContent.text"
                    class="edit-input"
                    @blur="finishEditing(item._id, 'answer')"
                    @keydown.enter.prevent="finishEditing(item._id, 'answer')"
                    ref="editTextarea"
                  ></textarea>
                </div>
                <div v-else>{{ item.answer }}</div>
              </td>
            </tr>
          </tbody>
        </table> -->
        <VDataTable
          v-model="selectedItems"
          :headers="qaTableHeaders"
          :items="qaData"
          :items-per-page="qaTableItemsPerPage"
          :page="currentPage"
          show-select
          item-value="_id"
          class="qa-table"
        >
          <!-- Custom header for select all -->
          <template v-slot:header.data-table-select="{ props, on }">
            <v-checkbox
              v-bind="props"
              v-on="on"
              :indeterminate="someSelected && !allSelected"
              :input-value="allSelected"
              @change="toggleSelectAll"
            ></v-checkbox>
          </template>

          <!-- Custom item select -->
          <template
            v-slot:item.data-table-select="{ item, isSelected, select }"
          >
            <v-checkbox
              :input-value="isSelected"
              @change="select($event)"
            ></v-checkbox>
          </template>

          <!-- Question column with inline editing -->
          <template v-slot:item.question="{ item }">
            <div
              @click="startEditing(item._id, 'question')"
              :class="{ editing: isEditingCell(item._id, 'question') }"
              class="editable-cell"
            >
              <div
                v-if="isEditingCell(item._id, 'question')"
                class="edit-container"
              >
                <v-textarea
                  v-model="editingContent.text"
                  auto-grow
                  rows="1"
                  dense
                  outlined
                  @blur="finishEditing(item._id, 'question')"
                  @keydown.enter.prevent="finishEditing(item._id, 'question')"
                  ref="editTextarea"
                  class="edit-input"
                ></v-textarea>
              </div>
              <div v-else>{{ item.question }}</div>
            </div>
          </template>

          <!-- Answer column with inline editing -->
          <template v-slot:item.answer="{ item }">
            <div
              @click="startEditing(item._id, 'answer')"
              :class="{ editing: isEditingCell(item._id, 'answer') }"
              class="editable-cell"
            >
              <div
                v-if="isEditingCell(item._id, 'answer')"
                class="edit-container"
              >
                <v-textarea
                  v-model="editingContent.text"
                  auto-grow
                  rows="1"
                  dense
                  outlined
                  @blur="finishEditing(item._id, 'answer')"
                  @keydown.enter.prevent="finishEditing(item._id, 'answer')"
                  ref="editTextarea"
                  class="edit-input"
                ></v-textarea>
              </div>
              <div v-else>{{ item.answer }}</div>
            </div>
          </template>

          <!-- Custom row styling for edited items -->
          <template v-slot:item="{ item, props }">
            <tr :class="{ 'edited-row': isItemEdited(item._id) }">
              <td v-for="(header, index) in qaTableHeaders" :key="qaTableHeaders.value">
                <slot
                  :name="`item.${header.value}`"
                  :item="item"
                  :header="header"
                  :props="props"
                >
                  {{ item[header.value] }}
                </slot>
              </td>
            </tr>
          </template>

          <!-- Custom footer for pagination info -->
          <template v-slot:footer>
            <div class="pagination">
              <div class="pagination-info">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <div class="pagination-controls">
                <v-btn
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="btn-pagination"
                  outlined
                  small
                >
                  <v-icon left>mdi-chevron-left</v-icon>
                  Previous
                </v-btn>
                <v-btn
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="btn-pagination"
                  outlined
                  small
                >
                  Next
                  <v-icon right>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>
          </template>
        </VDataTable>
      </div>

      <!-- <div class="pagination">
        <div class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }}
        </div>
        <div class="pagination-controls">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="btn btn-pagination"
          >
            <span>←</span> Previous
          </button>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="btn btn-pagination"
          >
            Next <span>→</span>
          </button>
        </div>
      </div> -->
    </div>

    <!-- No Data Message -->
    <div
      v-if="
        !loading && tenantPartitionKey && selectedKbId && qaData.length === 0
      "
      class="no-data"
    >
      <p>
        No QA pairs data available. Please check your selections and try again.
      </p>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>
          Are you sure you want to delete {{ getSelectedCount() }} selected
          item(s)?
        </p>
        <p class="delete-warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteSelected" class="btn btn-danger">Delete</button>
          <button @click="cancelDelete" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Knowledgebase Confirmation Modal -->
    <div v-if="showKbDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirm Delete</h3>
        <p>
          Are you sure you want to delete entirity of
          {{ this.selectedKbName }} Knowlwdgebase
        </p>
        <p class="delete-warning">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="deleteKnowledgeBase" class="btn btn-danger">
            Delete
          </button>
          <button @click="cancelDeleteKb" class="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div
      v-if="statusMessage"
      :class="['status-message', 'status-' + statusType]"
    >
      {{ statusMessage }}
      <button @click="clearStatus" class="status-close">&times;</button>
    </div>
  </div>
</template>

<style lang="scss">
.qa-table-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  color: #333;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 28px;
  margin-bottom: 24px;
  color: #2c3e50;
  text-align: center;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 16px;
}

/* Selection Form Styles */
.selection-form-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selection-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
}

.form-input {
  color: black;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  outline: none;
}

/* Selection Status */
.selection-status {
  max-width: 500px;
  margin: 40px auto;
  text-align: center;
}

.status-alert {
  padding: 16px;
  background-color: #f8d7da;
  color: #721c24;
  border-radius: 6px;
  margin-bottom: 12px;
  border-left: 4px solid #dc3545;
}

/* Button Styles */
.btn {
  padding: 10px 18px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #e9ecef;
  color: #495057;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #dee2e6;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-success {
  background-color: #2ecc71;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #27ae60;
}

.btn-pagination {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
  padding: 8px 14px;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #e9ecef;
}

/* Selection Info Styles */
.selection-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3498db;
}

.current-selections {
  display: flex;
  align-items: center;
  gap: 20px;
}

.selection-item {
  margin-right: 16px;
}

.data-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cache-info {
  font-size: 14px;
  color: #6c757d;
  background-color: #e9ecef;
  padding: 4px 10px;
  border-radius: 12px;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.bulk-actions {
  display: flex;
  gap: 10px;
}

/* Loading Styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Table Styles */
.table-wrapper {
  margin-top: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-header h2 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
}

.data-info {
  color: #6c757d;
  font-size: 14px;
}

.table-responsive {
  overflow-x: auto;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.qa-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 6px;
  overflow: hidden;
}

.qa-table th,
.qa-table td {
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.qa-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 1;
}

.checkbox-col {
  width: 50px;
  text-align: center;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.qa-table th:nth-child(2) {
  width: 40%;
}

.qa-table tr:last-child td {
  border-bottom: none;
}

.qa-table tr:hover {
  background-color: #f8f9fa;
}

.qa-table tr.edited-row {
  background-color: #d4edff;
}

.qa-table tr.edited-row:hover {
  background-color: #c2e5ff;
}

.qa-table td {
  position: relative;
  cursor: pointer;
}

.qa-table td.editing {
  padding: 0;
  cursor: auto;
}

.edit-container {
  height: 100%;
  width: 100%;
}

.edit-input {
  width: 100%;
  height: 100%;
  min-height: 100px;
  padding: 12px;
  border: 2px solid #3498db;
  resize: vertical;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 8px;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  color: #6c757d;
}

.pagination-controls {
  display: flex;
  gap: 12px;
}

/* No Data Message */
.no-data {
  text-align: center;
  padding: 40px 0;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-top: 24px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #2c3e50;
}

.delete-warning {
  color: #e74c3c;
  font-weight: 500;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

/* Status Message */
.status-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  max-width: 500px;
  z-index: 90;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.status-info {
  background-color: #3498db;
  color: white;
}

.status-success {
  background-color: #2ecc71;
  color: white;
}

.status-error {
  background-color: #e74c3c;
  color: white;
}

.status-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 0 0 0 10px;
  margin-left: 10px;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .qa-table-container {
    padding: 15px;
  }

  .title {
    font-size: 24px;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }

  .tenant-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .current-tenant {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .data-controls {
    width: 100%;
    justify-content: space-between;
  }

  .actions-bar {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .bulk-actions {
    width: 100%;
    justify-content: space-between;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .qa-table th,
  .qa-table td {
    padding: 12px 8px;
    font-size: 14px;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .pagination-controls {
    width: 100%;
    justify-content: space-between;
  }

  .status-message {
    min-width: auto;
    max-width: 90%;
    left: 5%;
    right: 5%;
  }

  .form-input,
  .btn {
    font-size: 14px;
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .qa-table-container {
    padding: 10px;
  }

  .title {
    font-size: 20px;
  }

  .checkbox-col {
    width: 30px;
  }

  .checkbox {
    width: 16px;
    height: 16px;
  }

  .qa-table th,
  .qa-table td {
    padding: 10px 6px;
    font-size: 13px;
  }

  .btn {
    padding: 8px 12px;
    font-size: 13px;
  }

  .tenant-form-container {
    padding: 15px;
  }

  .modal-content {
    padding: 16px;
  }
  .excel-qa-manager {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      sans-serif;
  }
}
</style>
