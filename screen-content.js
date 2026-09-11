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
export function createScreenContent(canvasTexture){
 const entries=[];
 function paint(t,id,kind){const d=getScreenContent(id,kind),c=t.image.getContext('2d'),w=t.image.width,h=t.image.height,portrait=h>w;
  c.clearRect(0,0,w,h);c.fillStyle=d.bg;c.fillRect(0,0,w,h);c.fillStyle=d.panel;c.fillRect(0,0,w,h*.25);c.fillStyle=d.accent;c.fillRect(0,0,w,h*.012);
  const pad=w*.055,body=w-pad*2;const write=(text,y,size,color=d.ink)=>{c.fillStyle=color;c.font=`600 ${size}px "Segoe UI","Microsoft YaHei",sans-serif`;c.direction=d.rtl?'rtl':'ltr';c.textAlign=d.rtl?'right':'left';c.fillText(text,d.rtl?w-pad:pad,y,body);};
  write('PISELL  /  '+d.city,h*.077,Math.min(w*.032,h*.045));
  write(d.title,h*.18,Math.min(w*.068,h*.09));
  const top=h*.29,step=h*.115;
  d.rows.forEach(([name,value],i)=>{const y=top+i*step;c.fillStyle=d.panel;c.fillRect(pad,y,body,step*.83);
   const size=Math.min(w*.040,h*.05);c.font=`500 ${size}px "Segoe UI","Microsoft YaHei",sans-serif`;c.fillStyle=d.ink;c.direction=d.rtl?'rtl':'ltr';c.textAlign=d.rtl?'right':'left';c.fillText(name,d.rtl?w-pad*1.3:pad*1.3,y+step*(portrait?.32:.53),value?body*.61:body*.94);
   if(value){c.fillStyle=d.ink;c.textAlign=d.rtl?'left':'right';c.fillText(value,d.rtl?pad*1.3:w-pad*1.3,y+step*(portrait?.66:.53),body*(portrait?.90:.32));}
  });
  if(d.action){c.fillStyle=d.accent;c.fillRect(pad,h*.80,body,h*.10);c.textAlign='center';c.direction=d.rtl?'rtl':'ltr';c.fillStyle='#081522';c.font=`700 ${Math.min(w*.052,h*.055)}px "Segoe UI","Microsoft YaHei",sans-serif`;c.fillText(d.action,w/2,h*.864,body*.9);}
  write(d.demo,h*.963,Math.min(w*.027,h*.032));t.needsUpdate=true;
 }
 function texture(kind,w=1600,h=900){const t=canvasTexture(w,h,()=>{});entries.push({t,kind});paint(t,'au',kind);return t;}
 return {texture,setCountry(id){for(const {t,kind} of entries)paint(t,id,kind);},entries};
}
