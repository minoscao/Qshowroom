import {getCountry} from './country-presets.js';

// Demonstration content only. One locale supplies every device and overhead screen.
export const SCREEN_LOCALES={
 au:{currency:'AUD',locale:'en-AU',city:'AUSTRALIA',bg:'#f3f7f1',ink:'#153f39',panel:'#dcebe3',titles:['COFFEE & BITES','READY TO COLLECT','KITCHEN ORDERS','PARK TICKETS','MAKE A DAY OF IT'],food:['Flat white','Iced latte','Chicken toastie','Family snack set'],foodPrices:[5,6,12,28],tickets:['Child admission','Adult + child','Family pass'],ticketPrices:[28,40,72],ready:'Collect at counter',preparing:'Preparing',pay:'PAY NOW',order:'PLACE ORDER',demo:'DEMO · SAMPLE PRICES',ad:['Play together. Make memories.','Birthday parties','Family fun, all day'],topup:'Game card top-up'},
 ae:{currency:'AED',locale:'ar-AE',city:'دبي / DUBAI',rtl:true,bg:'#101e27',ink:'#fff2d5',panel:'#243640',titles:['القهوة والوجبات','طلبات جاهزة للاستلام','طلبات المطبخ','تذاكر الدخول','عالم من المرح'],food:['لاتيه بالهيل','قهوة عربية','ساندويتش دجاج','وجبة عائلية'],foodPrices:[24,20,38,95],tickets:['تذكرة طفل','بالغ وطفل','تذكرة عائلية'],ticketPrices:[85,120,220],ready:'الاستلام من المنضدة',preparing:'قيد التحضير',pay:'ادفع الآن',order:'اطلب الآن',demo:'عرض توضيحي · أسعار تجريبية',ad:['لحظات مميزة لكل العائلة','حفلات أعياد الميلاد','العب واكتشف'],topup:'شحن بطاقة الألعاب'},
 us:{currency:'USD',locale:'en-US',city:'UNITED STATES',bg:'#091e40',ink:'#ffffff',panel:'#183a69',titles:['COFFEE & SNACKS','PICK UP HERE','KITCHEN ORDERS','TICKETS & PASSES','BIG PLAY. BIG SMILES.'],food:['Americano','Iced latte','Chicken sandwich','Family combo'],foodPrices:[4,6,10,25],tickets:['Kids play pass','Adult + child','Family pass'],ticketPrices:[25,38,68],ready:'Ready at the counter',preparing:'Preparing',pay:'PAY NOW',order:'ORDER NOW',demo:'DEMO · SAMPLE PRICES',ad:['Your next family adventure','Celebrate your birthday','Play more. Smile more.'],topup:'Game card top-up'},
 jp:{currency:'JPY',locale:'ja-JP',city:'日本 / JAPAN',bg:'#fff7f8',ink:'#55384d',panel:'#f3e3ea',titles:['カフェメニュー','お受け取り','キッチン注文','入場チケット','あそびで、笑顔に。'],food:['抹茶ラテ','カフェラテ','たまごサンド','ファミリーセット'],foodPrices:[550,500,650,1800],tickets:['こどもチケット','おとな＋こども','ファミリーパス'],ticketPrices:[1800,2600,4800],ready:'カウンターへお越しください',preparing:'調理中',pay:'お支払いへ',order:'注文する',demo:'デモ表示・参考価格',ad:['家族みんなで楽しもう','お誕生日のお祝いに','あそびと発見がいっぱい'],topup:'ゲームカードチャージ'}
};
export function getScreenContent(id,kind){
 const p=getCountry(id),d=SCREEN_LOCALES[p.id];
 const money=n=>new Intl.NumberFormat(d.locale,{style:'currency',currency:d.currency,maximumFractionDigits:0}).format(n);
 const food=d.food.map((name,i)=>[name,money(d.foodPrices[i])]),tickets=d.tickets.map((name,i)=>[name,money(d.ticketPrices[i])]);
 const content={menu:{title:d.titles[0],rows:food},food:{title:d.titles[0],rows:food,action:d.order},pickup:{title:d.titles[1],rows:[['A018',d.ready],['A021',d.ready],[d.preparing,'A022 · A023']]},kitchen:{title:d.titles[2],rows:[['A022',d.food[1]+' × 2'],['A023',d.food[2]+' × 1'],[d.preparing,'02']]},ticket:{title:d.titles[3],rows:tickets},ticketOrder:{title:d.titles[3],rows:tickets,action:d.pay},topup:{title:d.topup,rows:[10,25,50].map(n=>[money(d.currency==='JPY'?n*100:n),'＋']),action:d.pay},advert:{title:d.titles[4],rows:d.ad.map(s=>[s,''])}};
 return {...d,...content[kind],accent:p.color,kind};
}

