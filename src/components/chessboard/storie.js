import Vue from 'vue'
import Vuex from 'vuex';
import { storiesOf } from '@storybook/vue';

import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { addonNotes } from '@storybook/addon-notes';

import {
  addonKnobs,
  text,
  number,
  boolean,
  array,
  select,
  color,
  date,
} from '@storybook/addon-knobs';

import Board from './index.vue';

storiesOf('Chessground', module)
.add('Play legal moves from initial position', () => ({
  render(h) {
    return h(Board);
  },
}))
.add('User only move the white', () => ({
  render(h) {
    return h(Board, { props: { mode: {'white':true,'black':false} } });
  },
}))
  .add('Adding external move', () => ({
    components: { Board },
    template: '<board v-on:move="onMove" :external-move="move"></board>',
    data () {
      return {
        move:{}
      }
    },
    methods:{
      onMove(...parms){
        if (parms[0].move) {
          action('move')(parms[0].move);
        }
      }
    },
    created(){
      setTimeout(() => {
        this.move = {
          from: 'e2',
          to: 'e4'
        }
        setTimeout(() => {
          this.move = {
            from: 'e7',
            to: 'e5'
          }
        },1000)
      },2000)
    }
  }))
.add('Play legal moves from fen position', () => ({
  render(h) {
    return h(Board, { props: { fen: '4r3/8/2p2PPk/1p6/pP2p1R1/P1B5/2P2K2/3r4 w - - 1 45' } });
  },
}))
.add('random IA white VS human black', () => ({
  render(h) {
    return h(Board, { props: { orientation:'black', vsIa: {isVsIA: true, color: 'w', delay: 4000, mode: 'random'} ,mode: {'white':false,'black':true} } });
  },
}))
.add('human white VS random IA black', () => ({
  render(h) {
    return h(Board, { props: { vsIa: {isVsIA: true, color: 'b', delay: 2000, mode: 'random'},mode: {'white':true,'black':false} } });
  },
}))
.add('random IA white VS random IA black', () => ({
  render(h) {
    return h(Board, { props: { vsIa: {isVsIA: true, color: 'all', delay: 700, mode: 'random'},mode: {'white':false,'black':false} } });
  },
}))
.add('Garbochess worker IA  white VS human black', () => ({
  render(h) {
    return h(Board, { props: { vsIa: {isVsIA: true, color: 'w', delay: 1000, mode: 'worker'}, mode: {'white':false,'black':true} } });
  },
}))
.add('Garbochess worker IA  white VS Garbochess worker IA', () => ({
  render(h) {
    return h(Board, { props: { vsIa: {isVsIA: true, color: 'all', delay: 300, mode: 'worker'},mode: {'white':false,'black':false} } });
  },
}))