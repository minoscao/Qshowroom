export const COUNTRY_PRESETS=[
 {id:'au',label:'澳洲',name:'澳洲 / AUSTRALIA',color:'#27c9b8',image:'/assets/indoor-au.png',offset:[0,0],repeat:[1,1],entry:'ENTRANCE',exit:'EXIT',headline:'PLAY. EXPLORE. CONNECT.',detail:'AUSTRALIA  ·  ENGLISH  ·  AUD A$',location:[134,-25]},
 {id:'ae',label:'迪拜',name:'迪拜 / DUBAI',color:'#ffb557',image:'/assets/indoor-ae.png',offset:[0,0],repeat:[1,1],entry:'دخول / ENTRY',exit:'خروج / EXIT',headline:'عالم من المرح',detail:'DUBAI  ·  العربية / ENGLISH  ·  AED',location:[55,25]},
 {id:'us',label:'美国',name:'美国 / USA',color:'#458bff',image:'/assets/indoor-us.png',offset:[0,0],repeat:[1,1],entry:'ENTRANCE',exit:'EXIT',headline:'BIG FUN. ONE CONNECTED WORLD.',detail:'USA  ·  ENGLISH  ·  USD $',location:[-100,38]},
 {id:'jp',label:'日本',name:'日本 / JAPAN',color:'#ed85cc',image:'/assets/indoor-jp.png',offset:[0,0],repeat:[1,1],entry:'入口 / ENTRANCE',exit:'出口 / EXIT',headline:'遊びで、世界をつなぐ。',detail:'JAPAN  ·  日本語  ·  JPY ¥',location:[136,36]}
];
export const getCountry=id=>COUNTRY_PRESETS.find(p=>p.id===id)||COUNTRY_PRESETS[0];