export const SCREEN_THEMES={
 au:{name:'OUTBACK EXPLORERS',bg:'#073d38',panel:'#125a4c',accent:'#ffcc58'},
 ae:{name:'واحة المغامرات',bg:'#101a2b',panel:'#233443',accent:'#eec269'},
 us:{name:'ALL-STAR PLAY PARK',bg:'#10295e',panel:'#1f4380',accent:'#ffcc24'},
 jp:{name:'さくらプレイランド',bg:'#422047',panel:'#703759',accent:'#ffb8d9'}
};
export function createScreenContent(canvasTexture,{loadImage}={}){
 const entries=[],images=new Map();let selected='au';
 function asset(src){if(images.has(src))return images.get(src);if(loadImage){const img=loadImage(src);images.set(src,img);return img;}if(typeof Image==='undefined')return null;
  const img=new Image();images.set(src,img);img.onload=()=>{for(const e of entries)paint(e.t,selected,e.kind);};img.onerror=()=>console.warn('Screen image could not load:',src);img.src=src;return img;
 }
 function cover(c,img,x,y,w,h,tile=null){if(!img?.complete||!img.naturalWidth)return;
  let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;
  if(tile!==null){sw/=2;sh/=2;sx=(tile%2)*sw;sy=Math.floor(tile/2)*sh;}
  const ratio=Math.max(w/sw,h/sh),cw=w/ratio,ch=h/ratio;
  c.drawImage(img,sx+(sw-cw)/2,sy+(sh-ch)/2,cw,ch,x,y,w,h);
 }
 function paint(t,id,kind){
  const d=getScreenContent(id,kind),theme=SCREEN_THEMES[getCountry(id).id],c=t.image.getContext('2d'),w=t.image.width,h=t.image.height,portrait=h>w,p=w*.04;
  const food=kind==='menu'||kind==='food',park=asset(getCountry(id).image),meal=asset('/assets/menu-'+getCountry(id).id+'.png');
  c.clearRect(0,0,w,h);c.fillStyle=theme.bg;c.fillRect(0,0,w,h);
  const text=(s,x,y,size,max=w-p*2,color='#fff',align=null)=>{c.fillStyle=color;c.font=`700 ${size}px "Segoe UI","Microsoft YaHei",sans-serif`;c.direction=d.rtl?'rtl':'ltr';c.textAlign=align||(d.rtl?'right':'left');c.fillText(s,x,y,max);};
  const left=d.rtl?w-p:p;
  const banner=(height)=>{cover(c,park,0,0,w,height);c.fillStyle='#061022b8';c.fillRect(0,0,w,height);text(theme.name,left,h*.072,Math.min(w*.041,h*.048));text(d.title,left,h*.18,Math.min(w*.077,h*.10));c.fillStyle=theme.accent;c.fillRect(0,height-.008*h,w,.008*h);};
  const footer=()=>text(d.demo,left,h*.973,Math.min(w*.024,h*.030),w-p*2,'#ffffffbb');
  if(food){
   banner(h*.23);
   const cols=portrait?2:4,gap=w*.018,cw=(w-p*2-gap*(cols-1))/cols,ch=portrait?h*.265:h*.59;
   d.rows.forEach(([label,price],i)=>{const col=d.rtl?cols-1-i%cols:i%cols,x=p+col*(cw+gap),y=h*.26+Math.floor(i/cols)*(ch+h*.02);
    c.fillStyle=theme.panel;c.fillRect(x,y,cw,ch);cover(c,meal,x,y,cw,ch*.62,i);
    text(label,d.rtl?x+cw-p*.25:x+p*.25,y+ch*.76,Math.min(cw*.10,h*.044),cw-p*.5,'#fff');
    text(price,d.rtl?x+cw-p*.25:x+p*.25,y+ch*.94,Math.min(cw*.14,h*.065),cw-p*.5,theme.accent);
   });
  }else if(kind==='pickup'||kind==='kitchen'){
   banner(h*.25);
   const cw=(w-p*3)/2;
   for(let i=0;i<2;i++){const x=p+i*(cw+p);c.fillStyle=theme.panel;c.fillRect(x,h*.30,cw,h*.39);
    text(kind==='pickup'?['A018','A021'][i]:['A022','A023'][i],x+cw/2,h*.50,Math.min(cw*.30,h*.20),cw*.9,theme.accent,'center');
    text(kind==='pickup'?d.ready:d.food[i+1],x+cw/2,h*.62,Math.min(cw*.067,h*.052),cw*.92,'#fff','center');
   }
   text(d.preparing+'  A022 · A023',left,h*.84,Math.min(w*.050,h*.075));
  }else if(kind==='advert'){
   cover(c,park,0,0,w,h);const gradient=c.createLinearGradient(0,0,0,h);gradient.addColorStop(0,'#05091655');gradient.addColorStop(1,theme.bg);c.fillStyle=gradient;c.fillRect(0,0,w,h);
   text(theme.name,left,h*.13,Math.min(w*.057,h*.068),w-p*2,theme.accent);
   text(d.title,left,h*.64,Math.min(w*.09,h*.115));text(d.ad[0],left,h*.77,Math.min(w*.041,h*.056));
   text(d.ad[1],left,h*.87,Math.min(w*.037,h*.05),w-p*2,theme.accent);
  }else{
   banner(h*.41);d.rows.forEach(([label,price],i)=>{const y=h*(.44+i*.135);c.fillStyle=theme.panel;c.fillRect(p,y,w-p*2,h*.11);
    text(label,d.rtl?w-p*1.4:p*1.4,y+h*.065,Math.min(w*.04,h*.065),w*.57);
    text(price,d.rtl?p*1.4:w-p*1.4,y+h*.071,Math.min(w*.061,h*.080),w*.30,theme.accent,d.rtl?'left':'right');
   });
  }
  if(d.action){c.fillStyle=theme.accent;c.fillRect(p,h*.875,w-p*2,h*.067);text(d.action,w/2,h*.923,Math.min(w*.049,h*.055),w-p*3,theme.bg,'center');}
  footer();t.needsUpdate=true;
 }
 function texture(kind,w=1600,h=900){const t=canvasTexture(w,h,()=>{});entries.push({t,kind});paint(t,selected,kind);return t;}
 return {texture,setCountry(id){selected=getCountry(id).id;for(const e of entries)paint(e.t,selected,e.kind);},entries};
}
