<template>
  <q-page class="row items-start justify-evenly">
    <div class="column col">
      <div ref="refsEditorWrap" class="element"></div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  components: { },
  setup() {
    let refsEditorWrap = ref<Element|undefined>(undefined)
    let editor : Editor | null = null;

    onMounted(() => {
      editor = new Editor({
        element: refsEditorWrap?.value,
        extensions: [StarterKit],
        content: '<p>Hello World!</p>'
      })
    })

    return {
      editor,
      refsEditorWrap
    };
  }
});
</script>
