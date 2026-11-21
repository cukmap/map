/* cukmap 지도 부품 v1 — 다른 사이트에 가톨릭대학교 지도를 넣는다.
 * 사용법: docs/KIT.md (https://github.com/cukmap/map/blob/main/docs/KIT.md)
 *
 *   <div id="map" style="height:500px"></div>
 *   <script src="https://cukmap.com/kit/v1/cukmap.js"></script>
 *   <script>
 *     CUKmap.create('#map', { view: '2d' }).then(map => {
 *       map.addPin({ room: 'N301', label: '컴퓨터정보공학부 OT' });
 *       map.on('click', e => console.log(e.x, e.z, e.building));
 *     });
 *   </script>
 */
(function () {
  'use strict';
  var me = document.currentScript, BASE = me && me.src ? new URL(me.src).origin : 'https://cukmap.com';

  function create(target, opt) {
    opt = opt || {};
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return Promise.reject(new Error('지도를 넣을 자리를 찾지 못했어요: ' + target));
    var q = new URLSearchParams();
    if (opt.view) q.set('view', opt.view);
    if (opt.focus) q.set('focus', opt.focus);
    if (opt.floor) q.set('floor', opt.floor);
    if (opt.ui === false) q.set('ui', '0');
    if (opt.select === false) q.set('select', '0');
    // src: 고정판(내려받아 직접 올린 embed 파일)을 쓰고 싶을 때 그 주소
    var src = (opt.src || BASE + '/embed/') + (q.toString() ? '?' + q : '');
    var frame = document.createElement('iframe');
    frame.src = src; frame.title = '가톨릭대학교 지도 (cukmap)'; frame.allow = 'fullscreen';
    frame.style.cssText = 'width:100%;height:100%;border:0;display:block';
    host.appendChild(frame);
    var origin = new URL(src, location.href).origin, seq = 0, wait = {}, handlers = {};
    var ready = new Promise(function (ok, no) {
      var to = setTimeout(function () { no(new Error('지도를 불러오지 못했어요(시간 초과).')); }, 60000);
      window.addEventListener('message', function (e) {
        if (e.source !== frame.contentWindow || origin !== 'null' && e.origin !== origin) return;
        var m = e.data; if (!m || m.cukmap !== 1) return;
        if (m.event === 'ready') { clearTimeout(to); ok(m); }
        if (m.event && handlers[m.event]) handlers[m.event].forEach(function (f) { try { f(m); } catch (err) { console.error(err); } });
        if (m.reply != null && wait[m.reply]) { var w = wait[m.reply]; delete wait[m.reply]; m.ok ? w[0](m.data) : w[1](new Error(m.error)); }
      });
    });
    function call(cmd) {
      var args = Array.prototype.slice.call(arguments, 1);
      return ready.then(function () {
        return new Promise(function (ok, no) { var id = ++seq; wait[id] = [ok, no]; frame.contentWindow.postMessage({ cukmap: 1, cmd: cmd, id: id, args: args }, origin === 'null' ? '*' : origin); });
      });
    }
    var map = {
      frame: frame,
      /** 핀 추가: {id, x, z} 또는 {building, floor} 또는 {room}, + label, color('#e8552e') */
      addPin: function (p) { return call('addPin', p); },
      removePin: function (id) { return call('removePin', id); },
      clearPins: function () { return call('clearPins'); },
      selectPin: function (id) { return call('selectPin', id); },
      /** 보기 바꾸기: '3d' | '2d' | 'walk' */
      setView: function (v) { return call('setView', v); },
      /** 이동: {building, floor} | {room} | {x, z}, zoom(선택) */
      focus: function (o) { return call('focus', o); },
      walkAt: function (o) { return call('walkAt', o); },
      faces: function (b) { return call('faces', b); },
      paint: function (list) { return call('paint', list); },
      clearPaint: function () { return call('clearPaint'); },
      showPaint: function (on) { return call('showPaint', on); },
      /** 건물 목록: [{id, code, name, floors, indoor:[층...]}] */
      buildings: function () { return call('buildings'); },
      /** 이벤트: 'click'(지도 누름: x, z, floor, building), 'pinClick'(id) */
      on: function (ev, f) { (handlers[ev] = handlers[ev] || []).push(f); return map; }
    };
    return ready.then(function () { return map; });
  }
  window.CUKmap = { create: create, version: '1' };
})();
