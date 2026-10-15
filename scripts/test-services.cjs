const assert = require('node:assert');
const { createEmptyData, migrate } = require('../.tmp-test/services/migration.js');
const {
  createPlaylist,
  deletePlaylist,
  addItemToPlaylist,
  removeItemFromPlaylist,
  deleteItem,
  updateItem
} = require('../.tmp-test/services/playlist-service.js');
const { createMediaItem } = require('../.tmp-test/services/media-service.js');
const { serializeBackup, parseBackup } = require('../.tmp-test/services/backup.js');

let passed = 0;
function ok(name, fn) {
  fn();
  passed++;
  console.log('PASS ' + name);
}

const INFO = {
  title: 'B站示例视频',
  url: 'https://www.bilibili.com/video/BV1xx',
  siteName: 'bilibili.com',
  favicon: 'https://www.bilibili.com/favicon.ico',
  coverUrl: 'https://i0.hdslb.com/cover.jpg',
  media: { kind: 'video', src: 'https://upos-hz-mirrorakamai.com/1.mp4' }
};

ok('空数据初始化含4个种子歌单', () => {
  const d = createEmptyData();
  assert.strictEqual(d.playlists.length, 4);
  assert.ok(d.playlists.every((p) => p.kind === 'custom'));
  assert.strictEqual(d.settings.autoplay, false);
});

ok('migrate(undefined) 返回空数据', () => {
  const d = migrate(undefined);
  assert.strictEqual(d.items.length, 0);
  assert.strictEqual(d.version, 1);
});

ok('migrate(垃圾数据) 容错', () => {
  const d = migrate({ foo: 1 });
  assert.strictEqual(d.playlists.length, 4);
  const d2 = migrate('garbage');
  assert.strictEqual(d2.items.length, 0);
});

ok('收藏新内容 status=created 并进入歌单', () => {
  const d = createEmptyData();
  const { data, item, status } = createMediaItem(d, INFO, 'seed-1');
  assert.strictEqual(status, 'created');
  assert.strictEqual(data.items.length, 1);
  assert.strictEqual(item.contentType, 'video');
  assert.deepStrictEqual(item.playlistIds, ['seed-1']);
  const pl = data.playlists.find((p) => p.id === 'seed-1');
  assert.deepStrictEqual(pl.itemIds, [item.id]);
});

ok('同一URL同一歌单去重 status=duplicate', () => {
  const d = createEmptyData();
  const { data } = createMediaItem(d, INFO, 'seed-1');
  const r = createMediaItem(data, INFO, 'seed-1');
  assert.strictEqual(r.status, 'duplicate');
  assert.strictEqual(r.data.items.length, 1);
  assert.strictEqual(r.data.playlists[0].itemIds.length, 1);
});

ok('同一URL加入不同歌单复用同一条记录', () => {
  const d = createEmptyData();
  const { data } = createMediaItem(d, INFO, 'seed-1');
  const r = createMediaItem(data, INFO, 'seed-2');
  assert.strictEqual(r.status, 'added');
  assert.strictEqual(r.data.items.length, 1);
  assert.deepStrictEqual(r.item.playlistIds.sort(), ['seed-1', 'seed-2']);
});

ok('创建歌单与删除歌单清理引用', () => {
  let d = createEmptyData();
  const c1 = createPlaylist(d, '通勤');
  d = c1.data;
  const { data } = createMediaItem(d, INFO, c1.playlist.id);
  d = data;
  d = deletePlaylist(d, c1.playlist.id);
  assert.strictEqual(d.playlists.length, 4);
  const item = d.items[0];
  assert.ok(!item.playlistIds.includes(c1.playlist.id));
});

ok('addItemToPlaylist 按URL去重', () => {
  let d = createEmptyData();
  const { data } = createMediaItem(d, INFO, null);
  d = data;
  d = createPlaylist(d, '测试').data;
  const plId = d.playlists[d.playlists.length - 1].id;
  d = addItemToPlaylist(d, d.items[0].id, plId);
  d = addItemToPlaylist(d, d.items[0].id, plId);
  const pl = d.playlists.find((p) => p.id === plId);
  assert.strictEqual(pl.itemIds.length, 1);
});

ok('从歌单移除不删除记录', () => {
  let d = createEmptyData();
  const { data, item } = createMediaItem(d, INFO, 'seed-1');
  d = data;
  d = removeItemFromPlaylist(d, item.id, 'seed-1');
  assert.strictEqual(d.items.length, 1);
  assert.deepStrictEqual(d.items[0].playlistIds, []);
  assert.strictEqual(d.playlists[0].itemIds.length, 0);
});

ok('删除收藏清理所有歌单引用', () => {
  let d = createEmptyData();
  const { data, item } = createMediaItem(d, INFO, 'seed-1');
  d = data;
  d = addItemToPlaylist(d, item.id, 'seed-2');
  d = deleteItem(d, item.id);
  assert.strictEqual(d.items.length, 0);
  assert.ok(d.playlists.every((p) => p.itemIds.length === 0));
});

ok('编辑收藏字段', () => {
  let d = createEmptyData();
  const { data, item } = createMediaItem(d, INFO, 'seed-1');
  d = data;
  d = updateItem(d, item.id, { customTitle: '新标题', note: '备注', contentType: 'audio' });
  assert.strictEqual(d.items[0].customTitle, '新标题');
  assert.strictEqual(d.items[0].note, '备注');
  assert.strictEqual(d.items[0].contentType, 'audio');
});

ok('备份序列化与解析往返一致', () => {
  let d = createEmptyData();
  const { data, item } = createMediaItem(d, INFO, 'seed-1');
  d = data;
  const json = serializeBackup(d);
  const parsed = parseBackup(json);
  assert.strictEqual(parsed.items.length, 1);
  assert.strictEqual(parsed.items[0].url, item.url);
  assert.strictEqual(parsed.playlists.length, 4);
});

ok('非法备份被拒绝', () => {
  assert.throws(() => parseBackup('not json'));
  assert.throws(() => parseBackup(JSON.stringify({ foo: 1 })));
  assert.throws(() => parseBackup(JSON.stringify({ playlists: {}, items: {} })));
});

ok('旧数据迁移容错（缺字段补默认）', () => {
  const legacy = { version: 1, playlists: [], items: [{ id: 'x', url: 'https://a.com' }] };
  const d = migrate(legacy);
  assert.strictEqual(d.items[0].title, '未命名内容');
  assert.strictEqual(d.items[0].contentType, 'unknown');
  assert.strictEqual(d.items[0].addedAt > 0, true);
});

console.log(`\n全部 ${passed} 项测试通过`);
