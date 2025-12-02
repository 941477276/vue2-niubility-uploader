import { t } from './index';
// import * as locale from './index';
// import locale from './index';

export default {
  methods: {
    nbt(...args) {
      return t.apply(this, args);
    }
  }
};
