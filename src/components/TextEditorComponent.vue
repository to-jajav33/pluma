<template>
  <div>

    <div class="editor">
      <editor-menu-bar class="bg-green" :editor="editor" v-slot="{ commands, isActive }">
        <div>
          <q-select
            filled
            options-sanitize
            v-model="queryEditor"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredUsersEditor"
            option-value="name"
            option-label="name"
            @filter="onFilterEditor"
            @input="onInputEditor(queryEditor, {commands})"
            style="width: 250px; padding-bottom: 32px"
            map-options
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <!-- <q-btn icon="add" label="Insert Mention" @click="onFilterEditor"> -->
          </q-btn>

          <q-btn
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
          icon="format_bold" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
          icon="format_italic" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.strike() }"
          @click="commands.strike"
          icon="strikethrough_s" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.underline() }"
          @click="commands.underline"
          icon="format_underline" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
          icon="code" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.paragraph() }"
          @click="commands.paragraph"
          icon="fas fa-paragraph" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.heading({ level: 1 }) }"
          @click="commands.heading({ level: 1 })"
        >
          H1
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.heading({ level: 2 }) }"
          @click="commands.heading({ level: 2 })"
        >
          H2
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="commands.heading({ level: 3 })"
        >
          H3
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.bullet_list() }"
          @click="commands.bullet_list"
          icon="format_list_bullet" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.ordered_list() }"
          @click="commands.ordered_list"
          icon="format_list_numbered" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.blockquote() }"
          @click="commands.blockquote"
          icon="format_quote" >
        </q-btn>

        <q-btn
          :class="{ 'is-active': isActive.code_block() }"
          @click="commands.code_block"
          icon="settings_ethernet" >
        </q-btn>

        <q-btn
          @click="commands.horizontal_rule"
          label="hr" >
        </q-btn>

        <q-btn
          @click="commands.undo"
          icon="undo" >
        </q-btn>

        <q-btn
          @click="commands.redo"
          icon="redo" >
        </q-btn>
        </div>
      </editor-menu-bar>
      <editor-content class="bg-dark text-white" :editor="editor" />
    </div>

    <div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
      <template v-if="hasResults">
        <div
          v-for="(user, index) in filteredUsers"
          :key="user.id"
          class="suggestion-list__item"
          :class="{ 'is-selected': navigatedUserIndex === index }"
          @click="selectUser(user)"
        >
          {{ user.name }}
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">
        No users found
      </div>
    </div>

  </div>
</template>

<script lang="ts">

