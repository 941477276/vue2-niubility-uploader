/**
 * 渲染插槽内容组件
 * @param props
 * @returns {any}
 * @constructor
 */
export default {
  name: 'RenderSlot',
  props: {
    parentSlots: {
      type: Object,
      default () {
        return {}
      }
    },
    slotName: {
      type: String,
      default: ''
    },
    slotData: {
      default: null
    }
  },
  render (h) {
    let {
      parentSlots,
      slotName,
      slotData
    } = this
    let defaultSlot = this.$slots.default;
    // console.log('RenderSlot1', parentSlots, slotName, slotData);
    // console.log('RenderSlot2', this.$slots, this.$scopedSlots);
    let staticClass = 'custom-render-content'
      let slotFnOrContent = parentSlots[slotName]
      if (slotFnOrContent) {
        if (typeof slotFnOrContent === 'function') {
          return h('div', {
            staticClass
          }, [slotFnOrContent(slotData)])
        } else if (Array.isArray(slotFnOrContent)) {
          return slotFnOrContent;
        }
      } else if (defaultSlot) {
        return this.$slots.default;
      }
      return null;
  }
}
