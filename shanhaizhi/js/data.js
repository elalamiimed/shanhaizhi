/**
 * 山海经——人生旅行相册 · 数据层模块
 * ================================
 * 本模块为游戏全部静态数据定义，包含城市、神兽、成就、卡牌、区域及玩家初始数据。
 * 通过 window.GameData 全局挂载，供纯 HTML 单文件引用。
 *
 * 坐标说明：lat / lng 采用相对坐标 0-100，映射中国版图。
 *   lat 0 ≈ 南端（海南），lat 100 ≈ 北端（黑龙江）
 *   lng 0 ≈ 西端（新疆），lng 100 ≈ 东端（黑龙江/上海）
 */

(function () {
  'use strict';

  /* ================================================================
   *  一、区域数据 (regions)
   * ================================================================ */
  const regions = [
    {
      id: 'dongshan',
      name: '东山经',
      description: '东山之首，曰樕䰄之山，北临乾昧。东山经所载，多在海滨之邦，日出东方，万物始生。此区域涵盖华东沿海诸省，碧海蓝天之间，神兽潜伏于潮汐之中。',
      provinces: ['山东', '江苏', '上海', '浙江', '福建', '广东', '海南'],
      themeColor: '#1A6B5C',
      unlockCondition: '首次打卡华东任意城市即可开启'
    },
    {
      id: 'xishan',
      name: '西山经',
      description: '西山经华山之首，曰钱来之山，其上多松，其下多洗石。西山绵延，昆仑之丘在上，西王母所居也。此区域涵盖西北及西南高原，雪山巍峨，古韵悠长。',
      provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆', '西藏', '四川', '重庆'],
      themeColor: '#8B6914',
      unlockCondition: '首次打卡西北或西南任意城市即可开启'
    },
    {
      id: 'nanshan',
      name: '南山经',
      description: '南山经之首曰鹊山，其首曰招摇之山，临于西海之上，多桂，多金玉。南山经所载，多在岭南与西南边陲，草木葱茏，百兽出没。',
      provinces: ['广东', '广西', '海南', '云南', '贵州', '湖南', '江西', '福建'],
      themeColor: '#2D6A4F',
      unlockCondition: '首次打卡华南或西南任意城市即可开启'
    },
    {
      id: 'beishan',
      name: '北山经',
      description: '北山经之首，曰单狐之山，多机木，其上多华草。北山经所载，多在塞北与东北，冰天雪地之间，有神兽蛰伏于冻土之下。',
      provinces: ['黑龙江', '吉林', '辽宁', '内蒙古', '河北', '北京', '天津', '山西'],
      themeColor: '#4A6FA5',
      unlockCondition: '首次打卡华北或东北任意城市即可开启'
    },
    {
      id: 'zhongshan',
      name: '中山经',
      description: '中山经薄山之首，曰甘枣之山，共水出焉，而西流注于河。中山经所载，乃天下之中，中原腹地，华夏文明之发祥，五岳巍巍，河洛汤汤。',
      provinces: ['河南', '湖北', '安徽', '湖南', '江西', '山西', '山东'],
      themeColor: '#A0522D',
      unlockCondition: '首次打卡华中任意城市即可开启'
    },
    {
      id: 'dahuang',
      name: '大荒经',
      description: '大荒之中，有山名曰大荒之山，日月所入。大荒经所载，乃极远之地，人迹罕至，天地苍茫。此为隐藏区域，需集齐四海之力方可窥见其真容。',
      provinces: ['新疆', '西藏', '内蒙古', '黑龙江'],
      themeColor: '#2C1654',
      unlockCondition: '解锁全部五个基础区域后自动开启'
    }
  ];

  /* ================================================================
   *  二、城市数据 (cities)
   * ================================================================ */
  const cities = [
    // —— 北山经 ——
    {
      id: 'beijing',
      name: '北京',
      province: '北京',
      region: 'beishan',
      lat: 72,
      lng: 68,
      realLat: 39.9042,
      realLng: 116.4074,
      themeColor: '#C41E3A',
      landmark: '故宫·紫禁城',
      description: '北京，华夏文明的心脏，三千年建城史与八百年建都史在此交汇。故宫紫禁城是世界上现存规模最大的古代宫殿建筑群，长城蜿蜒于燕山之巅，天坛祈年殿诉说着天人合一的哲思。这座城市既有皇家气派的宏大叙事，也有胡同深处的市井烟火，是中国历史与现代文明最完美的融合之地。',
      beast: 'bize',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'tianjin',
      name: '天津',
      province: '天津',
      region: 'beishan',
      lat: 70,
      lng: 70,
      realLat: 39.0842,
      realLng: 117.2009,
      themeColor: '#003DA5',
      landmark: '天津之眼',
      description: '天津，九河下梢之地，因漕运而兴，因开埠而盛。海河穿城而过，两岸留存着风格迥异的近代建筑群，意式风情区、五大道洋楼诉说着百年前的繁华。天津之眼摩天轮倒映在海河之上，相声文化在茶馆里代代传承，狗不理包子的香气飘散在街头巷尾。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'shijiazhuang',
      name: '石家庄',
      province: '河北',
      region: 'beishan',
      lat: 66,
      lng: 65,
      realLat: 38.0428,
      realLng: 114.5149,
      themeColor: '#6B4226',
      landmark: '赵州桥',
      description: '石家庄，燕赵大地的现代省会，却守护着中国最古老的石拱桥——赵州桥。这座建于隋代的桥梁历经一千四百年风雨依然屹立，是中国古代工程智慧的结晶。西柏坡是新中国的摇篮，正定古城保存着唐宋风貌，苍岩山悬空寺令人叹为观止。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'taiyuan',
      name: '太原',
      province: '山西',
      region: 'beishan',
      lat: 64,
      lng: 60,
      realLat: 37.8706,
      realLng: 112.5489,
      themeColor: '#4A4A4A',
      landmark: '晋祠',
      description: '太原，表里山河的晋阳古城，汾河之畔的千年重镇。晋祠是中国现存最早的皇家祭祀园林，圣母殿内的宋代彩塑被誉为"东方维纳斯"。山西是中国地上文物最丰富的省份，太原作为其省会，承载着华夏文明最深厚的历史积淀，煤炭与文化在这里共生共荣。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'hohhot',
      name: '呼和浩特',
      province: '内蒙古',
      region: 'beishan',
      lat: 58,
      lng: 52,
      realLat: 40.8422,
      realLng: 111.7490,
      themeColor: '#2E8B57',
      landmark: '大召寺',
      description: '呼和浩特，蒙古语意为"青色的城"，是内蒙古草原文明与中原农耕文化交融的见证地。大召寺金碧辉煌，供奉着银佛，是蒙古族最重要的藏传佛教圣地之一。策马奔腾于敕勒川，感受"天苍苍，野茫茫，风吹草低见牛羊"的壮阔诗意，品尝手把肉与奶茶，体验游牧民族的豪迈风情。',
      beast: 'kuafu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'haerbin',
      name: '哈尔滨',
      province: '黑龙江',
      region: 'beishan',
      lat: 85,
      lng: 80,
      realLat: 45.8038,
      realLng: 126.5350,
      themeColor: '#5B8FA8',
      landmark: '圣索菲亚大教堂',
      description: '哈尔滨，中国最北的省会城市，被誉为"东方莫斯科"与"冰城"。松花江畔的圣索菲亚大教堂是中国保存最完好的拜占庭式建筑，中央大街的欧式建筑群诉说着百年前的繁华。每年冬季，冰雪大世界将这座城市变成晶莹剔透的童话王国，冰龙传说在极寒的夜空中若隐若现。',
      beast: 'binglong',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'changchun',
      name: '长春',
      province: '吉林',
      region: 'beishan',
      lat: 80,
      lng: 78,
      realLat: 43.8171,
      realLng: 125.3235,
      themeColor: '#6B8E23',
      landmark: '伪满皇宫博物院',
      description: '长春，东北亚腹地的绿色之城，中国汽车工业的摇篮。伪满皇宫博物院是近代史的沉重见证，净月潭国家森林公园是城市的绿肺。长春电影制片厂曾是新中国电影的摇篮，"北国春城"的美誉源于这里四季分明、绿树成荫的城市风貌。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'shenyang',
      name: '沈阳',
      province: '辽宁',
      region: 'beishan',
      lat: 76,
      lng: 76,
      realLat: 41.8057,
      realLng: 123.4315,
      themeColor: '#8B0000',
      landmark: '沈阳故宫',
      description: '沈阳，辽宁省会，清朝的发祥地与第一个都城。沈阳故宫是中国仅存的两座完整皇宫之一，其满族建筑风格与北京故宫各有千秋。昭陵、福陵是清朝皇家陵寝，张氏帅府见证了民国风云。这座城市以重工业著称，却也保存着满族文化最深厚的历史根脉。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'dalian',
      name: '大连',
      province: '辽宁',
      region: 'beishan',
      lat: 74,
      lng: 78,
      realLat: 38.9140,
      realLng: 121.6147,
      themeColor: '#4682B4',
      landmark: '星海广场',
      description: '大连，辽东半岛南端的浪漫海滨城市，被誉为"北方香港"与"浪漫之都"。星海广场是亚洲最大的城市广场，金石滩的奇石海岸令人叹为观止。大连的城市规划深受俄日两国影响，欧式建筑与现代都市风貌交相辉映，海鲜美食与足球文化是这座城市最鲜明的名片。',
      beast: null,
      unlockCount: 0,
      level: 0
    },

    // —— 东山经 ——
    {
      id: 'shanghai',
      name: '上海',
      province: '上海',
      region: 'dongshan',
      lat: 66,
      lng: 82,
      realLat: 31.2304,
      realLng: 121.4737,
      themeColor: '#FFD700',
      landmark: '东方明珠',
      description: '上海，中国最大的经济中心城市，东方的"魔都"。黄浦江两岸，外滩的万国建筑博览群与陆家嘴的摩天大楼群隔江相望，百年历史与现代文明在此对话。弄堂里的石库门承载着老上海的市井记忆，南京路的霓虹灯映照着这座城市永不停歇的脉搏。',
      beast: 'haishenyuxiao',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'nanjing',
      name: '南京',
      province: '江苏',
      region: 'dongshan',
      lat: 64,
      lng: 76,
      realLat: 32.0603,
      realLng: 118.7969,
      themeColor: '#7B2D26',
      landmark: '中山陵',
      description: '南京，六朝古都，十朝都会，金陵王气在此绵延千年。中山陵依紫金山而建，气势恢宏；明孝陵是明代皇家陵寝的典范；秦淮河畔的桨声灯影诉说着六朝金粉的繁华旧梦。南京大屠杀纪念馆是历史的警示，夫子庙的热闹则是这座城市生生不息的烟火气。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'hefei',
      name: '合肥',
      province: '安徽',
      region: 'dongshan',
      lat: 62,
      lng: 74,
      realLat: 31.8206,
      realLng: 117.2272,
      themeColor: '#556B2F',
      landmark: '包公祠',
      description: '合肥，安徽省会，因包拯而名扬天下的"包公故里"。包公祠供奉着这位铁面无私的北宋清官，是中国廉政文化的精神象征。巢湖是中国五大淡水湖之一，环巢湖的湿地风光令人心旷神怡。合肥近年来以科技创新著称，中国科学技术大学在此扎根，"科教名城"的新名片正在书写。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'hangzhou',
      name: '杭州',
      province: '浙江',
      region: 'dongshan',
      lat: 62,
      lng: 80,
      realLat: 30.2741,
      realLng: 120.1551,
      themeColor: '#4DB8A4',
      landmark: '西湖',
      description: '杭州，"上有天堂，下有苏杭"，西湖的美景令古今无数文人墨客倾倒。苏堤春晓、断桥残雪、平湖秋月……西湖十景是中国山水美学的极致表达。龙井茶香飘散在梅家坞的茶园间，宋城的繁华在清河坊重现，钱塘江大潮是大自然最壮观的奇景之一。',
      beast: 'jiuweihu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'fuzhou',
      name: '福州',
      province: '福建',
      region: 'dongshan',
      lat: 56,
      lng: 80,
      realLat: 26.0745,
      realLng: 119.2965,
      themeColor: '#B8860B',
      landmark: '三坊七巷',
      description: '福州，"有福之州"，闽江之畔的千年古城。三坊七巷是中国保存最完整的里坊制度活化石，走出了林则徐、严复、冰心等无数历史名人。温泉从城市地下涌出，福州是中国著名的温泉之都。茉莉花茶的清香、佛跳墙的醇厚，是这座城市最温柔的味道。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'xiamen',
      name: '厦门',
      province: '福建',
      region: 'dongshan',
      lat: 54,
      lng: 79,
      realLat: 24.4798,
      realLng: 118.0894,
      themeColor: '#FF8C00',
      landmark: '鼓浪屿',
      description: '厦门，鹭岛之城，闽南文化与海洋文明交融的浪漫港口。鼓浪屿是世界文化遗产，岛上的万国建筑群与钢琴声交织成独特的音乐之岛风情。南普陀寺香火鼎盛，厦门大学是中国最美的大学之一。沙茶面、海蛎煎、土笋冻，闽南小吃是这座城市最接地气的名片。',
      beast: 'gudiao',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'jinan',
      name: '济南',
      province: '山东',
      region: 'dongshan',
      lat: 66,
      lng: 72,
      realLat: 36.6512,
      realLng: 116.9972,
      themeColor: '#1E90FF',
      landmark: '趵突泉',
      description: '济南，"泉城"，七十二名泉点缀于城市之中，趵突泉是天下第一泉，泉水从地下喷涌而出，千年不竭。大明湖荷花盛开，千佛山俯瞰全城，"四面荷花三面柳，一城山色半城湖"是对这座城市最诗意的描绘。齐鲁文化在此深厚积淀，孔孟之道的精神根脉延伸至这片土地。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'qingdao',
      name: '青岛',
      province: '山东',
      region: 'dongshan',
      lat: 66,
      lng: 75,
      realLat: 36.0671,
      realLng: 120.3826,
      themeColor: '#006994',
      landmark: '栈桥',
      description: '青岛，黄海之滨的红瓦绿树之城，德国殖民时期留下的欧式建筑与中国海洋文化在此融合。栈桥伸入碧海，回澜阁倒映在波光之中。青岛啤酒节是亚洲最大的啤酒节，崂山道教文化源远流长，五四广场的五月的风雕塑是这座城市精神的象征。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'guangzhou',
      name: '广州',
      province: '广东',
      region: 'dongshan',
      lat: 46,
      lng: 72,
      realLat: 23.1291,
      realLng: 113.2644,
      themeColor: '#EE1C25',
      landmark: '广州塔',
      description: '广州，千年商都，岭南文化的中心。广州塔"小蛮腰"俯瞰珠江两岸的繁华，陈家祠的砖雕木刻是岭南工艺的巅峰之作。早茶文化是广州人最重要的生活仪式，"食在广州"的美誉享誉天下。广交会是中国对外贸易的窗口，这座城市以开放包容的姿态连接着世界。',
      beast: 'shitishou',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'shenzhen',
      name: '深圳',
      province: '广东',
      region: 'dongshan',
      lat: 46,
      lng: 74,
      realLat: 22.5431,
      realLng: 114.0579,
      themeColor: '#00796B',
      landmark: '世界之窗',
      description: '深圳，中国改革开放的窗口，从一个小渔村蜕变为国际化大都市的奇迹之城。四十余年间，深圳创造了举世瞩目的"深圳速度"，成为中国科技创新的最前沿。世界之窗汇聚全球奇观，华强北是全球最大的电子市场，大鹏古城诉说着这片土地的历史底蕴。深圳湾的红树林是候鸟的天堂，也是这座年轻城市最温柔的一面。',
      beast: null,
      unlockCount: 0,
      level: 0
    },

    // —— 南山经 ——
    {
      id: 'nanning',
      name: '南宁',
      province: '广西',
      region: 'nanshan',
      lat: 42,
      lng: 60,
      realLat: 22.8170,
      realLng: 108.3665,
      themeColor: '#228B22',
      landmark: '青秀山',
      description: '南宁，"绿城"，壮族文化的中心，北部湾经济区的核心城市。青秀山郁郁葱葱，邕江穿城而过，四季如春的气候让这座城市绿意盎然。壮族三月三歌圩节是中国最盛大的少数民族节日之一，螺蛳粉的独特香气已飘香全国，南宁是连接中国与东盟的重要门户。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'guilin',
      name: '桂林',
      province: '广西',
      region: 'nanshan',
      lat: 44,
      lng: 62,
      realLat: 25.2736,
      realLng: 110.2907,
      themeColor: '#20B2AA',
      landmark: '漓江',
      description: '桂林，"桂林山水甲天下"，漓江两岸的喀斯特地貌是大自然鬼斧神工的杰作。竹筏漂流于碧绿的漓江之上，两岸奇峰倒影如画，象鼻山是桂林的标志。阳朔西街是中西文化交融的缩影，龙脊梯田在云雾中层层叠叠，壮族与瑶族的歌声在山谷间回荡。',
      beast: 'xiangliu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'haikou',
      name: '海口',
      province: '海南',
      region: 'nanshan',
      lat: 30,
      lng: 64,
      realLat: 20.0440,
      realLng: 110.3500,
      themeColor: '#3CB371',
      landmark: '骑楼老街',
      description: '海口，海南省会，南海之滨的热带城市。骑楼老街是南洋风情与本土文化融合的历史街区，椰树摇曳，海风轻拂。海口是海南自由贸易港的核心城市，热带水果琳琅满目，文昌鸡、东山羊是海南美食的代表。这里是候鸟人的冬日天堂，也是年轻人追梦的热土。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'sanya',
      name: '三亚',
      province: '海南',
      region: 'nanshan',
      lat: 26,
      lng: 64,
      realLat: 18.2528,
      realLng: 109.5120,
      themeColor: '#00CED1',
      landmark: '天涯海角',
      description: '三亚，"东方夏威夷"，中国最南端的热带滨海城市。天涯海角的巨石见证了无数爱情誓言，亚龙湾的碧海白沙是中国最美的海滩之一。南山寺的海上观音像矗立于碧波之上，蜈支洲岛是潜水爱好者的天堂。椰林、沙滩、阳光，三亚是中国人心中最向往的度假胜地。',
      beast: 'fuzhu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'changsha',
      name: '长沙',
      province: '湖南',
      region: 'nanshan',
      lat: 52,
      lng: 66,
      realLat: 28.2282,
      realLng: 112.9388,
      themeColor: '#DC143C',
      landmark: '岳麓书院',
      description: '长沙，湖湘文化的中心，"惟楚有材，于斯为盛"的精神发源地。岳麓书院千年讲学，培育了无数经世济民的人才。橘子洲头的毛泽东青年雕像俯瞰湘江，马王堆汉墓出土的文物震惊世界。长沙的夜生活是中国最热闹的之一，臭豆腐、糖油粑粑是这座城市最接地气的美食符号。',
      beast: 'dijiang',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'nanchang',
      name: '南昌',
      province: '江西',
      region: 'nanshan',
      lat: 54,
      lng: 72,
      realLat: 28.6820,
      realLng: 115.8579,
      themeColor: '#B22222',
      landmark: '滕王阁',
      description: '南昌，"英雄城"，中国人民解放军的诞生地。滕王阁是江南三大名楼之首，王勃的《滕王阁序》让这座楼阁名垂千古。八一起义纪念馆是中国革命历史的重要见证，鄱阳湖是中国最大的淡水湖，每年冬季数十万候鸟在此越冬，蔚为壮观。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'guiyang',
      name: '贵阳',
      province: '贵州',
      region: 'nanshan',
      lat: 46,
      lng: 56,
      realLat: 26.6470,
      realLng: 106.6302,
      themeColor: '#6A5ACD',
      landmark: '甲秀楼',
      description: '贵阳，"爽爽的贵阳"，中国大数据产业的发源地。甲秀楼矗立于南明河中的鳌矶石上，是贵阳的精神地标。黄果树瀑布是亚洲最大的瀑布，荔波小七孔的碧水绿树如梦似幻。贵州是中国少数民族最多的省份之一，苗族银饰、侗族大歌、布依族蜡染，多彩贵州名不虚传。',
      beast: 'luwu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'kunming',
      name: '昆明',
      province: '云南',
      region: 'nanshan',
      lat: 42,
      lng: 52,
      realLat: 25.0389,
      realLng: 102.7183,
      themeColor: '#FF6347',
      landmark: '滇池',
      description: '昆明，"春城"，四季如春的高原明珠。滇池是云贵高原上最大的淡水湖，海鸥在冬日翩翩起舞。石林是世界自然遗产，奇峰异石令人叹为观止。云南是中国植物王国，鲜花四季盛开，斗南花卉市场是亚洲最大的鲜花交易市场。过桥米线的鲜美，是昆明给每位旅人最温暖的问候。',
      beast: 'bifang',
      unlockCount: 0,
      level: 0
    },

    // —— 西山经 ——
    {
      id: 'xian',
      name: '西安',
      province: '陕西',
      region: 'xishan',
      lat: 62,
      lng: 52,
      realLat: 34.3416,
      realLng: 108.9398,
      themeColor: '#8B4513',
      landmark: '秦始皇兵马俑',
      description: '西安，十三朝古都，中华文明的重要发祥地。秦始皇兵马俑是世界第八大奇迹，数千件陶俑沉默地守护着千古一帝的地下王国。大雁塔见证了玄奘西天取经的壮举，古城墙是中国保存最完整的古代城墙。西安是古丝绸之路的起点，羊肉泡馍、肉夹馍、凉皮是这座城市最质朴的美食记忆。',
      beast: 'luwu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'lanzhou',
      name: '兰州',
      province: '甘肃',
      region: 'xishan',
      lat: 56,
      lng: 46,
      realLat: 36.0611,
      realLng: 103.8343,
      themeColor: '#CD853F',
      landmark: '中山桥',
      description: '兰州，黄河穿城而过的西北重镇，是中国唯一一座黄河穿越市区的省会城市。中山桥是黄河上最古老的铁桥，被誉为"天下黄河第一桥"。兰州拉面是中国最广为人知的面食之一，白塔山俯瞰黄河，五泉山的清泉诉说着丝路古道的沧桑。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'yinchuan',
      name: '银川',
      province: '宁夏',
      region: 'xishan',
      lat: 54,
      lng: 48,
      realLat: 38.4872,
      realLng: 106.2309,
      themeColor: '#DAA520',
      landmark: '西夏王陵',
      description: '银川，塞上江南，西夏王朝的故都。西夏王陵是中国规模最大的帝王陵园之一，被誉为"东方金字塔"。贺兰山岩画是史前文明的神秘遗迹，沙湖的芦苇荡与沙漠奇景并存。宁夏枸杞、滩羊肉是这片土地最珍贵的馈赠，回族文化在此绽放出独特的光彩。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'wulumuqi',
      name: '乌鲁木齐',
      province: '新疆',
      region: 'xishan',
      lat: 52,
      lng: 22,
      realLat: 43.8256,
      realLng: 87.6168,
      themeColor: '#B8860B',
      landmark: '国际大巴扎',
      description: '乌鲁木齐，"优美的牧场"，新疆维吾尔自治区的首府，亚欧大陆的心脏地带。国际大巴扎是中亚最大的集市，异域风情浓郁。天山天池是高山湖泊的明珠，南山牧场的草原风光令人心旷神怡。哈密瓜、葡萄干、烤羊肉串，新疆的美食是丝绸之路上最诱人的风景。',
      beast: 'zhulong',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'lasa',
      name: '拉萨',
      province: '西藏',
      region: 'xishan',
      lat: 44,
      lng: 28,
      realLat: 29.6500,
      realLng: 91.1000,
      themeColor: '#DC143C',
      landmark: '布达拉宫',
      description: '拉萨，"神佛之地"，世界屋脊上的圣城。布达拉宫依山而建，金顶在阳光下熠熠生辉，是藏传佛教最神圣的殿堂。大昭寺前的八廓街是朝圣者的天堂，纳木错的湛蓝湖水倒映着雪山。在海拔三千六百米的高原上，酥油茶的温热与转经筒的转动，是拉萨给每位旅人最深刻的精神洗礼。',
      beast: 'xwangmu',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'chengdu',
      name: '成都',
      province: '四川',
      region: 'xishan',
      lat: 50,
      lng: 48,
      realLat: 30.5728,
      realLng: 104.0668,
      themeColor: '#FF4500',
      landmark: '武侯祠',
      description: '成都，"天府之国"，一座来了就不想离开的城市。武侯祠是三国文化的圣地，锦里古街的烟火气令人沉醉。大熊猫基地是与国宝亲密接触的最佳场所，都江堰水利工程两千年来滋养着天府平原。成都的慢生活哲学举世闻名，火锅的麻辣鲜香、盖碗茶的悠然自得，是这座城市最迷人的气质。',
      beast: 'shitiashou',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'chongqing',
      name: '重庆',
      province: '重庆',
      region: 'xishan',
      lat: 50,
      lng: 54,
      realLat: 29.4316,
      realLng: 106.9123,
      themeColor: '#FF1493',
      landmark: '洪崖洞',
      description: '重庆，山城，雾都，8D魔幻城市。洪崖洞的吊脚楼依山而建，夜晚灯火辉煌如宫崎骏动画中的场景。长江与嘉陵江在此交汇，两江游轮是感受山城夜景的最佳方式。重庆火锅以麻辣著称，是中国最受欢迎的美食之一。这座城市的立体交通令人叹为观止，轻轨穿楼而过已成为网红打卡地。',
      beast: null,
      unlockCount: 0,
      level: 0
    },

    // —— 中山经 ——
    {
      id: 'wuhan',
      name: '武汉',
      province: '湖北',
      region: 'zhongshan',
      lat: 56,
      lng: 64,
      realLat: 30.5928,
      realLng: 114.3055,
      themeColor: '#FFD700',
      landmark: '黄鹤楼',
      description: '武汉，九省通衢，长江与汉江交汇的英雄之城。黄鹤楼是江南三大名楼之首，崔颢的诗句"昔人已乘黄鹤去，此地空余黄鹤楼"令其名垂千古。武汉大学的樱花是中国最美的校园风景之一，热干面是武汉人最深情的早餐记忆。这座城市以坚韧著称，是中国近代史上无数重要历史事件的发生地。',
      beast: 'chenghuang',
      unlockCount: 0,
      level: 0
    },
    {
      id: 'zhengzhou',
      name: '郑州',
      province: '河南',
      region: 'zhongshan',
      lat: 62,
      lng: 64,
      realLat: 34.7466,
      realLng: 113.6253,
      themeColor: '#D2691E',
      landmark: '少林寺',
      description: '郑州，华夏文明的重要发源地，中原腹地的交通枢纽。少林寺是中国武术的圣地，禅宗文化在此发扬光大。黄河在郑州北部奔涌而过，黄河博物馆诉说着母亲河的沧桑历史。商代遗址证明这里是中国最早的城市之一，烩面的醇厚是郑州人最温暖的家乡味道。',
      beast: null,
      unlockCount: 0,
      level: 0
    },
    {
      id: 'luoyang',
      name: '洛阳',
      province: '河南',
      region: 'zhongshan',
      lat: 60,
      lng: 62,
      realLat: 34.6197,
      realLng: 112.4540,
      themeColor: '#8B0000',
      landmark: '龙门石窟',
      description: '洛阳，十三朝古都，"千年帝都，牡丹花城"。龙门石窟是世界文化遗产，数万尊佛像凿刻于伊河两岸的崖壁之上，卢舍那大佛的微笑被誉为"东方蒙娜丽莎"。每年四月，洛阳牡丹盛开，国色天香引得万人争睹。白马寺是中国第一座官办佛教寺院，洛阳水席是中国最古老的宴席之一。',
      beast: 'luwu',
      unlockCount: 0,
      level: 0
    }
  ];

  /* ================================================================
   *  三、神兽数据 (beasts)
   * ================================================================ */
  const beasts = [
    {
      id: 'chenghuang',
      name: '乘黄',
      description: '《山海经·海外西经》："有乘黄，其状如狐，其背上有角，乘之寿二千岁。"',
      descriptionModern: '形似狐狸，背上生有一角，骑乘它的人可以活两千岁。乘黄是长寿的象征，古人认为得见乘黄者，必有大福。',
      rarity: '稀有',
      region: 'zhongshan',
      element: '土',
      lore: '传说乘黄居于中原深山之中，非有大德之人不可见。昔有樵夫于嵩山迷路，遇一金色异兽伏于道旁，背上独角莹莹如玉。樵夫壮胆骑之，须臾间已至家门前，而山中岁月已过三载。自此樵夫鹤发童颜，又活了二百余岁。乘黄所过之处，草木皆生金光，故又被称为"寿光之兽"。'
    },
    {
      id: 'jiuweihu',
      name: '九尾狐',
      description: '《山海经·南山经》："青丘之山，有兽焉，其状如狐而九尾，其音如婴儿，能食人，食者不蛊。"',
      descriptionModern: '外形像狐狸，长有九条尾巴，叫声像婴儿啼哭。虽然能吃人，但人若吃了它的肉，就能百毒不侵。',
      rarity: '传说',
      region: 'dongshan',
      element: '火',
      lore: '九尾狐居于东海青丘之山，乃上古神兽中最具传奇色彩者。大禹治水时，涂山氏化为九尾白狐现身，大禹遂娶涂山女为妻，生启而开夏朝。然自商纣之时，妲己以九尾狐之身祸乱朝纲，九尾狐遂由祥瑞化为妖邪。实则九尾狐本无善恶，其性随人心而化——心正则现瑞兽之姿，心邪则显妖魅之态。九尾，象征子孙繁盛、福泽绵长。'
    },
    {
      id: 'bifang',
      name: '毕方',
      description: '《山海经·西山经》："有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方，其鸣自叫也，见则其邑有讹火。"',
      descriptionModern: '外形像鹤，只有一只脚，青色的身体上有红色斑纹，白色的嘴。它出现的地方就会发生大火。',
      rarity: '稀有',
      region: 'nanshan',
      element: '火',
      lore: '毕方乃火之精灵，黄帝巡游泰山时，毕方侍于车旁。传说毕方不饮不食，以火为食，所到之处烈焰随行。古人见毕方则惧，以为火灾之兆。然毕方之火非恶火，它能焚尽世间污秽，令万物浴火重生。昆明滇池畔，每逢旱季偶见赤光冲天，老者便说那是毕方在湖中沐浴，以火炼水，来年必是丰年。'
    },
    {
      id: 'shitishou',
      name: '食铁兽',
      description: '《山海经·中山经》："又东四十里，曰鬾山……有兽焉，其状如熊而黑白文，名曰食铁兽。"',
      descriptionModern: '外形像熊，身上有黑白相间的花纹，牙齿坚硬可以啃食铜铁。食铁兽即大熊猫在上古神话中的异兽形态。',
      rarity: '普通',
      region: 'xishan',
      element: '金',
      lore: '食铁兽乃蜀地最深处的守护者，蛰伏于竹林深处，看似憨态可掬，实则力大无穷。上古蚩尤与黄帝大战时，蚩尤曾驱食铁兽为前锋，其齿可噬金石，其爪可裂山岳。兵败之后，食铁兽遁入蜀山，褪去战意，化为黑白之色，与竹为伴。如今世人只知其为"大熊猫"，殊不知在上古时代，它曾是令天地变色的战兽。成都武侯祠旁的竹林中，偶尔能听到金属碰撞之声，老人们说那是食铁兽在磨牙。'
    },
    {
      id: 'fuzhu',
      name: '夫诸',
      description: '《山海经·中次三经》："中次三经萯山之首，曰敖岸之山……有兽焉，其状如白鹿而四角，名曰夫诸，见则其邑大水。"',
      descriptionModern: '外形像白鹿，长有四只角，它出现的地方就会发生大水。夫诸是水患的预兆，也是古代先民对洪水敬畏的化身。',
      rarity: '稀有',
      region: 'nanshan',
      element: '水',
      lore: '夫诸居于南海之滨，通体雪白如玉，四角晶莹剔透，行于水面如履平地。每当夫诸仰天长鸣，三日之内必有暴雨倾盆。上古大洪水时，夫诸曾引导鲧前往取息壤治水。鲧窃息壤失败后，夫诸悲鸣三日，泪水化为江河。后大禹继父之志，夫诸再现，引禹循水路而治。三亚天涯海角处，渔民们至今相信，海雾弥漫时若见白鹿踏浪而来，便是夫诸在警示风浪将至。'
    },
    {
      id: 'xiangliu',
      name: '相柳',
      description: '《山海经·海外北经》："共工之臣曰相柳氏，九首，以食于九山。相柳之所抵，厥为泽溪。"',
      descriptionModern: '共工的臣子相柳，有九个头，每个头各吃一座山上的食物。它所经过的地方都会变成沼泽，水味苦涩，人兽不能居住。',
      rarity: '传说',
      region: 'nanshan',
      element: '水',
      lore: '相柳乃上古凶兽，蛇身九首，每首皆有人面，食于九山之间。其所吐之水，化为毒泽，草木不生，飞鸟不至。大禹治水时，与相柳大战三日三夜，终将其斩杀。然相柳之血腥臭不灭，流过之处五谷不生。大禹三次填平其地，三次塌陷，遂建众帝之台以镇之。桂林漓江两岸的奇峰异洞，传说便是相柳挣扎时九首撞出的痕迹。'
    },
    {
      id: 'binglong',
      name: '冰龙',
      description: '《山海经·中次十二经》："又东北二百里，曰天池之山……有兽焉，其状如兔而鼠首，以其背飞，名曰飞鼠。渟水出焉，潜于其下。"',
      descriptionModern: '冰龙并非《山海经》原文直载，而是北方冰雪神话与山海经体系的融合产物。传说北荒极寒之地有冰龙蛰伏，鳞甲如冰晶，吐息成霜雪。',
      rarity: '传说',
      region: 'beishan',
      element: '冰',
      lore: '北荒尽头，有山名曰不咸，其巅终年积雪，云雾缭绕。山巅之下有深渊，冰龙盘踞其中，已历万年。冰龙通体透明如水晶，鳞甲折射日光时，整座雪山都会绽放七彩光芒。它每百年苏醒一次，苏醒时呼出的寒气化为暴风雪，笼罩千里。然冰龙并非恶兽，它守护着北方的冰封之灵，若非冰龙镇压严寒，北地早已化为永冻荒原。哈尔滨的冰雕之所以晶莹剔透，传说便是工匠们暗中参悟了冰龙鳞甲的纹路。'
    },
    {
      id: 'zhulong',
      name: '烛龙',
      description: '《山海经·大荒北经》："西北海之外，赤水之北，有章尾山。有神，人面蛇身而赤，直目正乘，其瞑乃晦，其视乃明，不食不寝不息，风雨是谒。是烛九阴，是谓烛龙。"',
      descriptionModern: '人面蛇身，通体赤红，眼睛竖着长。它闭上眼睛就是黑夜，睁开眼睛就是白昼，不吃不喝不休息，能召唤风雨。它就是烛龙，又名烛九阴。',
      rarity: '绝版',
      region: 'xishan',
      element: '光',
      lore: '烛龙居于西北极远之地的章尾山，乃天地间最古老的神灵之一。它的呼吸便是四季更替——呼为夏，吸为冬；它的眼眸便是昼夜轮转——睁为昼，闭为夜。烛龙不饮不食不寝不息，以自身之光照亮幽冥。传说天地初开时，烛龙衔火而行，照亮了混沌中的第一缕光明。后盘古开天辟地，烛龙退居极北，将光明之责托付于日月。乌鲁木齐的夜空偶有极光闪烁，牧民们说那是烛龙在遥远的章尾山睁开了眼。'
    },
    {
      id: 'bize',
      name: '白泽',
      description: '《轩辕本纪》："帝巡狩，至海滨，得白泽神兽。能言，达于万物之情，因问天下鬼神之事，自古精气为物、游魂为变者，凡万一千五百二十种，白泽言之。"',
      descriptionModern: '白泽是通晓天下鬼神万物之情的神兽，能说人话。黄帝巡狩至海滨时遇到白泽，白泽将天下一万一千五百二十种妖怪的形貌和名称一一告知黄帝。',
      rarity: '传说',
      region: 'beishan',
      element: '光',
      lore: '白泽乃万兽之灵，通晓天地间一切精怪鬼魅。其形如狮，身有六目，背生双翼，通体雪白，周身笼罩祥光。黄帝东巡至海滨，白泽自海中跃出，伏于帝前，口吐人言，将天下万种精怪之名目、形貌、弱点一一述说。黄帝命人记录成册，是为《白泽图》，天下遂知驱邪之法。白泽后化为黄帝的向导，随帝征战四方。故宫之中至今藏有白泽图卷，据说每逢月圆之夜，画卷上的白泽会微微转动六目，巡视宫中是否有邪祟潜伏。'
    },
    {
      id: 'haishenyuxiao',
      name: '海神禺猇',
      description: '《山海经·大荒北经》："北海之渚中，有神，人面鸟身，珥两青蛇，践两赤蛇，名曰禺猇。"',
      descriptionModern: '北海的岛屿上有一位海神，长着人的面孔和鸟的身体，耳朵上挂着两条青蛇，脚下踩着两条红蛇，名叫禺猇。',
      rarity: '绝版',
      region: 'dongshan',
      element: '水',
      lore: '禺猇乃北海之主，统御四海潮汐。其形人面鸟身，双耳各悬一条青蛇为饰，双足各踏一条赤蛇为履。禺猇一声长啸，四海翻涌；一展双翼，狂风骤起。上古时代，禺猇与东海海神禺虢共同治理海域，维持天下水脉平衡。每逢中秋之夜，禺猇会浮出海面，月光在其羽翼上流转，海面便会出现万丈银光。上海的渔民传说，黄浦江入海口深处有禺猇的神殿，江水之所以日夜奔流不息，便是因禺猇在殿中击鼓调度潮汐。'
    },
    {
      id: 'gudiao',
      name: '蛊雕',
      description: '《山海经·南次三经》："鹿吴之山，上无草木，多金石。泽更之水出焉，而南流注于滂水。水有兽焉，其状如雕而有角，其音如婴儿之音，是食人。"',
      descriptionModern: '外形像雕，头上长有角，叫声像婴儿啼哭，会吃人。蛊雕是上古水泽中的凶猛异兽。',
      rarity: '稀有',
      region: 'dongshan',
      element: '风',
      lore: '蛊雕栖于东南沿海的礁石之上，平日蛰伏不动，形如石雕。待有猎物接近，便猛然展翅，双翼展开足有数丈之宽。蛊雕最诡诈之处在于其声——能发出婴儿啼哭之声，引人心生怜悯而靠近，随即被其利爪攫入空中。厦门鼓浪屿的礁石群中，海风穿过洞穴时常发出呜咽之声，当地人称之为"鬼哭石"，传说那便是蛊雕后裔在练习啼哭之术。'
    },
    {
      id: 'dijiang',
      name: '帝江',
      description: '《山海经·西山经》："又西三百五十里，曰天山，多金玉，有青雄黄。英水出焉，而西南流注于汤谷。有神焉，其状如黄囊，赤如丹火，六足四翼，浑敦无面目，是识歌舞，实惟帝江也。"',
      descriptionModern: '形状像一个黄色口袋，红得像一团火，有六只脚和四只翅膀，没有面目，却懂得唱歌跳舞，它就是帝江。',
      rarity: '传说',
      region: 'nanshan',
      element: '混沌',
      lore: '帝江乃混沌之神，其形浑圆如囊，无眼无鼻无口无耳，却通晓天地间一切音律歌舞。帝江虽无面目，却能感知万物。它六足踏地，四翼御风，所到之处百鸟齐鸣、万兽共舞。庄子所言"浑沌凿窍"之典故，便源于帝江。南海之帝与北海之帝为报帝江之德，为其日凿一窍，七日而帝江死，混沌遂开，天地始分。长沙岳麓山下有帝江祠，据说每逢祭祀之时，虽无乐师演奏，祠中却自然响起悠扬乐声。'
    },
    {
      id: 'luwu',
      name: '陆吾',
      description: '《山海经·西山经》："昆仑之丘，是实惟帝之下都。神陆吾司之，其神状虎身而九尾，人面而虎爪。是神也，司天之九部及帝之囿时。"',
      descriptionModern: '陆吾是昆仑山的守护神，长着虎的身体和九条尾巴，人的面孔和虎的爪子。它掌管天上的九个区域和天帝的苑圃时令。',
      rarity: '传说',
      region: 'xishan',
      element: '土',
      lore: '陆吾乃昆仑山之主神，虎身九尾，人面虎爪，威严无比。昆仑山是天帝在人间的下都，陆吾便是这座神山的总管。它不仅掌管昆仑山上的奇花异草、珍禽异兽，还司天之九部——即天上九个区域的时令节气。陆吾一声怒吼，昆仑山上的积雪便会震落，化为江河奔流而下。西安作为古都，正对应着昆仑山在人间的影响力。据说秦始皇陵地宫中的水银江河，便是仿陆吾所掌管的昆仑水系而建。'
    },
    {
      id: 'xwangmu',
      name: '西王母',
      description: '《山海经·西山经》："玉山，是西王母所居也。西王母其状如人，豹尾虎齿而善啸，蓬发戴胜，是司天之厉及五残。"',
      descriptionModern: '西王母住在玉山，形状像人，长着豹子的尾巴和老虎的牙齿，善于长啸，头发蓬松戴着玉饰。她掌管天上的灾厉和五刑残杀之气。',
      rarity: '绝版',
      region: 'xishan',
      element: '金',
      lore: '西王母是山海经中最尊贵的女神，居于昆仑之西的玉山之上。在上古神话中，西王母最初的形象并非后世雍容华贵的王母娘娘，而是一位威猛的半人半兽女神——豹尾虎齿，蓬发戴胜，掌管瘟疫与刑罚。后羿曾西上昆仑，向西王母求得不死之药。周穆王驾八骏西巡，与西王母瑶池相会，留下千古佳话。拉萨布达拉宫所在的红山，传说便是西王母在人间的一处行宫。每逢藏历新年，高原上的阳光格外灿烂，藏民们相信那是西王母在瑶池中沐浴时洒落的光辉。'
    },
    {
      id: 'kuafu',
      name: '夸父',
      description: '《山海经·海外北经》："夸父与日逐走，入日。渴，欲得饮，饮于河、渭，河、渭不足，北饮大泽。未至，道渴而死。弃其杖，化为邓林。"',
      descriptionModern: '夸父与太阳竞跑，一直追赶到太阳落下的地方。他口渴了，想要喝水，就喝黄河、渭水，不够喝，又向北去喝大泽的水。还没走到，就在半路上渴死了。他死时丢弃的手杖，化作了一片桃林。',
      rarity: '传说',
      region: 'beishan',
      element: '火',
      lore: '夸父乃北方大荒中的巨人族首领，身长千丈，力能拔山。他不甘心太阳每日西落、黑暗降临，立志追上太阳，让光明永驻人间。于是他迈开双腿，追逐太阳的踪迹，跨越千山万水。黄河、渭水被他一口气喝干，仍不解渴。最终在通往大泽的路上倒下，化为一片广袤的桃林——邓林，为后来的追梦者提供阴凉与果实。呼和浩特草原上的牧民，在日落时分向西眺望，说那地平线上最后一个光点，便是夸父仍在奔跑的身影。'
    }
  ];

  /* ================================================================
   *  四、成就数据 (achievements)
   * ================================================================ */
  const achievements = [
    {
      id: 'ach_churushanhai',
      name: '初入山海',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>',
      description: '踏出第一步，山海之门为你而开',
      condition: '首次打卡任意城市',
      reward: { exp: 100, title: '山海行者' },
      check: function (player) {
        return player.cities.length >= 1;
      }
    },
    {
      id: 'ach_shishentaotie',
      name: '食神饕餮',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path></svg>',
      description: '饕餮尚且不如你，天下美食尽入囊中',
      condition: '累计上传50张美食照片',
      reward: { exp: 500, title: '饕餮传人' },
      check: function (player) {
        return (player.foodPhotos && player.foodPhotos.length) >= 50;
      }
    },
    {
      id: 'ach_kuafuzhuiri',
      name: '夸父追日',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/></svg>',
      description: '追日的脚步永不停歇，两千里不过是起点',
      condition: '连续两天打卡且累计行程超过2000公里',
      reward: { exp: 800, title: '追日行者' },
      check: function (player) {
        // 需外部逻辑计算连续打卡天数与距离，此处为简化判断
        return player._consecutiveDays >= 2 && player._totalDistance >= 2000;
      }
    },
    {
      id: 'ach_dayuzhishui',
      name: '大禹治水',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M2 18h20"/></svg>',
      description: '循水而行，踏遍江河湖海，堪比大禹之功',
      condition: '完成所有沿海城市及长江、黄河核心城市打卡',
      reward: { exp: 1000, title: '治水英雄' },
      check: function (player) {
        var required = [
          'dalian', 'qingdao', 'shanghai', 'xiamen', 'guangzhou', 'shenzhen',
          'haikou', 'sanya', 'wuhan', 'nanjing', 'zhengzhou', 'jinan'
        ];
        return required.every(function (cid) {
          return player.cities.indexOf(cid) !== -1;
        });
      }
    },
    {
      id: 'ach_wuyueguilai',
      name: '五岳归来',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3l4 8 5-5 5 15H2L8 3z"/></svg>',
      description: '五岳归来不看山，黄山归来不看岳',
      condition: '打卡五岳所在城市：泰安（泰山）、华山（华阴）、衡山（衡阳）、恒山（大同）、嵩山（登封）',
      reward: { exp: 600, title: '五岳散人' },
      check: function (player) {
        // 五岳对应城市：泰山-济南(山东)、华山-西安(陕西)、衡山-长沙(湖南)、恒山-太原(山西)、嵩山-郑州(河南)
        var wuyue = ['jinan', 'xian', 'changsha', 'taiyuan', 'zhengzhou'];
        return wuyue.every(function (cid) {
          return player.cities.indexOf(cid) !== -1;
        });
      }
    },
    {
      id: 'ach_sihaihuang',
      name: '四海八荒',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>',
      description: '足迹遍布四海八荒，天下之大尽在脚下',
      condition: '解锁全部四个基础区域（东山经、西山经、南山经、北山经）',
      reward: { exp: 1200, title: '八荒旅人' },
      check: function (player) {
        var baseRegions = ['dongshan', 'xishan', 'nanshan', 'beishan'];
        var unlocked = baseRegions.filter(function (rid) {
          return player.unlockedRegions && player.unlockedRegions.indexOf(rid) !== -1;
        });
        return unlocked.length >= 4;
      }
    },
    {
      id: 'ach_tianxiadatong',
      name: '天下大同',
      icon: '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
      description: '九州万国，尽归一统。你已点亮华夏大地的每一寸山河',
      condition: '打卡全部城市',
      reward: { exp: 5000, title: '山海至尊' },
      check: function (player) {
        return player.cities.length >= cities.length;
      }
    }
  ];

  /* ================================================================
   *  五、卡牌数据 (cards)
   * ================================================================ */
  const cards = [
    {
        id: 'card_chenghuang_wuhan',
        cityId: 'wuhan',
        beastId: 'chenghuang',
        name: '黄鹤乘黄',
        quote: '有乘黄，其状如狐，其背上有角，乘之寿二千岁。——《海外西经》',
        rarity: '稀有',
        frameStyle: 'bronze',
        image: 'assets/images/cards/058af9032582d3dedca29ea07a516c24.png'
    },
    {
        id: 'card_jiuweihu_hangzhou',
        cityId: 'hangzhou',
        beastId: 'jiuweihu',
        name: '青丘狐影',
        quote: '青丘之山，有兽焉，其状如狐而九尾，其音如婴儿。——《南山经》',
        rarity: '传说',
        frameStyle: 'gold',
        image: 'assets/images/cards/229d1e525b194c0f4ebd1983acbd24fc.png'
    },
    {
        id: 'card_bifang_kunming',
        cityId: 'kunming',
        beastId: 'bifang',
        name: '滇池毕方',
        quote: '有鸟焉，其状如鹤，一足，赤文青质而白喙，名曰毕方。——《西山经》',
        rarity: '稀有',
        frameStyle: 'bronze',
        image: 'assets/images/cards/48877e1bb7ec4eea054f37f8dd1548e0.png'
    },
    {
        id: 'card_shitishou_chengdu',
        cityId: 'chengdu',
        beastId: 'shitishou',
        name: '蜀山铁兽',
        quote: '有兽焉，其状如熊而黑白文，名曰食铁兽。——《中山经》',
        rarity: '普通',
        frameStyle: 'wood',
        image: 'assets/images/cards/8ffd682c831014c65a98d2157cf41b01.png'
    },
    {
        id: 'card_fuzhu_sanya',
        cityId: 'sanya',
        beastId: 'fuzhu',
        name: '天涯白鹿',
        quote: '有兽焉，其状如白鹿而四角，名曰夫诸，见则其邑大水。——《中次三经》',
        rarity: '稀有',
        frameStyle: 'bronze',
        image: 'assets/images/cards/9aa3362750269828ac3248256904ed0a.png'
    },
    {
        id: 'card_xiangliu_guilin',
        cityId: 'guilin',
        beastId: 'xiangliu',
        name: '漓江九首',
        quote: '共工之臣曰相柳氏，九首，以食于九山。——《海外北经》',
        rarity: '传说',
        frameStyle: 'gold',
        image: 'assets/images/cards/baef10d9dc106c04e4eb618ebeff6f14.png'
    },
    {
        id: 'card_binglong_haerbin',
        cityId: 'haerbin',
        beastId: 'binglong',
        name: '冰城龙吟',
        quote: '北荒极寒之地，有冰龙蛰伏，鳞甲如冰晶，吐息成霜雪。——北荒传说',
        rarity: '传说',
        frameStyle: 'silver',
        image: 'assets/images/cards/df2c981a8edb5255b891458bdf2ee2a6.png'
    },
    {
        id: 'card_zhulong_wulumuqi',
        cityId: 'wulumuqi',
        beastId: 'zhulong',
        name: '天山烛照',
        quote: '其瞑乃晦，其视乃明，不食不寝不息，风雨是谒。是烛九阴。——《大荒北经》',
        rarity: '绝版',
        frameStyle: 'diamond',
        image: 'assets/images/cards/ea85b806a6968484b8b7e35b75f8f101.png'
    },
    {
        id: 'card_bize_beijing',
        cityId: 'beijing',
        beastId: 'bize',
        name: '紫禁白泽',
        quote: '帝巡狩，至海滨，得白泽神兽。能言，达于万物之情。——《轩辕本纪》',
        rarity: '传说',
        frameStyle: 'gold',
        image: 'assets/images/cards/ef4c2625b3bb299b9cef9f1dcbe783f5.png'
    },
    {
        id: 'card_haishenyuxiao_shanghai',
        cityId: 'shanghai',
        beastId: 'haishenyuxiao',
        name: '浦江海神',
        quote: '北海之渚中，有神，人面鸟身，珥两青蛇，践两赤蛇，名曰禺猇。——《大荒北经》',
        rarity: '绝版',
        frameStyle: 'diamond',
        image: 'assets/images/cards/f98962050794647c3111b319cf565aa8.png'
    },
    {
        id: 'card_gudiao_xiamen',
        cityId: 'xiamen',
        beastId: 'gudiao',
        name: '鼓浪雕鸣',
        quote: '水有兽焉，其状如雕而有角，其音如婴儿之音，是食人。——《南次三经》',
        rarity: '稀有',
        frameStyle: 'bronze',
        image: 'assets/images/cards/058af9032582d3dedca29ea07a516c24.png'
    },
    {
        id: 'card_dijiang_changsha',
        cityId: 'changsha',
        beastId: 'dijiang',
        name: '岳麓帝江',
        quote: '其状如黄囊，赤如丹火，六足四翼，浑敦无面目，是识歌舞，实惟帝江也。——《西山经》',
        rarity: '传说',
        frameStyle: 'gold',
        image: 'assets/images/cards/229d1e525b194c0f4ebd1983acbd24fc.png'
    }
];

  /* ================================================================
   *  六、玩家初始数据 (defaultPlayerData)
   * ================================================================ */
  const defaultPlayerData = {
    name: '旅人',
    level: 1,
    exp: 0,
    maxExp: 200,                 // 升级所需经验（1级→2级）
    cities: [],                   // 已打卡城市 id 数组
    cards: [],                    // 已获得卡牌 id 数组
    achievements: [],             // 已达成成就 id 数组
    unlockedRegions: [],          // 已解锁区域 id 数组
    foodPhotos: [],               // 美食照片 [{cityId, url, timestamp, description}]
    travelPhotos: [],             // 旅行照片 [{cityId, url, timestamp, description}]
    ticketPhotos: [],             // 车票/机票照片 [{from, to, url, timestamp}]
    checkInRecords: [],           // 打卡记录 [{cityId, timestamp, lat, lng}]
    _consecutiveDays: 0,          // 连续打卡天数（内部计算用）
    _totalDistance: 0,            // 累计旅行距离（内部计算用，单位：公里）
    settings: {
      theme: 'classic',           // classic / dark / ink
      language: 'zh-CN',
      notifications: true,
      autoSave: true,
      mapStyle: 'parchment',      // parchment / ink / modern
      musicEnabled: false,
      soundEnabled: true
    },
    createdAt: null,              // 首次创建时间戳
    lastSaveAt: null              // 最后保存时间戳
  };

  /* ================================================================
   *  七、稀有度配色 & 卡框样式映射
   * ================================================================ */
  const rarityConfig = {
    '普通': { color: '#8B7355', bgColor: '#F5F0E8', label: '凡品', glow: false },
    '稀有': { color: '#CD7F32', bgColor: '#FFF8F0', label: '稀有', glow: true },
    '传说': { color: '#FFD700', bgColor: '#FFFDF0', label: '传说', glow: true },
    '绝版': { color: '#E040FB', bgColor: '#FDF0FF', label: '绝版', glow: true }
  };

  const frameStyles = {
    wood:    { border: '4px solid #8B7355', shadow: '0 2px 8px rgba(139,115,85,0.3)' },
    bronze:  { border: '4px solid #CD7F32', shadow: '0 2px 12px rgba(205,127,50,0.4)' },
    silver:  { border: '4px solid #C0C0C0', shadow: '0 2px 16px rgba(192,192,192,0.5)' },
    gold:    { border: '4px solid #FFD700', shadow: '0 4px 20px rgba(255,215,0,0.5)' },
    diamond: { border: '4px solid #E040FB', shadow: '0 4px 24px rgba(224,64,251,0.6)' }
  };

  /* ================================================================
   *  八、等级经验表 (levelExpTable)
   * ================================================================ */
  const levelExpTable = [];
  for (var i = 0; i < 100; i++) {
    levelExpTable.push(i * 100);
  }

  /* ================================================================
   *  九、经验值来源配置 (expSources)
   * ================================================================ */
  const expSources = {
    checkIn:        { exp: 100,  label: '城市打卡' },
    photoUpload:    { exp: 20,  label: '上传照片' },
    foodPhoto:      { exp: 15,  label: '美食记录' },
    ticketRecord:   { exp: 30,  label: '行程记录' },
    cardCollect:    { exp: 100, label: '收集卡牌' },
    achievement:    { exp: 0,   label: '成就奖励（各不相同）' },
    dailyLogin:     { exp: 10,  label: '每日登录' },
    firstVisit:     { exp: 200, label: '首次到访新城市' },
    beastEncounter: { exp: 300, label: '神兽邂逅' }
  };

  /* ================================================================
   *  十、五岳数据 (fiveSacredMountains)
   * ================================================================ */
  const fiveSacredMountains = [
    { name: '泰山', cityId: 'jinan',  province: '山东', direction: '东岳', description: '泰山之尊，五岳独尊。自古帝王封禅之地，天下第一山。' },
    { name: '华山', cityId: 'xian',   province: '陕西', direction: '西岳', description: '华山之险，天下第一。奇峰突兀，壁立千仞，自古一条路。' },
    { name: '衡山', cityId: 'changsha', province: '湖南', direction: '南岳', description: '衡山之秀，五岳独秀。祝融峰上观云海，南天门下听松涛。' },
    { name: '恒山', cityId: 'taiyuan', province: '山西', direction: '北岳', description: '恒山之奇，悬空寺绝壁而立，金龙峡碧水长流。' },
    { name: '嵩山', cityId: 'zhengzhou', province: '河南', direction: '中岳', description: '嵩山之中，天地之中。少林禅武，中岳庙古，嵩阳书院传千年。' }
  ];

  /* ================================================================
   *  十一、工具函数
   * ================================================================ */
  const utils = {
    /**
     * 根据 id 获取城市
     * @param {string} id
     * @returns {Object|undefined}
     */
    getCityById: function (id) {
      return cities.find(function (c) { return c.id === id; });
    },

    /**
     * 根据 id 获取神兽
     * @param {string} id
     * @returns {Object|undefined}
     */
    getBeastById: function (id) {
      return beasts.find(function (b) { return b.id === id; });
    },

    /**
     * 根据 id 获取卡牌
     * @param {string} id
     * @returns {Object|undefined}
     */
    getCardById: function (id) {
      return cards.find(function (c) { return c.id === id; });
    },

    /**
     * 根据 id 获取区域
     * @param {string} id
     * @returns {Object|undefined}
     */
    getRegionById: function (id) {
      return regions.find(function (r) { return r.id === id; });
    },

    /**
     * 获取某区域下的所有城市
     * @param {string} regionId
     * @returns {Array}
     */
    getCitiesByRegion: function (regionId) {
      return cities.filter(function (c) { return c.region === regionId; });
    },

    /**
     * 获取某省份的所有城市
     * @param {string} province
     * @returns {Array}
     */
    getCitiesByProvince: function (province) {
      return cities.filter(function (c) { return c.province === province; });
    },

    /**
     * 获取某城市关联的卡牌
     * @param {string} cityId
     * @returns {Array}
     */
    getCardsByCity: function (cityId) {
      return cards.filter(function (c) { return c.cityId === cityId; });
    },

    /**
     * 获取某神兽关联的卡牌
     * @param {string} beastId
     * @returns {Array}
     */
    getCardsByBeast: function (beastId) {
      return cards.filter(function (c) { return c.beastId === beastId; });
    },

    /**
     * 根据等级获取所需累计经验
     * @param {number} level
     * @returns {number}
     */
    getExpForLevel: function (level) {
      if (level <= 0) return 0;
      if (level >= levelExpTable.length) return levelExpTable[levelExpTable.length - 1];
      return levelExpTable[level - 1] || 0;
    },

    /**
     * 根据当前经验计算等级
     * @param {number} exp
     * @returns {{level: number, currentExp: number, nextLevelExp: number}}
     */
    calcLevel: function (exp) {
      var level = 1;
      for (var i = 0; i < levelExpTable.length; i++) {
        if (exp >= levelExpTable[i]) {
          level = i + 1;
        } else {
          break;
        }
      }
      var currentLevelExp = levelExpTable[level - 1];
      var nextLevelExp = levelExpTable[level] || levelExpTable[levelExpTable.length - 1];
      return {
        level: level,
        currentExp: exp - currentLevelExp,
        nextLevelExp: nextLevelExp - currentLevelExp
      };
    },

    /**
     * 检查并返回新达成的成就
     * @param {Object} playerData
     * @returns {Array} 新达成的成就列表
     */
    checkAchievements: function (playerData) {
      var newAch = [];
      achievements.forEach(function (ach) {
        if (playerData.achievements.indexOf(ach.id) === -1 && ach.check(playerData)) {
          newAch.push(ach);
        }
      });
      return newAch;
    },

    /**
     * 获取稀有度配置
     * @param {string} rarity
     * @returns {Object}
     */
    getRarityConfig: function (rarity) {
      return rarityConfig[rarity] || rarityConfig['普通'];
    },

    /**
     * 获取卡框样式
     * @param {string} style
     * @returns {Object}
     */
    getFrameStyle: function (style) {
      return frameStyles[style] || frameStyles['wood'];
    },

    /**
     * 深拷贝玩家初始数据
     * @returns {Object}
     */
    createNewPlayer: function () {
      var player = JSON.parse(JSON.stringify(defaultPlayerData));
      player.createdAt = Date.now();
      player.lastSaveAt = Date.now();
      return player;
    }
  };

  /* ================================================================
   *  十二、全局挂载
   * ================================================================ */
  window.GameData = {
    // 核心数据
    cities: cities,
    beasts: beasts,
    achievements: achievements,
    cards: cards,
    regions: regions,
    defaultPlayerData: defaultPlayerData,

    // 配置数据
    rarityConfig: rarityConfig,
    frameStyles: frameStyles,
    levelExpTable: levelExpTable,
    expSources: expSources,
    fiveSacredMountains: fiveSacredMountains,

    // 工具函数
    utils: utils,

    // 版本号
    version: '1.0.0'
  };

})();
