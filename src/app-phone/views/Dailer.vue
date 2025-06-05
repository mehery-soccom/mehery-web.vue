<script setup>
import { ref } from "vue";

const phone = ref("");

const addDigit = (digit) => {
  phone.value = `${phone.value}${digit}`;
};

onMounted(() => {
  console.log("Dailer mounted");
});
</script>

<template>
  <VRow>
    <VCol cols="12" md="6">
      <AppTextField v-model="phone" label="" />
    </VCol>

    <VCol cols="12" md="6">
      <div class="dialer-container">
        <div class="keypad">
          <div class="keypad-row">
            <button class="key-button" @click="addDigit('1')">1</button>
            <button class="key-button" @click="addDigit('2')">2</button>
            <button class="key-button" @click="addDigit('3')">3</button>
          </div>

          <div class="keypad-row">
            <button class="key-button" @click="addDigit('4')">4</button>
            <button class="key-button" @click="addDigit('5')">5</button>
            <button class="key-button" @click="addDigit('6')">6</button>
          </div>

          <div class="keypad-row">
            <button class="key-button" @click="addDigit('7')">7</button>
            <button class="key-button" @click="addDigit('8')">8</button>
            <button class="key-button" @click="addDigit('9')">9</button>
          </div>

          <div class="keypad-row">
            <button class="key-button" @click="addDigit('+')">+</button>
            <button class="key-button" @click="addDigit('0')">0</button>
            <button class="key-button backspace" @click="removeDigit">⌫</button>
          </div>
        </div>
      </div>
    </VCol>
  </VRow>
</template>

<style>
.dialer-container {
  max-width: 320px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.keypad {
  margin-bottom: 20px;
}

.keypad-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.key-button {
  width: 90px;
  height: 60px;
  border: none;
  border-radius: 10px;
  background: #fff;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.key-button:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.key-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.key-button:disabled {
  background: #e0e0e0;
  color: #999;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.backspace {
  background: #ffebee !important;
  color: #d32f2f !important;
}

.backspace:hover:not(:disabled) {
  background: #ffcdd2 !important;
}
</style>
