<template>
  <q-page class="row items-center justify-evenly">
    <text-editor-component></text-editor-component>
  </q-page>
</template>

<script lang="ts">
import Vue from 'vue';
import TextEditorComponent from 'components/TextEditorComponent.vue';

export default Vue.extend({
  name: 'PageIndex',
  components: { TextEditorComponent },
  data() {
    return {};
  }
});
</script>
