import {html, render} from 'lit-html'
import {map} from 'lit-html/directives/map.js'
import grapesjs from 'grapesjs/dist/grapes.min.js'

// constants
const pluginName = 'semantic'

const tags = [
  'DIV',
  'P',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'A',
  'SPAN',
  'MAIN',
  'ASIDE',
  'SECTION',
  'ADDRESS',
  'ARTICLE',
  'NAV',
  'HEADER',
  'FOOTER',
  'DETAILS',
  'SUMMARY',
  'PRE',
  'BLOCKQUOTE',
  'IMG',
]

// plugin code
export const semanticPlugin = grapesjs.plugins.add(pluginName, (editor, opts) => {
  // Add the new trait to all component types
  editor.DomComponents.getTypes().map(type => {
    editor.DomComponents.addType(type.id, {
      model: {
        defaults: {
          traits: [
            // Keep the type original traits
            ...editor.DomComponents.getType(type.id).model.prototype.defaults.traits,
            // Add the new trait
            {
              label: 'Tag name',
              type: 'tag-name',
            },
          ]
        }
      }
    })
  })

  function doRender(el: HTMLElement, tagName: string) {
    render(html`
      <label for="semantic__select" class="gjs-one-bg silex-label">Type</label>
      <select id="semantic__select" @change=${event => doRender(el, event.target.value)}>
        ${map<string>(tags, tag => html`
          <option value="${tag}" ?selected=${tagName.toUpperCase() === tag}>${tag}</option>
        `)}
      </select>
    `, el)
  }
  function doRenderCurrent(el: HTMLElement) {
    doRender(el, editor.getSelected()?.get('tagName') || '')
  }

  // Add semantic traits
  // inspired by https://github.com/olivmonnier/grapesjs-plugin-header/blob/master/src/components.js
  editor.TraitManager.addType('tag-name', {
    createInput({ trait }) {
      // Create a new element container and add some content
      const el = document.createElement('div')
      // update the UI when a page is added/renamed/removed
      editor.on('page', () => doRenderCurrent(el))
      doRenderCurrent(el)
      // this will be the element passed to onEvent and onUpdate
      return el
    },
    // Update the component based on UI changes
    // `elInput` is the result HTMLElement you get from `createInput`
    onEvent({ elInput, component, event }) {
      const value = elInput.querySelector('#semantic__select').value
      if(component.get('tagName').toUpperCase() === value.toUpperCase()){
        // Already done
      } else {
        component.set('tagName', value)
      }
    },
    // Update UI on the component change
    onUpdate({ elInput, component }) {
      const tagName = component.get('tagName')
      doRender(elInput, tagName)
    },
  })
})
