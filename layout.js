// Authoritative geometry is traced from the user's plan, in original image pixels.
// A single conversion is used by the 3D scene, plan view, and navigation.
export const PLAN={scale:.016,origin:[350,430],image:'/assets/展厅-原平面.png',boundary:[[54,746],[650,754],[657,138],[386,134],[385,92],[143,91],[137,323],[54,324]],party:[[151,112],[379,116],[264,312],[151,321]],counterHeight:1,pendantUnderside:2.5,wallHeight:3.2,validation:'needs-review',assumptions:['平面像素比例重建，整体尺度待尺寸图确认','设备为按照片重建的展示外壳，并非原厂CAD']};
export const world=(p,y=0)=>[(p[0]-PLAN.origin[0])*PLAN.scale,y,(p[1]-PLAN.origin[1])*PLAN.scale];
export const ZONES=[
 {id:'all',name:'展厅总览',short:'全景',tag:'空间总览',title:'从平面，走进空间',description:'沿原平面的分区和曲线吧台展开。选择一个区域，查看系统如何通过设备与服务被现场演示。',camera:[-9,11.4,13.4],target:[.2,.45,-.2]},
 {id:'ticket',name:'售票与接待',short:'售票',tag:'入园流程',title:'在吧台开始入园体验',description:'前侧售票吧台的一端连接立面，向厅内弯曲。两套 POS 面向内侧员工，顾客在外侧完成购票与签到。',point:[312,647],camera:[-3.7,2.45,5.7],target:[-.5,1,-.1],viewPoint:[212,648]},
 {id:'cafe',name:'咖啡与轻餐',short:'餐饮',tag:'餐饮流程',title:'买餐、出单、取餐',description:'左侧曲线吧台保留原图落点。操作区布置咖啡机、收银终端与取餐位，让客户看见餐饮操作过程。',point:[175,435],viewPoint:[305,467]},
 {id:'party',name:'Party room',short:'派对',tag:'派对流程',title:'走进正在进行的派对',description:'左后独立派对房保持原有斜边，入口设在临近咖啡吧的隔断处。桌椅、气球与生日场景用于演示签到后的接待。',point:[218,210],viewPoint:[314,327]},
 {id:'gaming',name:'游戏与储值',short:'游戏',tag:'现场体验',title:'充值之后，现场游玩',description:'两台游戏机位于中后部，储值自助机在侧边。设备位置按平面重建，为游戏卡与游玩消费提供体验节点。',point:[486,271],viewPoint:[475,393]},
 {id:'prepare',name:'储物与换鞋',short:'准备',tag:'入园准备',title:'换鞋、存包，做好准备',description:'后侧座椅与右后储物、售卖设备构成准备区。入园导览在这里停留，再进入右侧闸机。',point:[586,188],viewPoint:[552,323]},
 {id:'gates',name:'自助与闸机',short:'入园',tag:'连接真实游乐场',title:'通过闸机，走进游乐场',description:'右侧保留两组闸机，两组之间布置自助服务设备。闸机外是原游乐场区域，展厅与园区在这里相接。',point:[639,455],viewPoint:[539,459]},
];
export const ROUTES={
 entry:{name:'入园流程',color:0x32cbff,path:[[166,782],[184,692],[212,645],[318,503],[546,345],[575,216],[585,330],[623,403],[716,403]],stops:[{title:'从入口进入',text:'左侧宽玻璃入口通往中央公共通道。',at:[168,758],look:[252,623]},{title:'购票',text:'顾客在售票吧台外侧，员工在内侧通过 POS 操作。',at:[212,645],look:[313,654]},{title:'存包与换鞋',text:'沿通道到后部储物柜与换鞋座椅，演示入园准备。',at:[546,289],look:[590,187]},{title:'入闸机',text:'完成核验，从右侧闸机进入相邻游乐场。',at:[574,405],look:[730,405]}]},
 food:{name:'买餐 / 取餐',color:0xffc061,path:[[166,776],[163,611],[203,538],[219,490],[205,466],[209,430]],stops:[{title:'进入餐饮服务区',text:'从入口沿左侧通道来到咖啡吧。',at:[187,594],look:[185,451]},{title:'买餐与出单',text:'在吧台面向工作人员点餐，观察收银与出单。',at:[237,492],look:[173,439]},{title:'取餐',text:'沿同一吧台前往取餐位置，完成餐饮服务演示。',at:[286,410],look:[224,386]}]},
 party:{name:'Check-in / Party',color:0xee82d7,path:[[166,776],[194,668],[247,585],[328,495],[317,372],[264,328],[224,291],[221,218]],stops:[{title:'派对签到',text:'先在售票接待吧台完成到场签到。',at:[216,647],look:[311,651]},{title:'抵达派对房',text:'沿中央通道进入左后方独立 Party room。',at:[294,350],look:[241,279]},{title:'派对现场',text:'房间内的生日布置展示活动接待与餐饮服务。',at:[250,279],look:[207,198]}]},
};
