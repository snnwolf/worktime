<template lang="pug">
  div.responsive-margin.col-md-4
    form(@submit.prevent="onSubmit")
      .input-group
        label Слаг заведения
        input(v-model="slug" v-focus)
      .row
        button.secondary(type="submit") Обновить
        p.responsive-padding.error(v-if="errorMsg") {{errorMsg}}
    template(v-if="place")
      .card.fluid
        .section
          h2 {{place.name}}
        //.section {{place.description}}
        .section
          template(v-for="wt in worklist")
            .row(v-if="wt.isMain")
              h4 Часы работы&nbsp;
                span.status-opened(v-if="wt.opened") открыто
                span.status-closed(v-else) закрыто
            .row.row(v-else)
              div.col-sm-10
                h5 {{wt.title}}
              div.col-sm-2
                ul
                  li.status-opened(v-if="wt.opened") открыто
                  li.status-closed(v-else) закрыто
            .row.cols-sm-6(v-for="i in wt.items")
              div {{i.title}}
              div.ta-right {{i.worktime}}

</template>

<script>
import axios from 'axios';

const i18nWeek = {
  1: 'Пн',
  2: 'Вт',
  3: 'Ср',
  4: 'Чт',
  5: 'Пт',
  6: 'Сб',
  7: 'Вс',
};

export default {
  name: 'app',
  components: {},
  data() {
    return {
      slug: 'cubalibrespb',
      errorMsg: '',
      place: null,
    };
  },
  computed: {
    worklist() {
      const wl = [];
      const now = new Date();
      const today = now.getDay();
      if (!this.schedules.length) return wl;
      for (const sh of this.schedules) {
        const o = {
          title: '',
          isMain: !!sh.isMain,
          opened: false,
          items: [],
        };
        let lasttime;
        let dow_collect = [];  // объединенные дни недели
        if (sh.name) o.title = sh.name;
        for (let itemNum = 0; itemNum < sh.items.length; itemNum++) {
          const item = sh.items[itemNum];
          if (item.dayOfWeek === today) { // TODO добавить проверку времени
            o.opened = true;
          }
          // время работы
          let worktime = `${item.startAt} - ${item.endAt}`;
          if (item.startAt === '00:00' && item.endAt === '23:59') worktime = 'Круглосуточно';
          // объединяем дни недели
          if (!lasttime) lasttime = worktime;
          if (lasttime === worktime) {
            dow_collect.push(i18nWeek[item.dayOfWeek]);
            if (itemNum + 1 < sh.items.length) continue;
          }
          o.items.push({
            title: dow_collect.join(', '),
            worktime: worktime,
          });
          lasttime = worktime;
          dow_collect = [];
        }
        wl.push(o);
      }
      return wl;
    },
    schedules() {
      if (this.place && this.place.schedules) return this.place.schedules;
      return [];
    },
  },
  methods: {
    onSubmit() {
      // this.$log.debug(`submiting... ${this.slug}`);
      if (!this.slug) {
        this.$log.debug('empty slug');
        return;
      }
      this.errorMsg = '';
      this.place = null;
      axios.get(`https://tabler.ru/api/v1/places/${this.slug}`)
        .then(({ data }) => {
        // this.$log.debug(data);
          this.place = data.data.place;
        })
        .catch(({ response }) => {
          this.$log.debug('Ошибка данных');
          if (!response.data || !response.data.message) this.errorMsg = 'Ошибка сервера';
          else this.errorMsg = response.data.message;
        });
    },
  },
};
</script>

<style lang="scss">
@import '~mini.css/dist/mini-default.css';
form .error {
  color: var(--input-invalid-color);
}
.status {
  &-opened {
    color: grey;
  }
  &-closed {
    color: red;
  }
}
.ta {
  &-right {text-align:right;}
}
</style>
