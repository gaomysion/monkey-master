import MonkeyMaster from './main.js';
import loadJsonFile from 'https://deno.land/x/load_json_file@v1.0.0/mod.ts';
import { validateSkuids } from './util/validation.js';

const CONFIG = await loadJsonFile('conf.json');

let skuids = prompt(
    '输入抢购skuid,可以是多个，以逗号(,)分割',
    '100016691566'
).trim().split(',');

const ins = new MonkeyMaster({
    skuids,
    password: CONFIG.orderDeps.password,
    areaId: CONFIG.orderDeps.area,
    eid: CONFIG.orderDeps.eid,
    fp: CONFIG.orderDeps.fp,
});

await ins.init();

// 该商品需要实名认证才可抢购的情况 无法通过金融通道秒杀
const mode = prompt(
    '选择运行模式: 1-有货下单, 2-按时下单, 3-提前秒杀, 默认为1',
    '1'
);

switch (mode) {
    case '1':
        const interval = prompt(
            '设置库存监控间隔最大时间, 系统将在此时间内随机刷新 单位秒',
            5
        );
        const buyFunc =
            skuids.length > 1 ? 'buyMultiSkusInStock' : 'buySingleSkuInStock';

        if (await ins[buyFunc](interval)) {
            await fetch(
                `https://sc.ftqq.com/${CONFIG.sckey}.send?text=Yes, you got it 🍌🍌🍌🍌🍌`
            );
            Deno.exit();
        }

        break;

    case '2':
        const buyOnTimeFunc =
            prompt('选择下单方式，1: 京东 web, 2: 京东金融 APP', 1) === '1'
                ? 'buyOnTime'
                : 'fqkillOnTime';

        const buyTime = prompt(
            '输入抢购开始时间, 格式为 yyyy-MM-dd HH:mm:ss.SSS'
        );

        console.log('请确保购物车中待抢购商品已删除!!!');

        await ins[buyOnTimeFunc](buyTime);
        break;

    case '3':
        const secKillTime = prompt(
            '输入抢购开始时间, 格式为 yyyy-MM-dd HH:mm:ss.SSS'
        );

        if (await ins.seckillOnTime(secKillTime, 1)) {
            await fetch(
                `https://sc.ftqq.com/${CONFIG.sckey}.send?text=Yes, you got it 🍌🍌🍌🍌🍌`
            );
        }

        break;

    default:
        break;
}