import Fuse from 'fuse.js'
import tippy, { sticky } from 'tippy.js'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap';
import {
  Mention,
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions';

export default {
  name: 'TextEditorComponent',
  components: {
    EditorContent,
    EditorMenuBar,
  },
  data () {
      const editor = new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new HorizontalRule(),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Mention({
            // a list of all suggested items
            items: () => this.items,
            // is called when a suggestion starts
            onEnter: ({
              items, query, range, command, virtualNode,
            }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.renderPopup(virtualNode)
              // we save the command for inserting a selected mention
              // this allows us to call it inside of our custom popup
              // via keyboard navigation and on click
              this.insertMention = command
            },
            // is called when a suggestion has changed
            onChange: ({
              items, query, range, virtualNode,
            }) => {
              this.query = query
              this.filteredUsers = items
              this.suggestionRange = range
              this.navigatedUserIndex = 0
              this.renderPopup(virtualNode)
            },
            // is called when a suggestion is cancelled
            onExit: () => {
              // reset all saved values
              this.query = null
              this.filteredUsers = []
              this.suggestionRange = null
              this.navigatedUserIndex = 0
              this.destroyPopup()
            },
            // is called on every keyDown event while a suggestion is active
            onKeyDown: ({ event }) => {
              if (event.key === 'ArrowUp') {
                this.upHandler()
                return true
              }
              if (event.key === 'ArrowDown') {
                this.downHandler()
                return true
              }
              if (event.key === 'Enter') {
                this.enterHandler()
                return true
              }
              return false
            },
            // is called when a suggestion has changed
            // this function is optional because there is basic filtering built-in
            // you can overwrite it if you prefer your own filtering
            // in this example we use fuse.js with support for fuzzy search
            onFilter: this.onFilter,
          }),
          new Code(),
          new Bold(),
          new Italic(),
        ],
        content: '',
      }),
      queryEditor = '',
      query = null,
      suggestionRange = null,
      filteredUsersEditor : Array<any> = [],
      filteredUsers : Array<any> = [],
      navigatedUserIndex  = 0,
      items = [
        { id: 1, name: 'Philipp Kühn' },
        { id: 2, name: 'Hans Pagel' },
        { id: 3, name: 'Kris Siepert' },
        { id: 4, name: 'Justin Schueler' },
      ],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      insertMention = () => {};
    
    return { 
      editor,
      query,
      queryEditor,
      filteredUsersEditor,
      suggestionRange,
      filteredUsers,
      navigatedUserIndex,
      insertMention,
      items
     };
  },
  computed: {
    hasResults() {
      return this.filteredUsers.length
    },
    showSuggestions() {
      return this.query || this.hasResults
    },
  },
  methods: {
    onInputEditor(value, { commands }) {
      commands.mention({ id: value.id, label: value.name });
    },
    onFilterEditor(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        const results = this.onFilter(this.items, needle);
        this.filteredUsersEditor = results;
      });
    },
    onFilter(items, query) {
      if (!query) {
        return items
      }
      const fuse = new Fuse(items, {
        threshold: 0.2,
        keys: ['name'],
      })

      const results : Array<any> = [];
      fuse.search(query).forEach((value) => {
        if (value.item) {
          results.push(value.item);
        }
      });

      return results;
    },
    // navigate to the previous item
    // if it's the first item, navigate to the last one
    upHandler() {
      this.navigatedUserIndex = ((this.navigatedUserIndex + this.filteredUsers.length) - 1) % this.filteredUsers.length
    },
    // navigate to the next item
    // if it's the last item, navigate to the first one
    downHandler() {
      this.navigatedUserIndex = (this.navigatedUserIndex + 1) % this.filteredUsers.length
    },
    enterHandler() {
      const user = this.filteredUsers[this.navigatedUserIndex]
      if (user) {
        this.selectUser(user)
      }
    },
    // we have to replace our suggestion text with a mention
    // so it's important to pass also the position of your suggestion text
    selectUser(user) {
      this.insertMention({
        range: this.suggestionRange,
        attrs: {
          id: user.id,
          label: user.name,
        },
      })
      this.editor.focus()
    },
    // renders a popup with suggestions
    // tiptap provides a virtualNode object for using popper.js (or tippy.js) for popups
    renderPopup(node) {
      if (this.popup) {
        return
      }
      // ref: https://atomiks.github.io/tippyjs/v6/all-props/
      this.popup = tippy('q-page', {
        getReferenceClientRect: node.getBoundingClientRect,
        appendTo: () => document.body,
        interactive: true,
        sticky: true, // make sure position of tippy is updated when content changes
        plugins: [sticky],
        content: this.$refs.suggestions,
        trigger: 'mouseenter', // manual
        showOnCreate: true,
        theme: 'dark',
        placement: 'top-start',
        inertia: true,
        duration: [400, 200],
      })
    },
    destroyPopup() {
      if (this.popup && this.popup.length) {
        this.popup[0].destroy()
      }
      this.popup = null
    },
  },
  beforeDestroy() {
    this.destroyPopup()
  },
}
</script>

<style lang="sass" scoped>

.mention
  background: rgba($dark, 0.1);
  color: rgba($dark, 0.6);
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  white-space: nowrap;

.mention-suggestion
  color: rgba($dark, 0.6);

.suggestion-list
  padding: 0.2rem;
  border: 2px solid rgba($dark, 0.1);
  font-size: 0.8rem;
  font-weight: bold;
  &__no-results
    padding: 0.2rem 0.5rem;
  
  &__item
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.2rem;
    cursor: pointer;
    &:last-child
      margin-bottom: 0;
    
    &.is-selected,
    &:hover
      background-color: rgba(white, 0.2);
    
    &.is-empty
      opacity: 0.5;
    
  

.tippy-box[data-theme~=dark]
  background-color: $dark;
  padding: 0;
  font-size: 1rem;
  text-align: inherit;
  color: white;
  border-radius: 5px;

</style>